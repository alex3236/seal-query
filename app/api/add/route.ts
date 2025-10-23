import { NextRequest, NextResponse } from 'next/server';
import { verifyTOTP, getTOTPSecret } from '@/lib/totpVerification';
import { submitBitableRecord } from '@/lib/bitableApi';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request data
    if (!body.Name || !body.SealDate || !body.Timestamp || !body.TrackingNum || !body.Type || !body.totp) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // Verify TOTP code
    const totpValid = verifyTOTP(body.totp, getTOTPSecret());
    if (!totpValid) {
      return NextResponse.json({ error: 'TOTP验证失败，请检查您的验证码' }, { status: 403 });
    }

    // Prepare data for adding to Lark table
    // Note: This does not directly call Lark API, but outputs to console
    // In production, a secure server-side method should be used to call Lark API
    const recordData = {
      fields: {
        Name: body.Name,
        SealDate: body.SealDate,
        Timestamp: body.Timestamp,
        TrackingNum: body.TrackingNum,
        Type: body.Type
      }
    };

    // This only simulates the add operation; in real projects the Lark API needs to be called
    console.log('准备添加的记录数据:', recordData);

    const response = await submitBitableRecord(recordData);
    console.log('添加记录响应:', response);

    // Check if response is successful
    if (response.code !== 0 || !response.data?.record?.record_id) {
      return NextResponse.json({ error: '添加记录失败', details: response.msg || '未知错误' }, { status: 400 });
    }

    // Simulate success response
    return NextResponse.json({ success: true, message: '记录添加成功', recordId: response.data?.record?.record_id, timestamp: Number(body.Timestamp || 0) });

  } catch (error) {
    console.error('添加记录时发生错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}