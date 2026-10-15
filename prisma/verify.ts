import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import { computeLocationSessions } from '../src/lib/scan-events';

async function verifyAll() {
  console.log('🧪 Running comprehensive verification suite for Bennett Campus ERP...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Check Student exists
  const student = await prisma.student.findUnique({
    where: { enrollmentNo: 's26cseu2109' },
  });
  assert(!!student, 'Student s26cseu2109 exists in database');
  assert(student?.name === 'Aditya Sharma', 'Student name is Aditya Sharma');

  // 2. Password verification
  if (student) {
    const wrongPass = await bcrypt.compare('WrongPassword', student.passwordHash);
    assert(!wrongPass, 'Wrong password rejected');

    const rightPass = await bcrypt.compare('Aditya@123', student.passwordHash);
    assert(rightPass, 'Correct password Aditya@123 verified');
  }

  // 3. Library verification
  const refDate = new Date('2026-10-15T12:00:00');
  const libEvents = await prisma.scanEvent.findMany({
    where: { studentId: student!.id, location: 'LIBRARY' },
    orderBy: { timestamp: 'asc' },
  });
  const libStats = computeLocationSessions(libEvents, refDate);
  assert(libStats.monthFormatted === '28h 20m', `Library month hours: expected '28h 20m', got '${libStats.monthFormatted}'`);
  assert(libStats.todayFormatted === '2h 20m', `Library today hours: expected '2h 20m', got '${libStats.todayFormatted}'`);
  assert(libStats.weekFormatted === '5h 50m', `Library week hours: expected '5h 50m', got '${libStats.weekFormatted}'`);

  // 4. Sports verification
  const sportsEvents = await prisma.scanEvent.findMany({
    where: { studentId: student!.id, location: 'SPORTS' },
    orderBy: { timestamp: 'asc' },
  });
  const sportsStats = computeLocationSessions(sportsEvents, refDate);
  assert(sportsStats.monthFormatted === '8h 00m', `Sports month hours: expected '8h 00m', got '${sportsStats.monthFormatted}'`);
  assert(sportsStats.todayFormatted === '1h 00m', `Sports today hours: expected '1h 00m', got '${sportsStats.todayFormatted}'`);
  assert(sportsStats.weekFormatted === '2h 00m', `Sports week hours: expected '2h 00m', got '${sportsStats.weekFormatted}'`);

  // 5. 9 Confirmed Sports exist
  const sportsCount = await prisma.sport.count();
  assert(sportsCount === 9, `9 Confirmed sports facilities present in DB (found: ${sportsCount})`);

  // 6. Mess verification
  const startOfToday = new Date('2026-10-15T00:00:00.000Z');
  const endOfToday = new Date('2026-10-16T00:00:00.000Z');
  const todayScans = await prisma.messScan.findMany({
    where: {
      studentId: student!.id,
      date: { gte: startOfToday, lt: endOfToday },
    },
  });
  assert(todayScans.length === 3, `Meals taken today: expected 3, got ${todayScans.length}`);

  // 7. Duplicate Mess Scan Prevention
  try {
    await prisma.messScan.create({
      data: {
        studentId: student!.id,
        meal: 'BREAKFAST',
        date: startOfToday,
        timestamp: new Date('2026-10-15T09:00:00.000Z'),
      },
    });
    assert(false, 'Duplicate breakfast scan should have thrown unique constraint error');
  } catch (err: any) {
    assert(true, 'Duplicate breakfast scan properly rejected by database unique constraint');
  }

  // 8. Laundry Orders Verification
  const laundryOrders = await prisma.laundryOrder.findMany({
    where: { studentId: student!.id },
  });
  assert(laundryOrders.length === 3, `Found 3 seeded laundry orders (actual: ${laundryOrders.length})`);
  const readyOrder = laundryOrders.find((o) => o.status === 'READY');
  assert(!!readyOrder, 'Ready laundry order exists');

  // 9. Issued Books Verification
  const books = await prisma.issuedBook.findMany({
    where: { studentId: student!.id },
  });
  assert(books.length === 3, `Found 3 library issued books (actual: ${books.length})`);
  const overdueBook = books.find((b) => b.dueDate.getTime() < refDate.getTime());
  assert(!!overdueBook && overdueBook.title.includes('Discrete'), 'Discrete Mathematics is overdue');

  console.log(`\n🏁 Test Results: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

verifyAll()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
