import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

describe("Password authentication", () => {
  it("hashes password with bcrypt", async () => {
    const hash = await bcrypt.hash("TestPassword123", 12);
    expect(hash).not.toBe("TestPassword123");
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("verifies correct password", async () => {
    const hash = await bcrypt.hash("TestPassword123", 12);
    const valid = await bcrypt.compare("TestPassword123", hash);
    expect(valid).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await bcrypt.hash("TestPassword123", 12);
    const valid = await bcrypt.compare("WrongPassword456", hash);
    expect(valid).toBe(false);
  });

  it("generates different hashes for same password (salting)", async () => {
    const h1 = await bcrypt.hash("TestPassword123", 12);
    const h2 = await bcrypt.hash("TestPassword123", 12);
    expect(h1).not.toBe(h2);
  });
});

describe("Password strength validation (mirrors Zod schema)", () => {
  const passwordRegex = {
    min8: (p: string) => p.length >= 8,
    hasLower: (p: string) => /[a-z]/.test(p),
    hasUpper: (p: string) => /[A-Z]/.test(p),
    hasNumber: (p: string) => /[0-9]/.test(p),
  };

  it("accepts strong password", () => {
    const pw = "StrongPass123";
    expect(passwordRegex.min8(pw)).toBe(true);
    expect(passwordRegex.hasLower(pw)).toBe(true);
    expect(passwordRegex.hasUpper(pw)).toBe(true);
    expect(passwordRegex.hasNumber(pw)).toBe(true);
  });

  it("rejects short password", () => {
    expect(passwordRegex.min8("Short1")).toBe(false);
  });

  it("rejects password without number", () => {
    expect(passwordRegex.hasNumber("NoNumbers")).toBe(false);
  });
});
