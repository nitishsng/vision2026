'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboardData } from '@/src/contexts/dataCollection';
import { DateInput } from "../ui/DateInput";

export function ScheduleTab() {
  const { patients } = useDashboardData();
  const appointments = patients.filter((a) => a.status !== 'completed');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

 const dayAppointments = appointments
  .filter((apt) => apt.preferredDate === formatDate(selectedDate))
  .sort((a, b) => (a.preferredTime || "").localeCompare(b.preferredTime || ""));

  const previousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const timeSlots = [
    '09:00', '09:30',
    '10:00', '10:30',
    '11:00', '11:30',
    '12:00', '12:30',
    '13:00', '13:30',
    '14:00', '14:30',
    '15:00', '15:30',
    '16:00', '16:30',
    '17:00', '17:30',
    '18:00'
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
        <p className="text-gray-600 hidden lg:flex">
          View and manage daily appointment schedule
        </p>
      </div>

      {/* Date Navigator */}
      <div className="bg-white rounded-lg p-3 md:p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <button
            onClick={previousDay}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h1 className="text-[16px] md:text-xl font-bold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h1>
            <p className="text-sm text-gray-500">
              {dayAppointments.length} appointments scheduled
            </p>
          </div>
          <button
            onClick={nextDay}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-center">
          <DateInput
            value={formatDate(selectedDate)}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setSelectedDate(new Date());
                return;
              }
              const parsed = new Date(val);
              if (!isNaN(parsed.getTime())) {
                setSelectedDate(parsed);
              } else {
                setSelectedDate(new Date());
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Daily Schedule</h3>
        </div>

        <div className="p-2 md:p-4">
          <div className="space-y-2">
            {timeSlots.map((time) => {
              const timeAppointments = dayAppointments.filter(
                (apt) => apt.preferredTime === time
              );

              return (
                <div
                  key={time}
                  className="flex items-start border-b border-gray-100 py-1 "
                >
                  <div className="w-14 text-sm font-medium text-gray-600 mt-1">{time}</div>
                  <div className="flex-1 ml-2 md:ml-4">
                    {timeAppointments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {timeAppointments.map((appointment, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 min-w-[220px] md:min-w-[250px] lg:min-w-[280px] p-2  rounded-lg border-l-4 ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-50 border-green-400'
                                : appointment.status === 'pending'
                                ? 'bg-orange-50 border-orange-400'
                                : appointment.status === 'completed'
                                ? 'bg-blue-50 border-blue-400'
                                : 'bg-red-50 border-red-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {appointment.ptName}
                                </p>
                                {/* <p className="text-sm text-gray-600">
                                  Age: {appointment.age} • {appointment.phoneNo}
                                </p> */}
                                <p className="text-sm text-gray-600 capitalize">
                                  {appointment.purpose.replace('-', ' ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-1 border-2 border-dashed border-gray-200 rounded-lg text-center">
                        <p className="text-sm text-gray-400">
                          No appointment scheduled
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Today's Appointments
              </p>
              <p className="text-xl font-bold flex justify-center text-gray-900">
                {dayAppointments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-5 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Today</p>
              <p className="text-xl font-bold flex justify-center text-gray-900">
                {dayAppointments.filter((apt) => apt.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-5 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed Today</p>
              <p className="text-xl font-bold flex justify-center text-gray-900">
                {dayAppointments.filter((apt) => apt.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
