'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import TimeChart from '@/components/TimeChart';
import SessionTable from '@/components/SessionTable';
import BookingGrid from '@/components/BookingGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  BookOpen,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  BookmarkCheck,
  Building,
  Sparkles,
} from 'lucide-react';

export default function LibraryPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);

  const fetchLibraryData = async () => {
    try {
      const [meRes, libRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/library'),
      ]);

      if (!meRes.ok) {
        window.location.href = '/';
        return;
      }

      setStudent((await meRes.json()).student);

      if (libRes.ok) {
        setData(await libRes.json());
      }
    } catch (err) {
      console.error('Error fetching library data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <LoadingSpinner message="Loading Bennett Central Library records..." />
      </div>
    );
  }

  const stats = data?.stats;
  const rooms = data?.rooms || [];
  const myBookings = data?.myBookings || [];
  const issuedBooks = data?.issuedBooks || [];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar studentName={student?.name} enrollmentNo={student?.enrollmentNo} />

      {/* Subsite Hero */}
      <section className="bg-gradient-to-r from-[#002147] via-[#0b2b55] to-[#00418d] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#0b2b55] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-blue-200 mb-3 border border-white/15">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Central Learning Resource Centre • Bennett University</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Library Subsite</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Monitor gate access dwell time, reserve soundproof discussion cubicles, and manage your book loans.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Verification Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Study Time"
            value={stats?.todayFormatted || '2h 20m'}
            subtitle="Recorded on 15 Oct 2026"
            icon={Clock}
            accentColor="border-l-[#da2032]"
            badge={
              stats?.currentlyInside
                ? { text: 'Currently Inside', variant: 'success' }
                : { text: 'Checked Out', variant: 'info' }
            }
          />
          <StatsCard
            title="This Week's Time"
            value={stats?.weekFormatted || '5h 50m'}
            subtitle="Mon 12 Oct – Sun 18 Oct"
            icon={Calendar}
            accentColor="border-l-[#00418d]"
          />
          <StatsCard
            title="This Month's Total"
            value={stats?.monthFormatted || '28h 20m'}
            subtitle="10 verified gate sessions"
            icon={BookmarkCheck}
            accentColor="border-l-[#002147]"
            badge={{ text: 'Target: 25h/mo (Achieved)', variant: 'success' }}
          />
          <StatsCard
            title="Issued Books"
            value={`${issuedBooks.length} Books`}
            subtitle="1 Overdue requiring return"
            icon={BookOpen}
            accentColor="border-l-amber-500"
            badge={{ text: '₹14 fine accrued', variant: 'warning' }}
          />
        </div>

        {/* Chart + Discussion Rooms Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <TimeChart
              data={stats?.dailyChartData || []}
              title="October 2026 Library Hours"
              subtitle="Daily hours tracked via biometric turnstiles"
              barColor="#00418d"
            />
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">
                  Discussion Rooms Available
                </h3>
                <span className="text-xs text-slate-500">{rooms.length} rooms</span>
              </div>

              <div className="mt-4 space-y-3">
                {rooms.map((room: any) => (
                  <div
                    key={room.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{room.name}</h4>
                      <p className="text-xs text-slate-500">Capacity: {room.capacity} students</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-[#00418d]">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              Need collaboration space? Use the booking grid below to reserve a 1-hour time slot.
            </div>
          </div>
        </div>

        {/* Discussion Room Booking Grid */}
        <BookingGrid
          facilities={rooms}
          currentStudentId={student?.id}
          facilityLabel="Discussion Room"
          apiEndpoint="/api/bookings/library-rooms"
          idField="roomId"
          onBookingSuccess={fetchLibraryData}
          defaultDate="2026-10-16"
        />

        {/* My Bookings Section */}
        {myBookings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-base text-[#002147] mb-4">
              My Discussion Room Reservations
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
                        : 'bg-blue-50/50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{b.room.name}</span>
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
                    <div className="text-sm font-extrabold text-[#002147] mt-2">
                      {bDateStr}
                    </div>
                    <div className="text-xs text-slate-600 font-mono mt-0.5">
                      {b.slotStart} – {b.slotEnd}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Issued Books Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">
                Current Issued Books
              </h3>
              <p className="text-xs text-slate-500">University Library circulation desk register</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
              {issuedBooks.length} books on loan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Book Title & Authors
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Issue Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status & Late Fine
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issuedBooks.map((b: any) => {
                  const issueStr = new Date(b.issueDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const dueStr = new Date(b.dueDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{b.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{b.author}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                        {issueStr}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                        {dueStr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {b.isOverdue ? (
                          <div className="inline-flex flex-col">
                            <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              OVERDUE ({b.overdueDays} days late)
                            </span>
                            <span className="text-[11px] font-bold text-rose-700 mt-1">
                              Fine: ₹{b.fine} (₹{b.finePerDay}/day)
                            </span>
                          </div>
                        ) : b.daysRemaining <= 1 ? (
                          <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Due Tomorrow
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active ({b.daysRemaining} days left)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sessions History Table */}
        <SessionTable
          sessions={stats?.sessions || []}
          title="October 2026 RFID Scan Sessions (Total: 28h 20m)"
        />
      </main>
    </div>
  );
}
