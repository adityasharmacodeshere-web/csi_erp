'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ChartItem {
  day: string;
  hours: number;
  date: string;
}

interface TimeChartProps {
  data: ChartItem[];
  title?: string;
  subtitle?: string;
  barColor?: string;
}

export default function TimeChart({
  data,
  title = 'Daily Time Tracking (Current Month)',
  subtitle = 'Hours recorded via campus RFID & Face-Recognition gates',
  barColor = '#00418d',
}: TimeChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-80 flex items-center justify-center">
        <div className="animate-pulse text-sm text-slate-400">Loading chart analytics...</div>
      </div>
    );
  }

  // Filter to days that have activity or are within the 1..15 span
  const visibleData = data.filter((d) => d.hours > 0 || parseInt(d.day) <= 16);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#002147]">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={visibleData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              angle={-30}
              textAnchor="end"
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              unit="h"
            />
            <Tooltip
              formatter={(value: any) => [`${value} hours`, 'Duration']}
              contentStyle={{
                backgroundColor: '#002147',
                borderColor: '#0b2b55',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#93c5fd', fontWeight: 'bold' }}
            />
            <Bar dataKey="hours" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
