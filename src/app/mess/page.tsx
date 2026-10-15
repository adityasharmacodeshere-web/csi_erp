'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import MealCard from '@/components/MealCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  UtensilsCrossed,
  Clock,
  Calendar,
  CheckCircle2,
  Coffee,
  Sun,
  Cookie,
  Moon,
  Info,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { index: 1, name: 'Monday' },
  { index: 2, name: 'Tuesday' },
  { index: 3, name: 'Wednesday' },
  { index: 4, name: 'Thursday' },
  { index: 5, name: 'Friday' },
  { index: 6, name: 'Saturday' },
  { index: 0, name: 'Sunday' },
];

export default function MessPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [activeMenuDay, setActiveMenuDay] = useState<number>(4); // Default to Thursday (today)

  const fetchMessData = async () => {
    try {
      const [meRes, messRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/mess'),
      ]);

      if (!meRes.ok) {
        window.location.href = '/';
        return;
      }

      setStudent((await meRes.json()).student);

      if (messRes.ok) {
        const messJson = await messRes.json();
        setData(messJson);
      }
    } catch (err) {
      console.error('Error fetching mess data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <LoadingSpinner message="Loading Bennett Central Dining Hall records..." />
      </div>
    );
  }

  const summary = data?.summary;
  const todayMeals = data?.todayMeals || [];
  const weeklyMenu = data?.weeklyMenu || [];
  const history = data?.history || [];

  // Filter weekly menu for active tab
  const activeDayMeals = weeklyMenu.filter((m: any) => m.dayOfWeek === activeMenuDay);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar studentName={student?.name} enrollmentNo={student?.enrollmentNo} />

      {/* Subsite Hero */}
      <section className="bg-gradient-to-r from-[#002147] via-[#0b2b55] to-[#00418d] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#0b2b55] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 mb-3 border border-white/15">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Central Mess & Dining Facilities • Bennett University</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Mess & Dining Subsite</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Live turnstile swipe verification, 4-tier daily meal schedule, and weekly Indian multi-cuisine menu.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Verification Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Meals Taken Today"
            value={`${summary?.mealsTakenToday || 3} of 4 Meals`}
            subtitle="Thursday 15 Oct 2026"
            icon={UtensilsCrossed}
            accentColor="border-l-[#da2032]"
            badge={{ text: '3 Meals Verified', variant: 'success' }}
          />
          <StatsCard
            title="Current Meal"
            value="Dinner"
            subtitle="Window: 19:30 – 21:30"
            icon={Moon}
            accentColor="border-l-[#00418d]"
            badge={{ text: 'Not Yet Taken', variant: 'warning' }}
          />
          <StatsCard
            title="Assumed Meal Windows"
            value="4 Times Daily"
            subtitle="Breakfast, Lunch, Snacks, Dinner"
            icon={Clock}
            accentColor="border-l-[#002147]"
          />
          <StatsCard
            title="Turnstile Log"
            value={`${history.length} Scans`}
            subtitle="Last 7 days attendance"
            icon={CheckCircle2}
            accentColor="border-l-emerald-600"
          />
        </div>

        {/* Assumed Timings Notice */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-800 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Meal Schedule Note:</span> Timings follow standard University Dining windows (Breakfast: 07:30–09:30, Lunch: 12:00–14:00, Snacks: 16:30–18:00, Dinner: 19:30–21:30). Each student is allowed one valid RFID gate scan per meal slot.
          </div>
        </div>

        {/* Today's Meals Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#002147] uppercase tracking-wider">
              Today&apos;s Meals & Turnstile Access (15 Oct 2026)
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              {summary?.statusText || '3/4 meals taken today'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {todayMeals.map((meal: any) => (
              <MealCard
                key={meal.key}
                label={meal.label}
                window={meal.window}
                isTaken={meal.isTaken}
                scanTimeFormatted={meal.scanTimeFormatted}
                menuItems={meal.menuItems}
                flagged={meal.flagged}
              />
            ))}
          </div>
        </div>

        {/* Weekly Menu Tabbed View */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-bold text-base text-[#002147]">Weekly Indian Dining Menu</h3>
              <p className="text-xs text-slate-500">Nutritionally balanced hostel dietary plan</p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d.index}
                  onClick={() => setActiveMenuDay(d.index)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeMenuDay === d.index
                      ? 'bg-[#002147] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {d.name.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Active Day Menu Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'].map((mealKey) => {
              const rec = activeDayMeals.find((m: any) => m.meal === mealKey);
              const icons = {
                BREAKFAST: Coffee,
                LUNCH: Sun,
                SNACKS: Cookie,
                DINNER: Moon,
              };
              const MealIcon = icons[mealKey as keyof typeof icons] || UtensilsCrossed;

              return (
                <div
                  key={mealKey}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-[#00418d]">
                      <MealIcon className="w-4 h-4" />
                      <h4 className="font-bold text-xs uppercase tracking-wider">{mealKey}</h4>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {rec?.items || 'Standard Dining Selection'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Turnstile Scan History (Last 7 Days) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">
                Dining Hall Turnstile Scan History (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-500">Biometric & RFID recorded access events</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
              {history.length} scans recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Meal
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Scan Time
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Gate Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((scan: any) => {
                  const dStr = new Date(scan.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const timeStr = new Date(scan.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <tr key={scan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                        {dStr}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap font-bold text-[#002147]">
                        {scan.meal}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs text-slate-700">
                        {timeStr}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Authorized Entry
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
