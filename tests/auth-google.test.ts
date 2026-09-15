import { describe, it, expect } from "vitest";
import { parseGoogleIdToken, MockGoogleAuthProvider, isMockGoogleToken } from "@/providers/auth/google";

function b64url(input: string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function makeToken(payload: Record<string, unknown>, expOffsetSec = 3600): string {
  const header = b64url(JSON.stringify({ alg: "RS256", kid: "test" }));
  const body = b64url(
    JSON.stringify({
      sub: "google-123",
      email: "user@example.com",
      iss: "accounts.google.com",
      aud: "demo-client-id",
      exp: Math.floor(Date.now() / 1000) + expOffsetSec,
      ...payload,
    })
  );
  return `${header}.${body}.${b64url("signature")}`;
}

describe("Google ID token parsing", () => {
  it("decodes a valid token payload", () => {
    const payload = parseGoogleIdToken(makeToken({}));
    expect(payload.email).toBe("user@example.com");
    expect(payload.sub).toBe("google-123");
  });

  it("rejects an expired token", () => {
    expect(() => parseGoogleIdToken(makeToken({}, -3600))).toThrow(/expired/i);
  });

  it("rejects malformed tokens", () => {
    expect(() => parseGoogleIdToken("not-a-jwt")).toThrow(/format/i);
  });

  it("rejects tokens missing sub/email", () => {
    const token = makeToken({});
    const [h, , s] = token.split(".");
    const stripped = `${h}.${b64url(JSON.stringify({ exp: 9999999999 }))}.${s}`;
    expect(() => parseGoogleIdToken(stripped)).toThrow(/missing/i);
  });
});

describe("Mock Google auth provider", () => {
  const provider = new MockGoogleAuthProvider();

  it("recognizes mock tokens", () => {
    expect(isMockGoogleToken("mock.abc.def")).toBe(true);
    expect(isMockGoogleToken("eyJhbGciOiJSUzI1NiJ9.abc.def")).toBe(false);
  });

  it("verifies a demo token and extracts identity", async () => {
    const email = b64url("demo@veyra.app");
    const name = b64url("Demo Creator");
    const payload = await provider.verifyIdToken(`mock.${email}.${name}`);
    expect(payload.email).toBe("demo@veyra.app");
    expect(payload.name).toBe("Demo Creator");
    expect(payload.email_verified).toBe(true);
  });

  it("rejects a real-looking token through the mock provider", async () => {
    await expect(provider.verifyIdToken("eyJhbGciOiJSUzI1NiJ9.abc.def")).rejects.toThrow();
  });
});
