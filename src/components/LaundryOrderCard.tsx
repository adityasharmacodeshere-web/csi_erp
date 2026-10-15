'use client';

import React from 'react';
import { Shirt, Calendar, CheckCircle2, Clock, AlertTriangle, PackageCheck } from 'lucide-react';

interface LaundryOrderCardProps {
  order: {
    id: string;
    clothesCount: number;
    givenDate: string | Date;
    dueDate: string | Date;
    status: string;
    collectedAt: string | Date | null;
    isReady?: boolean;
    isWashing?: boolean;
    isCollected?: boolean;
    isOverduePickup?: boolean;
    overdueDays?: number;
  };
}

export default function LaundryOrderCard({ order }: LaundryOrderCardProps) {
  const givenDateStr = new Date(order.givenDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const dueDateStr = new Date(order.dueDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const collectedDateStr = order.collectedAt
    ? new Date(order.collectedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div
      className={`bg-white rounded-xl shadow-xs border transition-all overflow-hidden ${
        order.isOverduePickup
          ? 'border-rose-400 ring-2 ring-rose-300/30'
          : order.isReady
          ? 'border-emerald-300 ring-1 ring-emerald-200'
          : 'border-slate-200'
      }`}
    >
      {/* Overdue Alert Strip */}
      {order.isOverduePickup && (
        <div className="bg-[#da2032] text-white text-xs px-4 py-2 font-bold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>ACTION REQUIRED: Pick up ready laundry!</span>
          </div>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">
            {order.overdueDays} days late
          </span>
        </div>
      )}

      {/* Ready Alert Strip */}
      {order.isReady && !order.isOverduePickup && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 font-semibold flex items-center gap-1.5">
          <PackageCheck className="w-4 h-4" />
          <span>Clothes washed & ironed — Ready for pickup at Student Center desk</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#00418d]">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400">Order #{order.id.slice(-6).toUpperCase()}</div>
              <h4 className="text-base font-extrabold text-[#002147]">
                {order.clothesCount} Clothes
              </h4>
            </div>
          </div>

          <div>
            {order.status === 'READY' && (
              <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                READY FOR PICKUP
              </span>
            )}
            {order.status === 'WASHING' && (
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                <Clock className="w-3.5 h-3.5 mr-1 text-blue-600 animate-spin" />
                IN WASH CYCLE
              </span>
            )}
            {order.status === 'COLLECTED' && (
              <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                <PackageCheck className="w-3.5 h-3.5 mr-1 text-slate-400" />
                COLLECTED
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Given Date:</span>
            <span className="font-semibold text-slate-700">{givenDateStr}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Estimated Ready:</span>
            <span className="font-semibold text-slate-700">{dueDateStr}</span>
          </div>
          {collectedDateStr && (
            <div>
              <span className="text-slate-400 block text-[11px]">Collected On:</span>
              <span className="font-semibold text-emerald-700">{collectedDateStr}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
