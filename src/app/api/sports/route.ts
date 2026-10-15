import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { computeLocationSessions } from '@/lib/scan-events';

export async function GET(req: NextRequest) {
  const { errorResponse, student } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const refParam = searchParams.get('refDate');
    const referenceDate = refParam ? new Date(refParam) : new Date();

    // 1. Fetch sports scan events
    const scanEvents = await prisma.scanEvent.findMany({
      where: {
        studentId: student!.id,
        location: 'SPORTS',
      },
      orderBy: { timestamp: 'asc' },
    });

    const stats = computeLocationSessions(scanEvents, referenceDate);

    // 2. Fetch all sports, grounds, and active bookings
    const sports = await prisma.sport.findMany({
      include: {
        grounds: {
          include: {
            bookings: {
              where: { status: 'ACTIVE' },
              select: {
                id: true,
                groundId: true,
                studentId: true,
                date: true,
                slotStart: true,
                slotEnd: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // 3. Fetch student's own ground bookings
    const myBookings = await prisma.groundBooking.findMany({
      where: {
        studentId: student!.id,
      },
      include: {
        ground: {
          include: {
            sport: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      stats,
      sports,
      myBookings,
    });
  } catch (err) {
    console.error('Error fetching sports data:', err);
    return NextResponse.json({ error: 'Failed to fetch sports data' }, { status: 500 });
  }
}
