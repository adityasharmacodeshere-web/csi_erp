'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Sparkles,
  Zap,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  BookOpen,
  Activity,
  UtensilsCrossed,
} from 'lucide-react';

export default function SimulatorPage() {
  const [enrollmentNo, setEnrollmentNo] = useState('s26cseu2109');
  const [location, setLocation] = useState<'LIBRARY' | 'SPORTS' | 'MESS'>('LIBRARY');
  const [direction, setDirection] = useState<'IN' | 'OUT'>('IN');
  const [meal, setMeal] = useState<'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER'>('DINNER');
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<Array<{ id: number; time: string; msg: string; type: 'success' | 'error' }>>([]);

  const addLog = (msg: string, type: 'success' | 'error') => {
    setLogs((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        msg,
        type,
      },
      ...prev.slice(0, 19),
    ]);
  };

  const fireEvent = async (override?: Partial<{ location: string; direction: string; meal: string }>) => {
    try {
      setLoading(true);
      const payload = {
        enrollmentNo,
        location: override?.location || location,
        direction: override?.direction || direction,
        meal: override?.meal || (location === 'MESS' ? meal : undefined),
        timestamp: timestamp || new Date().toISOString(),
      };

      const res = await fetch('/api/dev/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Simulation event failed');
      }

      addLog(`[${payload.location}] ${data.message}`, 'success');
    } catch (err: any) {
      addLog(`[ERROR] ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <section className="bg-gradient-to-r from-[#002147] via-[#0b2b55] to-[#00418d] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#0b2b55]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Development Hardware Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Biometric & RFID Gate Simulator
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate turnstile taps and face-recognition cameras without physical campus hardware
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-white/15"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#da2032] animate-pulse" />
              <span>Hardware Event Dispatcher</span>
            </h3>

            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Quick Preset Hardware Taps
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fireEvent({ location: 'LIBRARY', direction: 'IN' })}
                  disabled={loading}
                  className="p-2.5 bg-blue-50 hover:bg-blue-100 text-[#00418d] rounded-lg text-xs font-bold text-left flex items-center gap-2 border border-blue-200 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Tap INTO Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => fireEvent({ location: 'LIBRARY', direction: 'OUT' })}
                  disabled={loading}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold text-left flex items-center gap-2 border border-slate-200 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Tap OUT of Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => fireEvent({ location: 'SPORTS', direction: 'IN' })}
                  disabled={loading}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold text-left flex items-center gap-2 border border-emerald-200 transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  <span>Tap INTO Sports</span>
                </button>
                <button
                  type="button"
                  onClick={() => fireEvent({ location: 'MESS', meal: 'DINNER' })}
                  disabled={loading}
                  className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold text-left flex items-center gap-2 border border-amber-200 transition-colors"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Scan Dinner at Mess</span>
                </button>
              </div>
            </div>

            {/* Custom Event Builder */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Enrollment No
                </label>
                <input
                  type="text"
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#002147]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Facility Location
                  </label>
                  <select
                    value={location}
                    onChange={(e: any) => setLocation(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  >
                    <option value="LIBRARY">LIBRARY (LRC)</option>
                    <option value="SPORTS">SPORTS (Complex)</option>
                    <option value="MESS">MESS (Dining Hall)</option>
                  </select>
                </div>

                {location === 'MESS' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Meal Slot
                    </label>
                    <select
                      value={meal}
                      onChange={(e: any) => setMeal(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    >
                      <option value="BREAKFAST">BREAKFAST</option>
                      <option value="LUNCH">LUNCH</option>
                      <option value="SNACKS">SNACKS</option>
                      <option value="DINNER">DINNER</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Turnstile Direction
                    </label>
                    <select
                      value={direction}
                      onChange={(e: any) => setDirection(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    >
                      <option value="IN">IN (Entry Swipe)</option>
                      <option value="OUT">OUT (Exit Swipe)</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Timestamp (Optional — defaults to now)
                </label>
                <input
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#002147]"
                />
              </div>

              <button
                type="button"
                onClick={() => fireEvent()}
                disabled={loading}
                className="w-full py-3 bg-[#da2032] hover:bg-[#a70b1a] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Transmit Hardware Event</span>
              </button>
            </div>
          </div>

          {/* Live Event Output Log */}
          <div className="lg:col-span-6 bg-[#001733] rounded-xl shadow-lg border border-[#0b2b55] p-6 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Hardware Telemetry Stream</span>
                </h3>
                <button
                  onClick={() => setLogs([])}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Clear Console
                </button>
              </div>

              <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <div className="text-slate-500 italic py-8 text-center text-xs">
                    No hardware events fired yet. Click preset buttons or submit the form to simulate turnstile gate events.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                        log.type === 'success'
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                        [{log.time}]
                      </span>
                      <span className="break-words flex-1">{log.msg}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-400">
              Note: This simulator communicates with the internal API (`/api/dev/simulate`) and feeds directly into the session computation pipeline.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
