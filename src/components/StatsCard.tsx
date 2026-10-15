'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'info' | 'danger';
  };
  accentColor?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  accentColor = 'border-l-[#002147]',
}: StatsCardProps) {
  const badgeClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-l-4 ${accentColor} hover:shadow-md transition-shadow relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#002147] mt-1 tracking-tight">
            {value}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#00418d] shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {badge && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center">
          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${badgeClasses[badge.variant]}`}>
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
}
