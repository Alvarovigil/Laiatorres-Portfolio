// Auth de contraseña única para el panel /admin.
//
// El cliente no guarda la contraseña: tras hacer login con éxito, firmamos un
// token con HMAC-SHA256 (SESSION_SECRET) y lo metemos en una cookie httpOnly.
// La verificación del token usa Web Crypto, así que funciona tanto en el
// runtime de Node (server actions / route handlers) como en el de proxy.ts.

export const SESSION_COOKIE = "laia_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Falta SESSION_SECRET en el entorno.");
  return secret;
}

const enc = new TextEncoder();

function toB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return toB64Url(new Uint8Array(sig));
}

// Comparación en tiempo constante para no filtrar el secreto por timing.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Token = "<expiraEnMs>.<firma>". La firma cubre la expiración, así que no se
// puede alargar la sesión sin conocer el secreto.
export async function createSessionToken(): Promise<string> {
  const expires = String(Date.now() + SESSION_TTL_MS);
  const sig = await hmac(expires);
  return `${expires}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const expires = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expiresMs = Number(expires);
  if (!Number.isFinite(expiresMs) || expiresMs < Date.now()) return false;
  const expected = await hmac(expires);
  return timingSafeEqual(sig, expected);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("Falta ADMIN_PASSWORD en el entorno.");
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export const SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);
