export interface GoogleIdTokenPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  aud?: string;
  iss?: string;
  exp?: number;
}

export interface GoogleAuthProvider {
  name: string;
  verifyIdToken(token: string): Promise<GoogleIdTokenPayload>;
}

export interface SmsProvider {
  name: string;
  /** Returns true when the code is delivered out-of-band (SMS). */
  sendOtp(input: { phone: string; code: string }): Promise<{ deliveredInBand: boolean }>;
}
