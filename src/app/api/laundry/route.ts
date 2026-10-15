import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { errorResponse, student } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const refParam = searchParams.get('refDate');
    const referenceDate = refParam ? new Date(refParam) : new Date();

    const ordersRaw = await prisma.laundryOrder.findMany({
      where: { studentId: student!.id },
      orderBy: { givenDate: 'desc' },
    });

    let countWashing = 0;
    let countReady = 0;
    let countCollected = 0;
    let totalClothes = 0;
    let hasOverduePickup = false;

    const orders = ordersRaw.map((o) => {
      totalClothes += o.clothesCount;
      const isReady = o.status === 'READY';
      const isCollected = o.status === 'COLLECTED';
      const isWashing = o.status === 'WASHING' || o.status === 'RECEIVED';

      if (isWashing) countWashing++;
      if (isReady) countReady++;
      if (isCollected) countCollected++;

      const dueDate = new Date(o.dueDate);
      const isOverduePickup = isReady && referenceDate.getTime() > dueDate.getTime();
      let overdueDays = 0;

      if (isOverduePickup) {
        hasOverduePickup = true;
        overdueDays = Math.ceil((referenceDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        ...o,
        isReady,
        isWashing,
        isCollected,
        isOverduePickup,
        overdueDays,
      };
    });

    return NextResponse.json({
      summary: {
        totalOrders: orders.length,
        countWashing,
        countReady,
        countCollected,
        totalClothes,
        hasOverduePickup,
      },
      orders,
    });
  } catch (err) {
    console.error('Error fetching laundry data:', err);
    return NextResponse.json({ error: 'Failed to fetch laundry data' }, { status: 500 });
  }
}
