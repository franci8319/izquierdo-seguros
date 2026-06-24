const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

function getSecretKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no configurado");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const str = atob(padded);
  return new Uint8Array([...str].map((c) => c.charCodeAt(0)));
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `admin.${expiresAt}`;
  const key = await getSecretKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const signatureB64 = token.slice(lastDot + 1);
  const match = payload.match(/^admin\.(\d+)$/);
  if (!match) return false;
  const expiresAt = Number(match[1]);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  try {
    const key = await getSecretKey();
    const signature = fromBase64Url(signatureB64);
    return await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}
