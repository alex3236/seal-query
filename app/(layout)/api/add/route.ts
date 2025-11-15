import { NextRequest, NextResponse } from 'next/server';
import { verifyTOTP, getTOTPSecret } from '@/lib/totpVerification';
import { submitBitableRecord } from '@/lib/bitableApi';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request data
    if (!body.Name || !body.SealDate || !body.Timestamp || !body.TrackingNum || !body.Type || !body.totp) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify TOTP code
    const totpValid = verifyTOTP(body.totp, getTOTPSecret());
    if (!totpValid) {
      return NextResponse.json({ error: 'TOTP verification failed, please check your verification code' }, { status: 403 });
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
    console.log('Record data to be added:', recordData);

    const response = await submitBitableRecord(recordData);
    console.log('Add record response:', response);

    // Check if response is successful
    if (response.code !== 0 || !response.data?.record?.record_id) {
      return NextResponse.json({ error: 'Failed to add record', details: response.msg || 'Unknown error' }, { status: 400 });
    }

    // Simulate success response
    return NextResponse.json({ success: true, message: 'Record added successfully', recordId: response.data?.record?.record_id, timestamp: Number(body.Timestamp || 0) });

  } catch (error) {
    console.error('Error occurred while adding record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}