'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Activity,
  Shirt,
  UtensilsCrossed,
  LayoutDashboard,
  LogOut,
  User,
  GraduationCap,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  studentName?: string;
  enrollmentNo?: string;
}

export default function Navbar({ studentName = 'Aditya Sharma', enrollmentNo = 's26cseu2109' }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/library', label: 'Library', icon: BookOpen },
    { href: '/sports', label: 'Sports', icon: Activity },
    { href: '/laundry', label: 'Laundry', icon: Shirt },
    { href: '/mess', label: 'Mess & Dining', icon: UtensilsCrossed },
  ];

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#002147] text-white shadow-lg border-b border-[#0b2b55]">
      {/* Top micro-banner */}
      <div className="bg-[#0b2b55] text-xs py-1 px-4 sm:px-8 flex justify-between items-center text-slate-300 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Bennett University Campus ERP • Greater Noida</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/dev/simulator"
            className="text-amber-300 hover:text-amber-200 flex items-center space-x-1 font-medium text-[11px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20"
          >
            <Sparkles className="w-3 h-3" />
            <span>Dev Simulator</span>
          </Link>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-400">Times Group Initiative</span>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#da2032] to-[#ff4757] flex items-center justify-center shadow-md font-bold text-white text-xl tracking-tighter border border-white/20 group-hover:scale-105 transition-transform">
              BU
            </div>
            <div>
              <div className="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-white flex items-center gap-1.5">
                BENNETT <span className="text-[#da2032] font-black">ERP</span>
              </div>
              <div className="text-[10px] text-slate-300 tracking-wider uppercase font-medium">
                Student Self-Service Portal
              </div>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#da2032] text-white shadow-sm font-semibold'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile & logout */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
              <div className="w-7 h-7 rounded-full bg-[#00418d] flex items-center justify-center text-xs font-bold text-white">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-white leading-none">{studentName}</div>
                <div className="text-[10px] text-slate-300 uppercase tracking-wider">{enrollmentNo}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Logout"
              className="p-2 rounded-lg bg-white/5 hover:bg-[#da2032] text-slate-300 hover:text-white transition-colors border border-white/10"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0b2b55] border-t border-white/10 px-4 pt-2 pb-4 space-y-1">
          <div className="flex items-center space-x-3 py-2 border-b border-white/10 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#da2032] flex items-center justify-center font-bold text-sm">
              {studentName[0]}
            </div>
            <div>
              <div className="font-bold text-sm text-white">{studentName}</div>
              <div className="text-xs text-slate-300 uppercase">{enrollmentNo}</div>
            </div>
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive ? 'bg-[#da2032] text-white font-semibold' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
