import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'https://api.paystack.co/bank?country=nigeria&perPage=100',
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        next: { revalidate: 86400 }, // cache 24 hrs — bank list rarely changes
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch banks' }, { status: 500 });
  }
}
