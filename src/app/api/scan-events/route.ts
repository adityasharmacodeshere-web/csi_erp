import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const validKey = process.env.SCAN_API_KEY || 'bennett_scan_key_9f8e7d6c5b4a';
    if (!apiKey || apiKey !== validKey) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing API key' }, { status: 401 });
    }

    const body = await req.json();
    const { enrollmentNo, location, direction, timestamp } = body;

    if (!enrollmentNo || !location || !direction) {
      return NextResponse.json(
        { error: 'Missing required fields: enrollmentNo, location, direction' },
        { status: 400 }
      );
    }

    const validLocations = ['LIBRARY', 'SPORTS', 'MESS'];
    if (!validLocations.includes(location.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid location. Allowed: ${validLocations.join(', ')}` },
        { status: 400 }
      );
    }

    const validDirections = ['IN', 'OUT'];
    if (!validDirections.includes(direction.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid direction. Allowed: ${validDirections.join(', ')}` },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { enrollmentNo: enrollmentNo.trim().toLowerCase() },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found with this enrollment number' }, { status: 404 });
    }

    const scanTime = timestamp ? new Date(timestamp) : new Date();

    const scanEvent = await prisma.scanEvent.create({
      data: {
        studentId: student.id,
        location: location.toUpperCase(),
        direction: direction.toUpperCase(),
        timestamp: scanTime,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Scan event recorded successfully',
      event: scanEvent,
    });
  } catch (err) {
    console.error('Scan event error:', err);
    return NextResponse.json({ error: 'Failed to record scan event' }, { status: 500 });
  }
}
