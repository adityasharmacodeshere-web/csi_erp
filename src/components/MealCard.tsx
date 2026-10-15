'use client';

import React from 'react';
import { Utensils, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface MealCardProps {
  label: string;
  window: string;
  isTaken: boolean;
  scanTimeFormatted: string | null;
  menuItems: string;
  flagged?: boolean;
}

export default function MealCard({
  label,
  window,
  isTaken,
  scanTimeFormatted,
  menuItems,
  flagged,
}: MealCardProps) {
  return (
    <div
      className={`rounded-xl border transition-all overflow-hidden ${
        isTaken
          ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {window}
            </span>
            <h4 className="text-lg font-bold text-[#002147]">{label}</h4>
          </div>

          <div>
            {isTaken ? (
              <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                TAKEN
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                NOT TAKEN
              </span>
            )}
          </div>
        </div>

        {/* Scan Details */}
        {isTaken && scanTimeFormatted && (
          <div className="mt-3 text-xs text-emerald-800 bg-emerald-100/60 rounded-lg p-2.5 flex items-center justify-between">
            <span className="font-medium">RFID Gate Scan Recorded:</span>
            <span className="font-mono font-bold">{scanTimeFormatted}</span>
          </div>
        )}

        {/* Menu Items */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Utensils className="w-3 h-3" />
            Today&apos;s Menu:
          </p>
          <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {menuItems}
          </p>
        </div>
      </div>
    </div>
  );
}
