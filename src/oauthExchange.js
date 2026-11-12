import { config } from "./config.js";

export const exchangeAuthorizationCode = async (
  provider,
  authorizationCode,
  redirectUri,
) => {
  const entry = config.oauth[provider];
  if (!entry?.tokenUrl || !entry?.clientSecret) {
    return { ok: false };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: authorizationCode,
    redirect_uri: redirectUri,
    client_id: entry.clientId,
    client_secret: entry.clientSecret,
  });

  let response;
  try {
    response = await fetch(entry.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    return { ok: false };
  }

  if (!response.ok) {
    return { ok: false };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return { ok: false };
  }

  if (!data?.access_token && !data?.id_token) {
    return { ok: false };
  }

  return { ok: true };
};
