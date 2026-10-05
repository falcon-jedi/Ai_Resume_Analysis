import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '../../_lib/with-admin-auth';

export async function PUT(request: Request) {
  const result = await withAdminAuth();
  if (result instanceof NextResponse) return result;

  try {
    const body = (await request.json()) as { orders: Array<{ id: string; order: number }> };
    if (!Array.isArray(body.orders)) {
      return NextResponse.json(
        { success: false, message: 'Invalid orders array' },
        { status: 400 },
      );
    }

    await prisma.$transaction(
      body.orders.map((item) =>
        prisma.comparisonFeature.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
