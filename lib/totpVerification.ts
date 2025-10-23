import { authenticator } from 'otplib';

/**
 * 验证TOTP码是否有效
 * @param token - 用户输入的TOTP码
 * @param secret - 用于验证的密钥
 * @returns 验证结果
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    // 验证token格式
    if (!/^\d{6}$/.test(token)) {
      return false;
    }
    
    // 验证TOTP码
    return authenticator.check(token, secret);
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

/**
 * 从环境变量获取TOTP密钥
 * @returns TOTP密钥
 */
export function getTOTPSecret(): string {
  return process.env.TOTP_SECRET || 'default_fallback_secret';
}