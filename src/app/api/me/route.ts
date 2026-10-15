import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const { errorResponse, student } = await requireAuth();
  if (errorResponse) return errorResponse;

  return NextResponse.json({
    student: {
      id: student!.id,
      enrollmentNo: student!.enrollmentNo,
      name: student!.name,
      program: student!.program,
      semester: student!.semester,
      createdAt: student!.createdAt,
    },
  });
}
