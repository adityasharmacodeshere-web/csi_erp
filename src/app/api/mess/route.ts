import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const MEAL_WINDOWS = {
  BREAKFAST: { label: 'Breakfast', window: '07:30 – 09:30', startH: 7.5, endH: 9.5 },
  LUNCH: { label: 'Lunch', window: '12:00 – 14:00', startH: 12.0, endH: 14.0 },
  SNACKS: { label: 'Snacks', window: '16:30 – 18:00', startH: 16.5, endH: 18.0 },
  DINNER: { label: 'Dinner', window: '19:30 – 21:30', startH: 19.5, endH: 21.5 },
};

export async function GET(req: NextRequest) {
  const { errorResponse, student } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const refParam = searchParams.get('refDate');
    const referenceDate = refParam ? new Date(refParam) : new Date();

    const dayOfWeek = referenceDate.getDay(); // 0=Sun, 4=Thu
    const startOfToday = new Date(referenceDate);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    // 1. Fetch Today's Menu
    const todaysMenuRecords = await prisma.messMenu.findMany({
      where: { dayOfWeek },
    });

    // 2. Fetch Weekly Menu
    const weeklyMenuRecords = await prisma.messMenu.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { meal: 'asc' }],
    });

    // 3. Fetch Today's scans for this student
    const todayScans = await prisma.messScan.findMany({
      where: {
        studentId: student!.id,
        date: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
    });

    const mealKeys: (keyof typeof MEAL_WINDOWS)[] = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
    let mealsTakenCount = 0;

    const mealsStatus = mealKeys.map((mealKey) => {
      const scan = todayScans.find((s) => s.meal === mealKey);
      const isTaken = !!scan;
      if (isTaken) mealsTakenCount++;

      const menuRec = todaysMenuRecords.find((m) => m.meal === mealKey);

      return {
        key: mealKey,
        label: MEAL_WINDOWS[mealKey].label,
        window: MEAL_WINDOWS[mealKey].window,
        isTaken,
        scanTimestamp: scan?.timestamp || null,
        scanTimeFormatted: scan
          ? new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          : null,
        flagged: scan?.flagged || false,
        menuItems: menuRec?.items || 'Standard University Dining Menu',
      };
    });

    // 4. Fetch 7 days history
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const historyScans = await prisma.messScan.findMany({
      where: {
        studentId: student!.id,
        date: {
          gte: sevenDaysAgo,
          lt: endOfToday,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({
      dateStr: referenceDate.toISOString().split('T')[0],
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
      summary: {
        mealsTakenToday: mealsTakenCount,
        totalMealsPerDay: 4,
        statusText: `${mealsTakenCount}/4 meals taken today`,
      },
      todayMeals: mealsStatus,
      weeklyMenu: weeklyMenuRecords,
      history: historyScans,
    });
  } catch (err) {
    console.error('Error fetching mess data:', err);
    return NextResponse.json({ error: 'Failed to fetch mess data' }, { status: 500 });
  }
}
