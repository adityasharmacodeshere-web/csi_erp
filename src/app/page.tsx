'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, UserCheck, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentNo, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid enrollment number or password');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid enrollment number or password');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setEnrollmentNo('s26cseu2109');
    setPassword('Aditya@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002147] via-[#0b2b55] to-[#00142c] flex flex-col justify-between relative overflow-hidden">
      {/* Decorative campus background elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#da2032_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#00418d]/30 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#da2032]/20 blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#da2032] to-[#ff4757] flex items-center justify-center shadow-lg font-black text-white text-2xl border border-white/20">
            BU
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              BENNETT <span className="text-[#da2032]">UNIVERSITY</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium tracking-wider uppercase">
              The Times Group • Greater Noida
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Central Student ERP Portal</span>
        </div>
      </header>

      {/* Login Card Main Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl">
          {/* Card header banner */}
          <div className="bg-[#002147] px-8 pt-8 pb-6 text-white text-center relative border-b-4 border-[#da2032]">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 shadow-inner mb-3">
              <UserCheck className="w-7 h-7 text-amber-300" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Student Login</h2>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Access your personal Library, Sports, Laundry & Mess records
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Enrollment Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    placeholder="e.g. s26cseu2109"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#da2032] hover:bg-[#a70b1a] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>Sign In to ERP Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Autofill Box */}
            <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50 -mx-8 -mb-8 px-8 py-5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-medium">
                  Default Demo Student: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">s26cseu2109</code>
                </div>
                <button
                  type="button"
                  onClick={autofillDemo}
                  className="text-xs font-bold text-[#00418d] hover:text-[#002147] flex items-center gap-1 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Autofill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-5 text-xs text-slate-400 border-t border-white/10">
        Bennett University, Plot Nos 8-11, TechZone II, Greater Noida 201310, Uttar Pradesh
      </footer>
    </div>
  );
}
