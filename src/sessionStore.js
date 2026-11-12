const sessions = new Map();
const oauthStates = new Map();

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const createSession = (userId) => {
  const sessionId = newId();
  sessions.set(sessionId, { userId, createdAt: Date.now() });
  return sessionId;
};

export const getSession = (sessionId) => {
  if (!sessionId) {
    return null;
  }
  return sessions.get(sessionId) ?? null;
};

export const destroySession = (sessionId) => {
  if (sessionId) {
    sessions.delete(sessionId);
  }
};

export const rememberOAuthState = (state, payload) => {
  oauthStates.set(state, { ...payload, createdAt: Date.now() });
};

export const consumeOAuthState = (state) => {
  if (!state) {
    return null;
  }
  const entry = oauthStates.get(state);
  if (!entry) {
    return null;
  }
  oauthStates.delete(state);
  return entry;
};
