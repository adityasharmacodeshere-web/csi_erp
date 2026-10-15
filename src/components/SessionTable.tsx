'use client';

import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export interface ComputedSessionItem {
  id: string;
  location: string;
  dateStr: string;
  displayDate: string;
  inTime: string;
  outTime: string | null;
  durationFormatted: string;
  isOpen: boolean;
  isAutoClosed: boolean;
}

interface SessionTableProps {
  sessions: ComputedSessionItem[];
  title?: string;
  emptyMessage?: string;
}

export default function SessionTable({
  sessions,
  title = 'Recorded Entry & Exit Sessions',
  emptyMessage = 'No session records found for this period.',
}: SessionTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">{title}</h3>
        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
          {sessions.length} sessions
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
                Time Interval (IN &rarr; OUT)
              </th>
              <th scope="col" className="px-6 py-3">
                Duration
              </th>
              <th scope="col" className="px-6 py-3">
                Gate Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                  {s.displayDate}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="flex items-center space-x-2 text-slate-700 font-mono text-xs">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-800">
                      {s.inTime}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        s.isOpen
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : s.isAutoClosed
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {s.outTime || 'Inside Now'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap font-semibold text-[#002147]">
                  {s.durationFormatted}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  {s.isOpen ? (
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
                      Currently Inside
                    </span>
                  ) : s.isAutoClosed ? (
                    <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
                      Auto-closed (Midnight)
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      Completed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
