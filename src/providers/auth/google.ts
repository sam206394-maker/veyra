import type { GoogleAuthProvider, GoogleIdTokenPayload } from "./types";

/**
 * Google ID token verification.
 *
 * When GOOGLE_CLIENT_ID is configured we verify tokens locally using
 * Google's published JWKS (RS256) — no extra SDK required. In DEMO_MODE
 * (or when no client id is configured) the MockGoogleAuthProvider accepts
 * `mock.*` tokens produced by the demo button so the full flow can be
 * tested without a Google Cloud project.
 */

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);
const KEY_CACHE_TTL_MS = 60 * 60 * 1000;

interface JwksEntry {
  keys: Array<{ kid?: string; n?: string; e?: string; alg?: string }>;
  fetchedAt: number;
}

let jwksCache: JwksEntry | null = null;

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function toBase64Url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode and check the token structure/expiry without network access. */
export function parseGoogleIdToken(token: string): GoogleIdTokenPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid Google ID token format");
  }
  const payload = JSON.parse(base64UrlDecode(parts[1])) as GoogleIdTokenPayload;
  if (!payload.sub || !payload.email) {
    throw new Error("Google ID token missing sub/email");
  }
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error("Google ID token expired");
  }
  return payload;
}

async function fetchJwks(): Promise<JwksEntry> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < KEY_CACHE_TTL_MS) {
    return jwksCache;
  }
  const response = await fetch(GOOGLE_JWKS_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch Google JWKS: ${response.status}`);
  }
  const data = (await response.json()) as JwksEntry;
  jwksCache = { ...data, fetchedAt: Date.now() };
  return jwksCache;
}

async function importPublicKey(kid: string): Promise<CryptoKey> {
  const jwks = await fetchJwks();
  const key = jwks.keys.find((k) => k.kid === kid);
  if (!key?.n || !key?.e) {
    throw new Error("Google signing key not found");
  }
  const modulus = Buffer.from(base64UrlDecode(key.n), "binary");
  const publicExponent = Buffer.from(base64UrlDecode(key.e), "binary");
  const jwk = {
    kty: "RSA",
    n: toBase64Url(modulus),
    e: toBase64Url(publicExponent),
    alg: "RS256",
    use: "sig",
  };
  return crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, [
    "verify",
  ]);
}

/**
 * Verifies a Google ID token signature and audience.
 * Throws on any invalid token — callers should treat this as a failed login.
 */
export async function verifyGoogleIdToken(token: string, clientId: string): Promise<GoogleIdTokenPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid Google ID token format");

  const header = JSON.parse(base64UrlDecode(parts[0])) as { alg?: string; kid?: string };
  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported Google token algorithm");
  }

  const signature = Buffer.from(parts[2].replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const data = Buffer.from(`${parts[0]}.${parts[1]}`, "utf8");
  const key = await importPublicKey(header.kid);
  const valid = await crypto.subtle.verify({ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, key, signature, data);
  if (!valid) throw new Error("Google ID token signature verification failed");

  const payload = parseGoogleIdToken(token);
  if (!payload.iss || !GOOGLE_ISSUERS.has(payload.iss)) {
    throw new Error("Google ID token has invalid issuer");
  }
  if (clientId && payload.aud !== clientId) {
    throw new Error("Google ID token audience mismatch");
  }
  return payload;
}

export function isMockGoogleToken(token: string): boolean {
  return token.startsWith("mock.");
}

export class MockGoogleAuthProvider implements GoogleAuthProvider {
  name = "mock-google";

  async verifyIdToken(token: string): Promise<GoogleIdTokenPayload> {
    if (!isMockGoogleToken(token)) throw new Error("Invalid demo Google token");
    // Format: mock.<base64url email>.<base64url name>
    const [, emailB64, nameB64] = token.split(".");
    const email = emailB64 ? Buffer.from(emailB64, "base64url").toString("utf8") : "demo@veyra.app";
    const name = nameB64
      ? Buffer.from(nameB64, "base64url").toString("utf8")
      : email.split("@")[0];
    return {
      sub: `mock_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email,
      email_verified: true,
      name,
      aud: "demo",
      iss: "accounts.google.com",
    };
  }
}

export class GoogleAuthProviderImpl implements GoogleAuthProvider {
  name = "google";

  constructor(private readonly clientId: string) {}

  async verifyIdToken(token: string): Promise<GoogleIdTokenPayload> {
    return verifyGoogleIdToken(token, this.clientId);
  }
}
