'use client';

import React from 'react';

export default function LoadingSpinner({ message = 'Loading Bennett Portal data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-[#da2032] border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{message}</p>
    </div>
  );
}
