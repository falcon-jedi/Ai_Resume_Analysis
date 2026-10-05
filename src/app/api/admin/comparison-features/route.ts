import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { withAdminAuth } from '../_lib/with-admin-auth';

export async function GET() {
  const result = await withAdminAuth();
  if (result instanceof NextResponse) return result;
  const features = await prisma.comparisonFeature.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ success: true, data: features });
}

export async function POST(request: Request) {
  const result = await withAdminAuth();
  if (result instanceof NextResponse) return result;
  const body = (await request.json()) as {
    title: string;
    values: Record<string, string>;
    order?: number;
  };
  const feature = await prisma.comparisonFeature.create({
    data: { title: body.title, values: body.values, order: body.order ?? 0 },
  });
  return NextResponse.json({ success: true, data: feature }, { status: 201 });
}

export async function PUT(request: Request) {
  const result = await withAdminAuth();
  if (result instanceof NextResponse) return result;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, message: 'id required' }, { status: 400 });
  const body = (await request.json()) as {
    title?: string;
    values?: Record<string, string>;
    order?: number;
  };
  const feature = await prisma.comparisonFeature.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.values !== undefined && { values: body.values }),
      ...(body.order !== undefined && { order: body.order }),
    },
  });
  return NextResponse.json({ success: true, data: feature });
}

export async function DELETE(request: Request) {
  const result = await withAdminAuth();
  if (result instanceof NextResponse) return result;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, message: 'id required' }, { status: 400 });
  await prisma.comparisonFeature.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
