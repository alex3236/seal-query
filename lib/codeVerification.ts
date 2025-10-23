import crypto from 'crypto';
import { encode as base32Encode } from 'hi-base32';

// 常量配置
const SIGNATURE_SALT = 123456789;
const SIGNATURE_SECRET = Buffer.from('key', 'utf8');
const M = 10 ** 16;
// 预先计算的97的模逆元
const INV_97 = 6288659793814433; // 这是pow(97, -1, M)的结果

/**
 * 验证codeA和codeB的有效性
 * @param codeA - 16位的数字字符串
 * @param codeB - 5位的Base32编码字符串（可能包含A-Z和数字）
 * @returns 验证结果和解析出的timestamp
 */
export function verifyCode(codeA: string, codeB: string): { valid: boolean; timestamp: number | null } {
  try {
    // 验证codeA格式
    if (!/^\d{16}$/.test(codeA)) {
      console.error('Invalid codeA format:', codeA);
      return { valid: false, timestamp: null };
    }

    // 验证codeB格式
    if (!/^[A-Z0-9]{5}$/.test(codeB.toUpperCase())) {
      console.error('Invalid codeB format:', codeB);
      return { valid: false, timestamp: null };
    }

    // HMAC
    const h = crypto.createHmac('sha1', SIGNATURE_SECRET)
      .update(Buffer.from(codeA.trim(), 'utf8'))  // 强制 ASCII，与 Python bytes 一致
      .digest();
    const b2 = base32Encode(h).slice(0, 5).replace(/=/g, 'A');
    if (b2 !== codeB.toUpperCase()) {
      console.error('Mismatch between codeB and HMAC:', { codeB, b2 });
      return { valid: false, timestamp: null };
    }

    // 计算原始timestamp
    const a = BigInt(codeA);
    const t = Number(((a - BigInt(SIGNATURE_SALT)) * BigInt(INV_97)) % BigInt(M));

    return { valid: true, timestamp: t };
  } catch (error) {
    console.error('Code verification error:', error);
    return { valid: false, timestamp: null };
  }
}

/**
 * 从timestamp生成codeA和codeB
 * @param t - timestamp值
 * @returns 生成的codeA和codeB
 */
export function makeCode(t: number): { codeA: string; codeB: string } {
  // 计算codeA的数值部分
  const a = (t * 97 + SIGNATURE_SALT) % M;
  // 转换为16位的字符串，不足前面补0
  const codeA = String(a).padStart(16, '0');
  
  // 计算HMAC-SHA1
  const h = crypto.createHmac('sha1', SIGNATURE_SECRET)
    .update(Buffer.from(codeA, 'utf8'))
    .digest();
  
  // 进行Base32编码，取前5个字符，并用'A'替换等号
  const codeB = base32Encode(h).slice(0, 5).replace(/=/g, 'A');
  
  return { codeA, codeB };
}
