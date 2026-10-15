import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { isRateLimited, recordFailedAttempt, resetLoginRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Check if IP is currently blocked
    const rateCheck = isRateLimited(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again after ${Math.ceil(
            (rateCheck.retryAfterSec || 900) / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { enrollmentNo, password } = body;

    if (!enrollmentNo || !password) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Invalid enrollment number or password' },
        { status: 400 }
      );
    }

    const normalizedEnrollment = enrollmentNo.trim().toLowerCase();

    const student = await prisma.student.findUnique({
      where: { enrollmentNo: normalizedEnrollment },
    });

    if (!student) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Invalid enrollment number or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, student.passwordHash);
    if (!isValidPassword) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Invalid enrollment number or password' },
        { status: 401 }
      );
    }

    // Reset rate limiter upon successful login
    resetLoginRateLimit(ip);

    // Save iron-session
    const session = await getSession();
    session.isLoggedIn = true;
    session.studentId = student.id;
    session.enrollmentNo = student.enrollmentNo;
    session.name = student.name;
    await session.save();

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        enrollmentNo: student.enrollmentNo,
        name: student.name,
        program: student.program,
        semester: student.semester,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
