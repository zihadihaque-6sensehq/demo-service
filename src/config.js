const parseCsv = (value) =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

export const config = {
  port: Number(process.env.PORT ?? 3000),
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "session",
  demoEmail: process.env.DEMO_LOGIN_EMAIL ?? "demo@6sensehq.com",
  demoPassword: process.env.DEMO_LOGIN_PASSWORD,
  oauthRedirectUriAllowlist: new Set(parseCsv(process.env.OAUTH_REDIRECT_URI_ALLOWLIST)),
  ssoReturnUrlAllowlist: new Set(parseCsv(process.env.SSO_RETURN_URL_ALLOWLIST)),
  lockedEmails: new Set(parseCsv(process.env.LOCKED_LOGIN_EMAILS)),
  authStatusUnavailable: process.env.AUTH_STATUS_UNAVAILABLE === "true",
  authStatusTimeoutMs: Number(process.env.AUTH_STATUS_TIMEOUT_MS ?? 0),
  ssoEnabled: process.env.SSO_ENABLED !== "false",
  forgotPasswordEnabled: process.env.FORGOT_PASSWORD_ENABLED !== "false",
  oauth: {
    google: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "demo-google-client",
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      authorizeUrl:
        process.env.GOOGLE_OAUTH_AUTHORIZE_URL ??
        "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl:
        process.env.GOOGLE_OAUTH_TOKEN_URL ??
        "https://oauth2.googleapis.com/token",
    },
    facebook: {
      clientId: process.env.FACEBOOK_OAUTH_CLIENT_ID ?? "demo-facebook-client",
      clientSecret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET,
      authorizeUrl:
        process.env.FACEBOOK_OAUTH_AUTHORIZE_URL ??
        "https://www.facebook.com/v18.0/dialog/oauth",
      tokenUrl:
        process.env.FACEBOOK_OAUTH_TOKEN_URL ??
        "https://graph.facebook.com/v18.0/oauth/access_token",
    },
    apple: {
      clientId: process.env.APPLE_OAUTH_CLIENT_ID ?? "demo-apple-client",
      clientSecret: process.env.APPLE_OAUTH_CLIENT_SECRET,
      authorizeUrl:
        process.env.APPLE_OAUTH_AUTHORIZE_URL ??
        "https://appleid.apple.com/auth/authorize",
      tokenUrl:
        process.env.APPLE_OAUTH_TOKEN_URL ?? "https://appleid.apple.com/auth/token",
    },
  },
  ssoEntryUrl: process.env.SSO_ENTRY_URL ?? "https://sso.example.com/login",
};
