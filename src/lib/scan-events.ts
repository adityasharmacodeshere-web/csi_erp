export interface ComputedSession {
  id: string;
  location: string;
  dateStr: string; // YYYY-MM-DD
  displayDate: string; // e.g. "15 Oct (Thu)"
  inTime: string; // "10:40"
  outTime: string | null; // "13:00" or null if open
  durationMinutes: number;
  durationFormatted: string; // e.g. "2h 20m"
  isOpen: boolean;
  isAutoClosed: boolean;
  inTimestamp: Date;
  outTimestamp: Date | null;
}

export interface LocationStats {
  currentlyInside: boolean;
  insideSince: string | null;
  todayMinutes: number;
  todayFormatted: string;
  weekMinutes: number;
  weekFormatted: string;
  monthMinutes: number;
  monthFormatted: string;
  sessions: ComputedSession[];
  dailyChartData: { day: string; hours: number; date: string }[];
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function formatTimeHHMM(d: Date): string {
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

export function formatDisplayDate(d: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} (${days[d.getDay()]})`;
}

export function computeLocationSessions(
  events: { id: string; location: string; direction: string; timestamp: Date; autoClosedAt?: Date | null }[],
  referenceNow: Date = new Date()
): LocationStats {
  // Sort events ascending
  const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const sessions: ComputedSession[] = [];
  let pendingIn: (typeof events)[0] | null = null;

  for (const ev of sorted) {
    const evTime = new Date(ev.timestamp);

    if (ev.direction === 'IN') {
      if (pendingIn) {
        // Unclosed previous IN: auto-close at end of day or evTime
        const inDate = new Date(pendingIn.timestamp);
        const autoOut = new Date(inDate);
        autoOut.setHours(23, 59, 59, 999);

        const diffMinutes = Math.max(0, Math.round((autoOut.getTime() - inDate.getTime()) / 60000));
        sessions.push({
          id: pendingIn.id,
          location: pendingIn.location,
          dateStr: inDate.toISOString().split('T')[0],
          displayDate: formatDisplayDate(inDate),
          inTime: formatTimeHHMM(inDate),
          outTime: "23:59 (auto)",
          durationMinutes: diffMinutes,
          durationFormatted: formatMinutes(diffMinutes),
          isOpen: false,
          isAutoClosed: true,
          inTimestamp: inDate,
          outTimestamp: autoOut,
        });
      }
      pendingIn = ev;
    } else if (ev.direction === 'OUT') {
      if (pendingIn) {
        const inTime = new Date(pendingIn.timestamp);
        const diffMinutes = Math.max(0, Math.round((evTime.getTime() - inTime.getTime()) / 60000));

        sessions.push({
          id: `${pendingIn.id}-${ev.id}`,
          location: pendingIn.location,
          dateStr: inTime.toISOString().split('T')[0],
          displayDate: formatDisplayDate(inTime),
          inTime: formatTimeHHMM(inTime),
          outTime: formatTimeHHMM(evTime),
          durationMinutes: diffMinutes,
          durationFormatted: formatMinutes(diffMinutes),
          isOpen: false,
          isAutoClosed: false,
          inTimestamp: inTime,
          outTimestamp: evTime,
        });
        pendingIn = null;
      }
    }
  }

  let currentlyInside = false;
  let insideSince: string | null = null;

  if (pendingIn) {
    const inTime = new Date(pendingIn.timestamp);
    const isSameDayAsNow =
      inTime.getFullYear() === referenceNow.getFullYear() &&
      inTime.getMonth() === referenceNow.getMonth() &&
      inTime.getDate() === referenceNow.getDate();

    if (isSameDayAsNow) {
      currentlyInside = true;
      insideSince = formatTimeHHMM(inTime);
      const currentDiff = Math.max(0, Math.round((referenceNow.getTime() - inTime.getTime()) / 60000));
      sessions.push({
        id: pendingIn.id,
        location: pendingIn.location,
        dateStr: inTime.toISOString().split('T')[0],
        displayDate: formatDisplayDate(inTime),
        inTime: formatTimeHHMM(inTime),
        outTime: null,
        durationMinutes: currentDiff,
        durationFormatted: formatMinutes(currentDiff),
        isOpen: true,
        isAutoClosed: false,
        inTimestamp: inTime,
        outTimestamp: null,
      });
    } else {
      // Past day unclosed: auto closed
      const autoOut = new Date(inTime);
      autoOut.setHours(23, 59, 59, 999);
      const diffMinutes = Math.max(0, Math.round((autoOut.getTime() - inTime.getTime()) / 60000));
      sessions.push({
        id: pendingIn.id,
        location: pendingIn.location,
        dateStr: inTime.toISOString().split('T')[0],
        displayDate: formatDisplayDate(inTime),
        inTime: formatTimeHHMM(inTime),
        outTime: "23:59 (auto)",
        durationMinutes: diffMinutes,
        durationFormatted: formatMinutes(diffMinutes),
        isOpen: false,
        isAutoClosed: true,
        inTimestamp: inTime,
        outTimestamp: autoOut,
      });
    }
  }

  // Calculate totals: today, this week, this month based on referenceNow
  const refYear = referenceNow.getFullYear();
  const refMonth = referenceNow.getMonth();
  const refDate = referenceNow.getDate();

  // Find Monday of the reference week
  const dayOfWeek = referenceNow.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMon = (dayOfWeek + 6) % 7; // days since Monday
  const weekStart = new Date(referenceNow);
  weekStart.setDate(refDate - distanceToMon);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  let todayMinutes = 0;
  let weekMinutes = 0;
  let monthMinutes = 0;

  // Chart data: by day of current month (1..31)
  const daysInMonth = new Date(refYear, refMonth + 1, 0).getDate();
  const dailyHoursMap: { [day: number]: number } = {};
  for (let i = 1; i <= daysInMonth; i++) {
    dailyHoursMap[i] = 0;
  }

  for (const s of sessions) {
    const sDate = s.inTimestamp;
    const sYear = sDate.getFullYear();
    const sMonth = sDate.getMonth();
    const sDay = sDate.getDate();

    if (sYear === refYear && sMonth === refMonth) {
      monthMinutes += s.durationMinutes;
      dailyHoursMap[sDay] = (dailyHoursMap[sDay] || 0) + s.durationMinutes / 60;

      if (sDay === refDate) {
        todayMinutes += s.durationMinutes;
      }
    }

    if (sDate >= weekStart && sDate < weekEnd) {
      weekMinutes += s.durationMinutes;
    }
  }

  const dailyChartData = Object.keys(dailyHoursMap).map((dStr) => {
    const d = parseInt(dStr, 10);
    const dateObj = new Date(refYear, refMonth, d);
    return {
      day: `${d} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][refMonth]}`,
      hours: parseFloat((dailyHoursMap[d] || 0).toFixed(2)),
      date: dateObj.toISOString().split('T')[0],
    };
  });

  return {
    currentlyInside,
    insideSince,
    todayMinutes,
    todayFormatted: formatMinutes(todayMinutes),
    weekMinutes,
    weekFormatted: formatMinutes(weekMinutes),
    monthMinutes,
    monthFormatted: formatMinutes(monthMinutes),
    sessions: sessions.reverse(), // most recent first for display
    dailyChartData,
  };
}
