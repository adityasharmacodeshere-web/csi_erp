import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { errorResponse, student } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { groundId, date, slotStart, slotEnd } = body;

    if (!groundId || !date || !slotStart || !slotEnd) {
      return NextResponse.json(
        { error: 'Missing required booking details (groundId, date, slotStart, slotEnd)' },
        { status: 400 }
      );
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Check if slot is already actively booked
    const existing = await prisma.groundBooking.findFirst({
      where: {
        groundId,
        date: bookingDate,
        slotStart,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This time slot is already booked for the selected ground / court.' },
        { status: 409 }
      );
    }

    const newBooking = await prisma.groundBooking.create({
      data: {
        groundId,
        studentId: student!.id,
        date: bookingDate,
        slotStart,
        slotEnd,
        status: 'ACTIVE',
      },
      include: {
        ground: {
          include: {
            sport: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Sports ground booked successfully',
      booking: newBooking,
    });
  } catch (err) {
    console.error('Ground booking error:', err);
    return NextResponse.json({ error: 'Failed to create ground booking' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { errorResponse, student } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await prisma.groundBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.studentId !== student!.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only cancel your own bookings' },
        { status: 403 }
      );
    }

    const updated = await prisma.groundBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Ground booking cancelled successfully',
      booking: updated,
    });
  } catch (err) {
    console.error('Ground cancel error:', err);
    return NextResponse.json({ error: 'Failed to cancel ground booking' }, { status: 500 });
  }
}
