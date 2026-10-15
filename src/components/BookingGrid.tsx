'use client';

import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export interface BookingSlotItem {
  slotStart: string;
  slotEnd: string;
  isBooked: boolean;
  isOwnBooking: boolean;
  bookingId?: string;
}

interface FacilityOption {
  id: string;
  name: string;
  details?: string;
  bookings: {
    id: string;
    date: string | Date;
    slotStart: string;
    slotEnd: string;
    studentId: string;
  }[];
}

interface BookingGridProps {
  facilities: FacilityOption[];
  currentStudentId: string;
  facilityLabel: string; // e.g. "Discussion Room" or "Ground / Court"
  apiEndpoint: string; // e.g. "/api/bookings/library-rooms" or "/api/bookings/sports-grounds"
  idField: string; // "roomId" or "groundId"
  onBookingSuccess: () => void;
  defaultDate?: string;
}

const DEFAULT_SLOTS = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
  { start: '18:00', end: '19:00' },
  { start: '19:00', end: '20:00' },
  { start: '20:00', end: '21:00' },
];

export default function BookingGrid({
  facilities,
  currentStudentId,
  facilityLabel,
  apiEndpoint,
  idField,
  onBookingSuccess,
  defaultDate = '2026-10-16',
}: BookingGridProps) {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    facilities[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);

  // Compute status for each slot on selected date
  const slots: BookingSlotItem[] = DEFAULT_SLOTS.map((slot) => {
    if (!selectedFacility) {
      return { slotStart: slot.start, slotEnd: slot.end, isBooked: false, isOwnBooking: false };
    }

    const matchedBooking = selectedFacility.bookings.find((b) => {
      const bDateStr = new Date(b.date).toISOString().split('T')[0];
      return bDateStr === selectedDate && b.slotStart === slot.start;
    });

    if (matchedBooking) {
      return {
        slotStart: slot.start,
        slotEnd: slot.end,
        isBooked: true,
        isOwnBooking: matchedBooking.studentId === currentStudentId,
        bookingId: matchedBooking.id,
      };
    }

    return {
      slotStart: slot.start,
      slotEnd: slot.end,
      isBooked: false,
      isOwnBooking: false,
    };
  });

  const handleBook = async (slot: BookingSlotItem) => {
    if (!selectedFacilityId || !selectedDate) return;

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [idField]: selectedFacilityId,
          date: selectedDate,
          slotStart: slot.slotStart,
          slotEnd: slot.slotEnd,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book slot');
      }

      setMessage({ text: `Booked successfully for ${slot.slotStart} - ${slot.slotEnd}!`, type: 'success' });
      onBookingSuccess();
    } catch (err: any) {
      setMessage({ text: err.message || 'Error booking slot', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(`${apiEndpoint}?id=${bookingId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      setMessage({ text: 'Booking cancelled successfully', type: 'success' });
      onBookingSuccess();
    } catch (err: any) {
      setMessage({ text: err.message || 'Error cancelling booking', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-base text-[#002147]">Book a {facilityLabel}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Select facility, choose date, and reserve your 1-hour slot</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Select {facilityLabel}
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#002147]"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.details ? `(${f.details})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Reservation Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#002147]"
            />
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Slot Grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span>Available Daily Slots (09:00 - 21:00)</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#da2032]"></span> Your Booking
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {slots.map((slot) => {
            if (slot.isOwnBooking) {
              return (
                <div
                  key={slot.slotStart}
                  className="bg-red-50 border-2 border-[#da2032] rounded-xl p-3 text-center flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="text-xs font-bold text-[#da2032]">
                      {slot.slotStart} - {slot.slotEnd}
                    </div>
                    <span className="inline-block mt-1 text-[10px] bg-[#da2032] text-white px-2 py-0.5 rounded font-semibold">
                      Your Slot
                    </span>
                  </div>
                  <button
                    onClick={() => slot.bookingId && handleCancel(slot.bookingId)}
                    disabled={loading}
                    className="mt-2 text-[11px] font-semibold text-red-700 hover:text-red-900 underline"
                  >
                    Cancel
                  </button>
                </div>
              );
            }

            if (slot.isBooked) {
              return (
                <div
                  key={slot.slotStart}
                  className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-center opacity-60 cursor-not-allowed"
                >
                  <div className="text-xs font-semibold text-slate-500">
                    {slot.slotStart} - {slot.slotEnd}
                  </div>
                  <span className="inline-block mt-1 text-[10px] text-slate-400 font-medium">
                    Occupied
                  </span>
                </div>
              );
            }

            return (
              <button
                key={slot.slotStart}
                onClick={() => handleBook(slot)}
                disabled={loading}
                className="bg-white hover:bg-emerald-50 border border-emerald-300 hover:border-emerald-500 rounded-xl p-3 text-center transition-all group shadow-2xs hover:shadow-xs"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  {slot.slotStart} - {slot.slotEnd}
                </div>
                <span className="inline-block mt-1 text-[10px] text-emerald-600 font-semibold group-hover:underline">
                  Book Slot &rarr;
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
