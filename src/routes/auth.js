import { Router } from "express";
import { getCorrelationId, logAuthAttempt } from "../authAudit.js";
import { config } from "../config.js";
import { exchangeAuthorizationCode } from "../oauthExchange.js";
import { isAllowedRedirectUri, isAllowedReturnUrl } from "../redirectAllowlist.js";
import {
  consumeOAuthState,
  createSession,
  rememberOAuthState,
} from "../sessionStore.js";

export const authRouter = Router();

const setSessionCookie = (res, sessionId) => {
  res.cookie(config.sessionCookieName, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

const missingOAuthConfig = (provider) => {
  const entry = config.oauth[provider];
  return !entry?.clientId;
};

const buildOAuthRedirectUrl = (provider, redirectUri, state) => {
  const entry = config.oauth[provider];
  const url = new URL(entry.authorizeUrl);
  url.searchParams.set("client_id", entry.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  if (provider === "google") {
    url.searchParams.set("scope", "openid email profile");
  }
  if (provider === "facebook") {
    url.searchParams.set("scope", "email");
  }
  if (provider === "apple") {
    url.searchParams.set("response_mode", "form_post");
    url.searchParams.set("scope", "name email");
  }
  return url.toString();
};

authRouter.post("/login", (req, res) => {
  const correlationId = getCorrelationId(req);
  const { email, password } = req.body ?? {};
  const identity =
    typeof email === "string" ? email.toLowerCase() : "unknown";

  if (typeof email !== "string" || typeof password !== "string") {
    logAuthAttempt({
      correlationId,
      method: "password",
      identity,
      outcome: "failure",
    });
    res.status(401).json({ errorMessage: "Email and password are required." });
    return;
  }

  if (config.lockedEmails.has(email.toLowerCase())) {
    logAuthAttempt({
      correlationId,
      method: "password",
      identity,
      outcome: "locked",
    });
    res.status(403).json({ errorMessage: "This account is locked." });
    return;
  }

  if (
    config.demoPassword &&
    email === config.demoEmail &&
    password === config.demoPassword
  ) {
    const sessionId = createSession(email);
    setSessionCookie(res, sessionId);
    logAuthAttempt({
      correlationId,
      method: "password",
      identity,
      outcome: "success",
    });
    res.json({ success: true, sessionEstablished: true });
    return;
  }

  if (process.env.LOGIN_FORCE_500 === "true") {
    logAuthAttempt({
      correlationId,
      method: "password",
      identity,
      outcome: "error",
    });
    res.status(500).json({ errorMessage: "Login failed due to a server error." });
    return;
  }

  logAuthAttempt({
    correlationId,
    method: "password",
    identity,
    outcome: "failure",
  });
  res.status(401).json({ errorMessage: "Invalid email or password." });
});

authRouter.get("/sso/init", (req, res) => {
  const correlationId = getCorrelationId(req);
  const tenantHint =
    typeof req.query.tenantHint === "string" ? req.query.tenantHint : undefined;
  const identity = tenantHint ?? "sso";

  if (!config.ssoEnabled || !config.ssoEntryUrl) {
    logAuthAttempt({
      correlationId,
      method: "sso",
      identity,
      outcome: "failure",
    });
    res.status(502).json({ errorMessage: "SSO is not configured." });
    return;
  }

  const returnUrl =
    typeof req.query.returnUrl === "string" ? req.query.returnUrl : undefined;

  if (returnUrl && !isAllowedReturnUrl(returnUrl, config.ssoReturnUrlAllowlist)) {
    logAuthAttempt({
      correlationId,
      method: "sso",
      identity,
      outcome: "failure",
    });
    res.status(400).json({ errorMessage: "returnUrl is not allowed." });
    return;
  }

  const url = new URL(config.ssoEntryUrl);
  if (returnUrl) {
    url.searchParams.set("returnUrl", returnUrl);
  }
  if (tenantHint) {
    url.searchParams.set("tenantHint", tenantHint);
  }

  logAuthAttempt({
    correlationId,
    method: "sso",
    identity,
    outcome: "success",
  });
  res.json({ redirectUrl: url.toString() });
});

const oauthInitHandler = (provider) => (req, res) => {
  const correlationId = getCorrelationId(req);
  const redirectUri = req.query.redirectUri;
  const state = req.query.state;
  const identity = typeof state === "string" ? state : `oauth-${provider}`;

  if (typeof redirectUri !== "string" || typeof state !== "string") {
    logAuthAttempt({
      correlationId,
      method: `oauth-${provider}`,
      identity,
      outcome: "failure",
    });
    res.status(400).json({ errorMessage: "redirectUri and state are required." });
    return;
  }

  if (!isAllowedRedirectUri(redirectUri, config.oauthRedirectUriAllowlist)) {
    logAuthAttempt({
      correlationId,
      method: `oauth-${provider}`,
      identity,
      outcome: "failure",
    });
    res.status(400).json({ errorMessage: "redirectUri is not allowed." });
    return;
  }

  if (missingOAuthConfig(provider)) {
    logAuthAttempt({
      correlationId,
      method: `oauth-${provider}`,
      identity,
      outcome: "failure",
    });
    res.status(502).json({
      errorMessage: `${provider.charAt(0).toUpperCase()}${provider.slice(1)} OAuth is not configured.`,
    });
    return;
  }

  rememberOAuthState(state, { provider, redirectUri });
  logAuthAttempt({
    correlationId,
    method: `oauth-${provider}`,
    identity,
    outcome: "success",
  });
  res.json({ redirectUrl: buildOAuthRedirectUrl(provider, redirectUri, state) });
};

authRouter.get("/oauth/google", oauthInitHandler("google"));
authRouter.get("/oauth/facebook", oauthInitHandler("facebook"));
authRouter.get("/oauth/apple", oauthInitHandler("apple"));

authRouter.get("/oauth/callback", async (req, res) => {
  const correlationId = getCorrelationId(req);

  const oauthError = req.query.error;
  if (typeof oauthError === "string" && oauthError.length > 0) {
    logAuthAttempt({
      correlationId,
      method: "oauth-callback",
      identity: "unknown",
      outcome: "failure",
    });
    res
      .status(400)
      .json({ errorMessage: "OAuth sign-in was denied or failed. Please try again." });
    return;
  }

  const authorizationCode = req.query.authorizationCode;
  const state = req.query.state;
  const identity = typeof state === "string" ? state : "unknown";

  if (typeof authorizationCode !== "string" || authorizationCode.length === 0) {
    logAuthAttempt({
      correlationId,
      method: "oauth-callback",
      identity,
      outcome: "failure",
    });
    res.status(400).json({ errorMessage: "authorizationCode is required." });
    return;
  }

  if (typeof state !== "string" || state.length === 0) {
    logAuthAttempt({
      correlationId,
      method: "oauth-callback",
      identity,
      outcome: "failure",
    });
    res.status(400).json({ errorMessage: "state is required." });
    return;
  }

  const remembered = consumeOAuthState(state);
  if (!remembered) {
    logAuthAttempt({
      correlationId,
      method: "oauth-callback",
      identity,
      outcome: "failure",
    });
    res.status(401).json({ errorMessage: "Invalid or expired OAuth state." });
    return;
  }

  const exchange = await exchangeAuthorizationCode(
    remembered.provider,
    authorizationCode,
    remembered.redirectUri,
  );
  if (!exchange.ok) {
    logAuthAttempt({
      correlationId,
      method: `oauth-${remembered.provider}`,
      identity,
      outcome: "failure",
    });
    res.status(401).json({ errorMessage: "OAuth authorization could not be verified." });
    return;
  }

  const userId = `oauth-${remembered.provider}@6sensehq.com`;
  const sessionId = createSession(userId);
  setSessionCookie(res, sessionId);
  logAuthAttempt({
    correlationId,
    method: `oauth-${remembered.provider}`,
    identity,
    outcome: "success",
  });
  res.json({ success: true, sessionEstablished: true });
});

authRouter.get("/forgot-password", (req, res) => {
  if (!config.forgotPasswordEnabled) {
    res.status(404).json({ errorMessage: "Password recovery is not available." });
    return;
  }

  if (process.env.FORGOT_PASSWORD_UNAVAILABLE === "true") {
    res.status(503).json({ errorMessage: "Password recovery is temporarily unavailable." });
    return;
  }

  res.json({ recoveryRouteOpened: true });
});
