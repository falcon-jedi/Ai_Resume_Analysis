import { NextResponse } from 'next/server';
import { getPricingPage } from '@/app/service/pricing/pricing.service';

// GET /api/public/pricing──

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currencyParam = searchParams.get('currency');

    // Default to INR for India (IN), else USD
    const country = request.headers.get('x-vercel-ip-country') || 'IN';
    const currency =
      currencyParam?.toUpperCase() === 'USD' || currencyParam?.toUpperCase() === 'INR'
        ? currencyParam.toUpperCase()
        : country === 'IN'
          ? 'INR'
          : 'USD';

    const data = await getPricingPage(currency);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/public/pricing]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to load pricing data' },
      { status: 500 },
    );
  }
}
