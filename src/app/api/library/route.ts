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

    // 1. Fetch library scan events
    const scanEvents = await prisma.scanEvent.findMany({
      where: {
        studentId: student!.id,
        location: 'LIBRARY',
      },
      orderBy: { timestamp: 'asc' },
    });

    const stats = computeLocationSessions(scanEvents, referenceDate);

    // 2. Fetch all discussion rooms and active bookings
    const rooms = await prisma.discussionRoom.findMany({
      include: {
        bookings: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            roomId: true,
            studentId: true,
            date: true,
            slotStart: true,
            slotEnd: true,
          },
        },
      },
    });

    // 3. Fetch student's own room bookings
    const myBookings = await prisma.roomBooking.findMany({
      where: {
        studentId: student!.id,
      },
      include: {
        room: true,
      },
      orderBy: { date: 'desc' },
    });

    // 4. Fetch issued books and calculate overdue fines
    const issuedBooksRaw = await prisma.issuedBook.findMany({
      where: { studentId: student!.id },
      orderBy: { dueDate: 'asc' },
    });

    const issuedBooks = issuedBooksRaw.map((b) => {
      const due = new Date(b.dueDate);
      const now = referenceDate;
      const isReturned = !!b.returnedAt;
      const isOverdue = !isReturned && now.getTime() > due.getTime();
      
      let overdueDays = 0;
      let fine = 0;
      let daysRemaining = 0;

      if (isOverdue) {
        overdueDays = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        fine = overdueDays * b.finePerDay;
      } else if (!isReturned) {
        daysRemaining = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }

      return {
        ...b,
        isOverdue,
        overdueDays,
        fine,
        daysRemaining,
      };
    });

    return NextResponse.json({
      stats,
      rooms,
      myBookings,
      issuedBooks,
    });
  } catch (err) {
    console.error('Error fetching library data:', err);
    return NextResponse.json({ error: 'Failed to fetch library data' }, { status: 500 });
  }
}
