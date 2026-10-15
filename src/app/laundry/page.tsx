'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import LaundryOrderCard from '@/components/LaundryOrderCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Shirt,
  PackageCheck,
  Clock,
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function LaundryPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);

  const fetchLaundryData = async () => {
    try {
      const [meRes, laundryRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/laundry'),
      ]);

      if (!meRes.ok) {
        window.location.href = '/';
        return;
      }

      setStudent((await meRes.json()).student);

      if (laundryRes.ok) {
        setData(await laundryRes.json());
      }
    } catch (err) {
      console.error('Error fetching laundry data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaundryData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <LoadingSpinner message="Loading Bennett Laundry Service records..." />
      </div>
    );
  }

  const summary = data?.summary;
  const orders = data?.orders || [];
  const activeOrders = orders.filter((o: any) => o.status !== 'COLLECTED');
  const pastOrders = orders.filter((o: any) => o.status === 'COLLECTED');

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar studentName={student?.name} enrollmentNo={student?.enrollmentNo} />

      {/* Subsite Hero */}
      <section className="bg-gradient-to-r from-[#002147] via-[#0b2b55] to-[#00418d] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#0b2b55] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-purple-200 mb-3 border border-white/15">
            <Shirt className="w-3.5 h-3.5" />
            <span>Hostel Laundromat & Linen Care • Bennett University</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Laundry Subsite</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Live laundry tracking, industrial washing cycle updates, and counter collection alerts.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Verification Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Ready for Pickup"
            value={`${summary?.countReady || 1} Order`}
            subtitle="At Student Center desk"
            icon={PackageCheck}
            accentColor="border-l-emerald-500"
            badge={
              summary?.hasOverduePickup
                ? { text: 'Overdue Collection', variant: 'danger' }
                : { text: 'Ready', variant: 'success' }
            }
          />
          <StatsCard
            title="In Wash Cycle"
            value={`${summary?.countWashing || 1} Order`}
            subtitle="Processing at facility"
            icon={Clock}
            accentColor="border-l-blue-500"
          />
          <StatsCard
            title="Total Processed"
            value={`${summary?.totalClothes || 35} Clothes`}
            subtitle="Semester 3 allocation"
            icon={Shirt}
            accentColor="border-l-[#002147]"
          />
          <StatsCard
            title="Completed Orders"
            value={`${summary?.countCollected || 1} Order`}
            subtitle="Safely collected"
            icon={Sparkles}
            accentColor="border-l-[#da2032]"
          />
        </div>

        {/* Overdue Alert banner if any */}
        {summary?.hasOverduePickup && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Overdue Pickup Reminder</p>
                <p className="text-sm font-semibold">
                  Order #2 (9 Clothes) was due on 13 Oct 2026 and is currently awaiting pickup. Counter closes at 20:00!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#002147] uppercase tracking-wider">
              Active In-Progress Orders
            </h3>
            <span className="text-xs text-slate-500">{activeOrders.length} active orders</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order: any) => (
              <LaundryOrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {/* Counter Info Banner */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Bennett University Laundry Timings:</span> Drop-off daily 08:00 – 11:00 AM. Collection daily 04:00 – 08:00 PM at Student Amenities Block Ground Floor. Please present student ID badge during collection.
          </div>
        </div>

        {/* Order History */}
        {pastOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#002147] uppercase tracking-wider">
                Order History & Past Pickups
              </h3>
              <span className="text-xs text-slate-500">{pastOrders.length} completed</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastOrders.map((order: any) => (
                <LaundryOrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
