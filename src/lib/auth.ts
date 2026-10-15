import { getSession } from './session';
import prisma from './prisma';
import { NextResponse } from 'next/server';

export async function getCurrentStudent() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.enrollmentNo) {
    return null;
  }

  const student = await prisma.student.findUnique({
    where: { enrollmentNo: session.enrollmentNo.toLowerCase() },
  });

  return student;
}

export async function requireAuth() {
  const student = await getCurrentStudent();
  if (!student) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Please log in first' },
        { status: 401 }
      ),
      student: null,
    };
  }

  return { errorResponse: null, student };
}
