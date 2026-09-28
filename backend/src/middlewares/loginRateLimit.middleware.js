const WINDOW_MS = 15 * 60 * 1000;
const ACCOUNT_LIMIT = 5;
const IP_LIMIT = 30;
const attempts = new Map();

const getKey = (req, prefix) => prefix === "account"
  ? `account:${String(req.body?.email || "").trim().toLowerCase()}`
  : `ip:${req.ip}`;

const getAttempt = (key) => {
  const attempt = attempts.get(key);
  if (attempt && attempt.expiresAt > Date.now()) return attempt;
  attempts.delete(key);
  return null;
};

export const checkLoginAttempts = (req, res, next) => {
  const account = getAttempt(getKey(req, "account"));
  const ip = getAttempt(getKey(req, "ip"));
  const blocked = account?.count >= ACCOUNT_LIMIT ? account : ip?.count >= IP_LIMIT ? ip : null;
  if (blocked) {
    res.set("Retry-After", String(Math.ceil((blocked.expiresAt - Date.now()) / 1000)));
    return res.status(429).json({ message: "Demasiados intentos. Esperá unos minutos antes de volver a ingresar." });
  }
  return next();
};

export const recordLoginFailure = (req) => {
  for (const prefix of ["account", "ip"]) {
    const key = getKey(req, prefix);
    // Evita acumular claves arbitrarias por solicitudes sin dirección de email.
    if (prefix === "account" && key === "account:") continue;
    const previous = getAttempt(key);
    attempts.set(key, { count: (previous?.count || 0) + 1, expiresAt: previous?.expiresAt || Date.now() + WINDOW_MS });
  }
};

export const clearLoginAccountFailures = (req) => {
  attempts.delete(getKey(req, "account"));
};
