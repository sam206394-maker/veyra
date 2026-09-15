import { describe, it, expect } from "vitest";
import {
  generateOtpCode,
  hashOtpCode,
  verifyOtpCode,
  normalizePhone,
  isValidPhone,
  maskPhone,
  OTP_LENGTH,
} from "@/lib/otp";

describe("Phone normalization", () => {
  it("keeps a valid E.164 number", () => {
    expect(normalizePhone("+919876543210")).toBe("+919876543210");
  });

  it("strips spaces and dashes", () => {
    expect(normalizePhone("+91 98765 43210")).toBe("+919876543210");
    expect(normalizePhone("01234-567890")).toBe("+01234567890");
  });

  it("converts 00 international prefix to +", () => {
    expect(normalizePhone("0044912345678")).toBe("+44912345678");
  });

  it("validates format", () => {
    expect(isValidPhone("+919876543210")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("+1")).toBe(false);
  });

  it("masks the middle of the number", () => {
    expect(maskPhone("+919876543210")).toContain("****");
  });
});

describe("OTP generation and hashing", () => {
  it("generates a 6-digit numeric code", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOtpCode();
      expect(code).toMatch(/^\d{6}$/);
    }
  });

  it("hashes codes with a unique salt", () => {
    const hashA = hashOtpCode("123456");
    const hashB = hashOtpCode("123456");
    expect(hashA).not.toBe(hashB);
    expect(hashA).not.toContain("123456");
  });

  it("verifies the correct code", () => {
    expect(verifyOtpCode("123456", hashOtpCode("123456"))).toBe(true);
  });

  it("rejects a wrong code", () => {
    expect(verifyOtpCode("654321", hashOtpCode("123456"))).toBe(false);
  });

  it("rejects malformed stored hashes", () => {
    expect(verifyOtpCode("123456", "not-a-hash")).toBe(false);
  });

  it("uses a constant code length", () => {
    expect(OTP_LENGTH).toBe(6);
  });
});
