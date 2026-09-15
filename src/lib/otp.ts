import { randomInt, randomBytes, timingSafeEqual, createHash } from "node:crypto";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LENGTH = 6;

/** Normalize phone input to E.164-ish form: +<country><number>. */
export function normalizePhone(input: string): string {
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = "+" + digits.slice(2);
  if (!digits.startsWith("+")) digits = "+" + digits;
  return digits;
}

export function isValidPhone(input: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(normalizePhone(input));
}

export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length < 7) return normalized;
  return normalized.slice(0, 3) + "****" + normalized.slice(-3);
}

/** Generate a cryptographically random numeric OTP. */
export function generateOtpCode(): string {
  const code = randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
  return code;
}

/** Hash an OTP with a random salt so stored codes are never plaintext. */
export function hashOtpCode(code: string, salt = randomBytes(16).toString("hex")): string {
  const hash = createHash("sha256").update(`${salt}:${code}`).digest("hex");
  return `${salt}:${hash}`;
}

/** Constant-time comparison against a stored hash. */
export function verifyOtpCode(code: string, stored: string): boolean {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const candidate = createHash("sha256").update(`${salt}:${code}`).digest("hex");
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
