import { NextRequest, NextResponse } from 'next/server';
import { verifyTOTP, getTOTPSecret } from '@/lib/totpVerification';
import { submitBitableRecord } from '@/lib/fetchBitable';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证请求数据
    if (!body.Name || !body.SealDate || !body.Timestamp || !body.TrackingNum || !body.Type || !body.totp) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 验证TOTP码
    const totpValid = verifyTOTP(body.totp, getTOTPSecret());
    if (!totpValid) {
      return NextResponse.json({ error: 'TOTP验证失败，请检查您的验证码' }, { status: 403 });
    }

    // 准备添加到飞书表格的数据
    // 注意：这里不会直接调用飞书API，而是输出到控制台
    // 在实际生产环境中，应该使用服务端的安全方式调用飞书API
    const recordData = {
      fields: {
        Name: body.Name,
        SealDate: body.SealDate,
        Timestamp: body.Timestamp,
        TrackingNum: body.TrackingNum,
        Type: body.Type
      }
    };

    // 这里只是模拟添加操作，实际项目中需要调用飞书API
    console.log('准备添加的记录数据:', recordData);

    const response = await submitBitableRecord(recordData);
    console.log('添加记录响应:', response);

    // 检查响应是否成功
    if (response.code !== 0 || !response.data?.record?.record_id) {
      return NextResponse.json({ error: '添加记录失败', details: response.msg || '未知错误' }, { status: 400 });
    }

    // 模拟成功响应
    return NextResponse.json({ success: true, message: '记录添加成功', recordId: response.data?.record?.record_id, timestamp: Number(body.Timestamp || 0) });

  } catch (error) {
    console.error('添加记录时发生错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}