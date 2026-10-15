'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  BookOpen,
  Activity,
  Shirt,
  UtensilsCrossed,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [libraryData, setLibraryData] = useState<any>(null);
  const [sportsData, setSportsData] = useState<any>(null);
  const [laundryData, setLaundryData] = useState<any>(null);
  const [messData, setMessData] = useState<any>(null);

  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        // 1. Student profile
        const meRes = await fetch('/api/me');
        if (!meRes.ok) {
          window.location.href = '/';
          return;
        }
        const meJson = await meRes.json();
        setStudent(meJson.student);

        // 2. Subsite data concurrently
        const [libRes, sportsRes, laundryRes, messRes] = await Promise.all([
          fetch('/api/library'),
          fetch('/api/sports'),
          fetch('/api/laundry'),
          fetch('/api/mess'),
        ]);

        if (libRes.ok) setLibraryData(await libRes.json());
        if (sportsRes.ok) setSportsData(await sportsRes.json());
        if (laundryRes.ok) setLaundryData(await laundryRes.json());
        if (messRes.ok) setMessData(await messRes.json());
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <LoadingSpinner message="Retrieving your campus records..." />
      </div>
    );
  }

  const libStats = libraryData?.stats;
  const sportsStats = sportsData?.stats;
  const laundrySummary = laundryData?.summary;
  const messSummary = messData?.summary;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar studentName={student?.name} enrollmentNo={student?.enrollmentNo} />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#002147] via-[#0b2b55] to-[#00418d] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#0b2b55]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 mb-3 border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bennett Student ERP Live Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="text-white">{student?.name || 'Aditya Sharma'}</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              {student?.program} • Semester {student?.semester} • Enrollment:{' '}
              <span className="font-mono uppercase font-bold text-amber-300">
                {student?.enrollmentNo}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dev/simulator"
              className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Clock className="w-4 h-4" />
              <span>Dev RFID Simulator</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Important Alerts Strip if any */}
        {laundrySummary?.hasOverduePickup && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Laundry Pickup Notice</p>
                <p className="text-sm font-semibold">
                  You have an order READY for collection that is past its estimated pickup date!
                </p>
              </div>
            </div>
            <Link
              href="/laundry"
              className="text-xs font-bold bg-[#da2032] hover:bg-[#a70b1a] text-white px-3.5 py-1.5 rounded-lg shadow-sm"
            >
              Collect Now &rarr;
            </Link>
          </div>
        )}

        {/* 4 Interactive Subsite Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tile 1: Library */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#00418d]">
                  <BookOpen className="w-6 h-6" />
                </div>
                {libStats?.currentlyInside ? (
                  <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
                    Currently Inside Library
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Gate: Checked Out</span>
                )}
              </div>

              <h2 className="text-xl font-bold text-[#002147]">Library Subsite</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                RFID gate hours, discussion room reservations, and issued books
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Today</div>
                  <div className="text-base font-extrabold text-[#002147]">
                    {libStats?.todayFormatted || '0m'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">This Week</div>
                  <div className="text-base font-extrabold text-[#002147]">
                    {libStats?.weekFormatted || '0m'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">This Month</div>
                  <div className="text-base font-extrabold text-[#00418d]">
                    {libStats?.monthFormatted || '28h 20m'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {libraryData?.issuedBooks?.length || 3} books on loan
              </span>
              <Link
                href="/library"
                className="text-xs font-bold text-[#da2032] group-hover:text-[#a70b1a] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Enter Library Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Tile 2: Sports */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <Activity className="w-6 h-6" />
                </div>
                {sportsStats?.currentlyInside ? (
                  <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
                    On Sports Complex
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Gate: Checked Out</span>
                )}
              </div>

              <h2 className="text-xl font-bold text-[#002147]">Sports Complex</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                9 University sports grounds, floodlit courts & fitness sessions
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Today</div>
                  <div className="text-base font-extrabold text-[#002147]">
                    {sportsStats?.todayFormatted || '1h 00m'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">This Week</div>
                  <div className="text-base font-extrabold text-[#002147]">
                    {sportsStats?.weekFormatted || '2h 00m'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">This Month</div>
                  <div className="text-base font-extrabold text-emerald-700">
                    {sportsStats?.monthFormatted || '8h 00m'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {sportsData?.myBookings?.length || 2} court bookings
              </span>
              <Link
                href="/sports"
                className="text-xs font-bold text-[#da2032] group-hover:text-[#a70b1a] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Enter Sports Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Tile 3: Laundry */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
                  <Shirt className="w-6 h-6" />
                </div>
                {laundrySummary?.countReady > 0 ? (
                  <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    {laundrySummary.countReady} Ready for Pickup
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">No pending pickups</span>
                )}
              </div>

              <h2 className="text-xl font-bold text-[#002147]">Hostel Laundry</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track clothes in wash cycle, turnaround time, and pickup notifications
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Ready</div>
                  <div className="text-base font-extrabold text-emerald-700">
                    {laundrySummary?.countReady || 1} Order
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">In Wash</div>
                  <div className="text-base font-extrabold text-[#00418d]">
                    {laundrySummary?.countWashing || 1} Order
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Clothes</div>
                  <div className="text-base font-extrabold text-[#002147]">
                    {laundrySummary?.totalClothes || 35}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {laundrySummary?.totalOrders || 3} lifetime orders
              </span>
              <Link
                href="/laundry"
                className="text-xs font-bold text-[#da2032] group-hover:text-[#a70b1a] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Enter Laundry Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Tile 4: Mess & Dining */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {messSummary?.statusText || '3/4 meals taken today'}
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#002147]">Mess & Dining Hall</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily Indian meal plan, RFID turnstile scans, and weekly dietary calendar
              </p>

              <div className="mt-5 grid grid-cols-4 gap-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                {messData?.todayMeals?.map((m: any) => (
                  <div key={m.key}>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase truncate">
                      {m.label}
                    </div>
                    <div className="text-sm font-extrabold mt-0.5">
                      {m.isTaken ? (
                        <span className="text-emerald-600 font-black">✓ TAKEN</span>
                      ) : (
                        <span className="text-slate-400 font-medium">Pending</span>
                      )}
                    </div>
                  </div>
                )) || (
                  <>
                    <div>
                      <div className="text-[10px] text-slate-400">Breakfast</div>
                      <div className="text-xs font-bold text-emerald-600">✓ TAKEN</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Lunch</div>
                      <div className="text-xs font-bold text-emerald-600">✓ TAKEN</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Snacks</div>
                      <div className="text-xs font-bold text-emerald-600">✓ TAKEN</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Dinner</div>
                      <div className="text-xs font-medium text-slate-400">Pending</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Dinner: 19:30 – 21:30
              </span>
              <Link
                href="/mess"
                className="text-xs font-bold text-[#da2032] group-hover:text-[#a70b1a] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Enter Mess Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
