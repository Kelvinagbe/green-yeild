import { NextRequest, NextResponse } from 'next/server';

const SECRET = process.env.PAYSTACK_SECRET_KEY!;

// GET /api/resolve-account?account_number=0123456789&bank_code=058
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const account_number  = searchParams.get('account_number');
  const bank_code       = searchParams.get('bank_code');

  if (!account_number || !bank_code)
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  try {
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      { headers: { Authorization: `Bearer ${SECRET}` }, cache: 'no-store' }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to resolve account' }, { status: 500 });
  }
}
