const newCorrelationId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const getCorrelationId = (req) => {
  const header = req.headers["x-correlation-id"];
  if (typeof header === "string" && header.length > 0 && header.length <= 128) {
    return header;
  }
  return newCorrelationId();
};

export const logAuthAttempt = ({ correlationId, method, identity, outcome }) => {
  console.log(
    JSON.stringify({
      type: "auth_audit",
      timestamp: new Date().toISOString(),
      correlationId,
      method,
      identity,
      outcome,
    }),
  );
};
