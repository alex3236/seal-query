import { authenticator } from 'otplib';

/**
 * Verify whether the TOTP code is valid
 * @param token - TOTP code entered by the user
 * @param secret - Secret key used for verification
 * @returns Verification result
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    // Validate token format
    if (!/^\d{6}$/.test(token)) {
      return false;
    }

    // Verify TOTP code
    return authenticator.check(token, secret);
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

/**
 * Get TOTP secret from environment variable
 * @returns TOTP secret
 */
export function getTOTPSecret(): string {
  return process.env.TOTP_SECRET || 'default_fallback_secret';
}