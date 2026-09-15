import {
  GoogleAuthProviderImpl,
  MockGoogleAuthProvider,
  verifyGoogleIdToken,
  isMockGoogleToken,
} from "./google";
import { ConsoleSmsProvider, MockSmsProvider, isDemoMode } from "./sms";
import type { GoogleAuthProvider, SmsProvider } from "./types";

export type { GoogleAuthProvider, GoogleIdTokenPayload, SmsProvider } from "./types";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function getGoogleAuthProvider(): GoogleAuthProvider {
  if (GOOGLE_CLIENT_ID) return new GoogleAuthProviderImpl(GOOGLE_CLIENT_ID);
  return new MockGoogleAuthProvider();
}

export function getSmsProvider(): SmsProvider {
  if (isDemoMode()) return new MockSmsProvider();
  return new ConsoleSmsProvider();
}

export { isMockGoogleToken, verifyGoogleIdToken, isDemoMode };
