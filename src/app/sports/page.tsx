'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import TimeChart from '@/components/TimeChart';
import SessionTable from '@/components/SessionTable';
import BookingGrid from '@/components/BookingGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Activity,
  Clock,
  Calendar,
  Trophy,
  Dumbbell,
  CheckCircle2,
  Sparkles,
  MapPin,
} from 'lucide-react';

export default function SportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);

  const fetchSportsData = async () => {
    try {
      const [meRes, sportsRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/sports'),
      ]);

      if (!meRes.ok) {
        window.location.href = '/';
        return;
      }

      setStudent((await meRes.json()).student);

      if (sportsRes.ok) {
        setData(await sportsRes.json());
      }
    } catch (err) {
      console.error('Error fetching sports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSportsData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <LoadingSpinner message="Loading Bennett Sports Complex data..." />
      </div>
    );
  }

  const stats = data?.stats;
  const sports = data?.sports || [];
  const myBookings = data?.myBookings || [];

  // Flatten grounds for booking grid
  const allGroundsForBooking = sports.flatMap((sp: any) =>
    sp.grounds.map((g: any) => ({
      id: g.id,
      name: `${sp.name} — ${g.name}`,
      details: sp.name,
      bookings: g.bookings || [],
    }))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar studentName={student?.name} enrollmentNo={student?.enrollmentNo} />

      {/* Subsite Hero */}
      <section className="bg-gradient-to-r from-[#002147] via-[#0b2b55] to-[#00418d] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#0b2b55] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 mb-3 border border-white/15">
            <Activity className="w-3.5 h-3.5" />
            <span>Athletics & Sports Complex • Bennett University</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Sports Subsite</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Book floodlit turf grounds and indoor AC courts across 9 university sports facilities, and view biometric activity logs.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Verification Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Active Play"
            value={stats?.todayFormatted || '1h 00m'}
            subtitle="Recorded on 15 Oct 2026"
            icon={Clock}
            accentColor="border-l-emerald-600"
            badge={
              stats?.currentlyInside
                ? { text: 'On Field Now', variant: 'success' }
                : { text: 'Checked Out', variant: 'info' }
            }
          />
          <StatsCard
            title="This Week's Play"
            value={stats?.weekFormatted || '2h 00m'}
            subtitle="Tue 13 Oct + Thu 15 Oct"
            icon={Calendar}
            accentColor="border-l-[#00418d]"
          />
          <StatsCard
            title="This Month's Total"
            value={stats?.monthFormatted || '8h 00m'}
            subtitle="6 verified sports sessions"
            icon={Trophy}
            accentColor="border-l-[#da2032]"
            badge={{ text: 'Fitness Target Met', variant: 'success' }}
          />
          <StatsCard
            title="Confirmed Sports"
            value={`${sports.length} Sports`}
            subtitle="World-class infrastructure"
            icon={Dumbbell}
            accentColor="border-l-[#002147]"
          />
        </div>

        {/* Chart + 9 Sports Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <TimeChart
              data={stats?.dailyChartData || []}
              title="October 2026 Sports & Fitness Hours"
              subtitle="Daily hours tracked across all grounds & arenas"
              barColor="#059669"
            />
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">
                  Campus Facilities (9 Sports)
                </h3>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  All Grounds Open
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {sports.map((sp: any) => (
                  <div
                    key={sp.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="font-bold text-xs text-slate-800">{sp.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {sp.grounds.length} ground{sp.grounds.length > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Floodlit till 22:00 daily with equipment checkout desk</span>
            </div>
          </div>
        </div>

        {/* Sports Ground Booking Grid */}
        <BookingGrid
          facilities={allGroundsForBooking}
          currentStudentId={student?.id}
          facilityLabel="Sports Ground / Court"
          apiEndpoint="/api/bookings/sports-grounds"
          idField="groundId"
          onBookingSuccess={fetchSportsData}
          defaultDate="2026-10-16"
        />

        {/* My Ground Bookings */}
        {myBookings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-base text-[#002147] mb-4">
              My Sports Ground Reservations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBookings.map((b: any) => {
                const bDateStr = new Date(b.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const isCancelled = b.status === 'CANCELLED';

                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border ${
                      isCancelled
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-emerald-50/50 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {b.ground.sport.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isCancelled
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-[#002147] mt-1">
                      {b.ground.name}
                    </div>
                    <div className="text-xs text-slate-600 font-mono mt-1">
                      {bDateStr} • {b.slotStart} – {b.slotEnd}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sports Sessions History Table */}
        <SessionTable
          sessions={stats?.sessions || []}
          title="October 2026 Sports Sessions (Total: 8h 00m)"
        />
      </main>
    </div>
  );
}
