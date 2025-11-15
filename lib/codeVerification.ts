import crypto from 'crypto';
import { encode as base32Encode } from 'hi-base32';

// Constant configuration
const SIGNATURE_SALT = parseInt(process.env.SIGNATURE_SALT || "123456789", 10);
const SIGNATURE_SECRET = Buffer.from(process.env.SIGNATURE_SECRET || "key", 'utf8');
const M = 10 ** 16;
// Precomputed modular inverse of 97
const INV_97 = 6288659793814433; // This is the result of pow(97, -1, M)

/**
 * Verify the validity of codeA and codeB
 * @param codeA - 16-digit numeric string
 * @param codeB - 5-character Base32 encoded string (may contain A-Z and digits)
 * @returns Verification result and extracted timestamp
 */
export function verifyCode(codeA: string, codeB: string): { valid: boolean; timestamp: number | null } {
  try {
    // Validate codeA format
    if (!/^\d{16}$/.test(codeA)) {
      console.error('Invalid codeA format:', codeA);
      return { valid: false, timestamp: null };
    }

    // Validate codeB format
    if (!/^[A-Z0-9]{5}$/.test(codeB.toUpperCase())) {
      console.error('Invalid codeB format:', codeB);
      return { valid: false, timestamp: null };
    }

    // HMAC
    const h = crypto.createHmac('sha1', SIGNATURE_SECRET)
      .update(Buffer.from(codeA.trim(), 'utf8'))
      .digest();
    const b2 = base32Encode(h).slice(0, 5).replace(/=/g, 'A');
    if (b2 !== codeB.toUpperCase()) {
      console.error('Mismatch between codeB and HMAC:', { codeB, b2 });
      return { valid: false, timestamp: null };
    }

    // Calculate original timestamp
    const a = BigInt(codeA);
    const t = Number(((a - BigInt(SIGNATURE_SALT)) * BigInt(INV_97)) % BigInt(M));

    return { valid: true, timestamp: t };
  } catch (error) {
    console.error('Code verification error:', error);
    return { valid: false, timestamp: null };
  }
}

/**
 * Generate codeA and codeB from timestamp
 * @param t - timestamp value
 * @returns Generated codeA and codeB
 */
export function makeCode(t: number): { codeA: string; codeB: string } {
  // Calculate numeric part of codeA
  const a = (t * 97 + SIGNATURE_SALT) % M;
  // Convert to 16-digit string, pad with leading zeros if necessary
  const codeA = String(a).padStart(16, '0');

  // Calculate HMAC-SHA1
  const h = crypto.createHmac('sha1', SIGNATURE_SECRET)
    .update(Buffer.from(codeA, 'utf8'))
    .digest();

  // Perform Base32 encoding, take first 5 characters, replace '=' with 'A'
  const codeB = base32Encode(h).slice(0, 5).replace(/=/g, 'A');

  return { codeA, codeB };
}
