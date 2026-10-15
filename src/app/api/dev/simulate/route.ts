import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Dev simulator is only available in development mode' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { enrollmentNo, location, direction, meal, timestamp } = body;

    const student = await prisma.student.findUnique({
      where: { enrollmentNo: (enrollmentNo || 's26cseu2109').trim().toLowerCase() },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const eventDate = timestamp ? new Date(timestamp) : new Date();

    if (location === 'MESS' && meal) {
      // Create or toggle a mess scan
      const dateOnly = new Date(eventDate);
      dateOnly.setHours(0, 0, 0, 0);

      const existingScan = await prisma.messScan.findUnique({
        where: {
          studentId_meal_date: {
            studentId: student.id,
            meal: meal.toUpperCase(),
            date: dateOnly,
          },
        },
      });

      if (existingScan) {
        return NextResponse.json(
          { error: `Meal ${meal} has already been scanned for today!` },
          { status: 409 }
        );
      }

      const newScan = await prisma.messScan.create({
        data: {
          studentId: student.id,
          meal: meal.toUpperCase(),
          date: dateOnly,
          timestamp: eventDate,
          flagged: false,
        },
      });

      return NextResponse.json({
        success: true,
        type: 'MESS_SCAN',
        message: `Mess scan recorded for ${meal}`,
        data: newScan,
      });
    }

    // Otherwise standard ScanEvent (LIBRARY or SPORTS)
    const scanEvent = await prisma.scanEvent.create({
      data: {
        studentId: student.id,
        location: (location || 'LIBRARY').toUpperCase(),
        direction: (direction || 'IN').toUpperCase(),
        timestamp: eventDate,
      },
    });

    return NextResponse.json({
      success: true,
      type: 'SCAN_EVENT',
      message: `RFID / Face scan recorded: ${location} ${direction}`,
      data: scanEvent,
    });
  } catch (err) {
    console.error('Dev simulate error:', err);
    return NextResponse.json({ error: 'Failed to simulate event' }, { status: 500 });
  }
}
