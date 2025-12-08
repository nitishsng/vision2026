"use client";
import React, { useState ,useEffect} from "react";
import {
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  PiggyBank,
  IndianRupee,
  CreditCard,
  TrendingUp,
  BarChart3,
  Receipt,
} from "lucide-react";

import { useDashboardData } from "@/src/contexts/dataCollection";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  normalizeYYYYMMDD,
  isInRange,
  sumVisit,
  sumMedicines,
  sumOpticalPayments,
  computeTotals,
} = require("@/src/utils/dateFilters.js");
export function DashboardOverview() {
  const { staffs, patients, isLoading } = useDashboardData();

  // --- Date range filter states ---
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

// Helper: get YYYY-MM-DD string (IST)
const getDateOnlyIST = (date: string) => normalizeYYYYMMDD(date) || "";
const getDateOnly = (date: Date) => normalizeYYYYMMDD(date) || "";

  // --- Filter patients by createdAt date range ---
const filteredPatients = patients.filter((p) => {
  const created = getDateOnlyIST(p.visitDate ? new Date(p.visitDate).toISOString() : ""); // patient date in IST
  const startDateOnly = startDate ? getDateOnlyIST(startDate) : null; // start in IST
  const endDateOnly = endDate ? getDateOnlyIST(endDate) : null; // end in IST
  // Check inclusive range: start <= created <= end
  if (startDateOnly && created < startDateOnly) return false;
  if (endDateOnly && created > endDateOnly) return false;

  return true;
});
  

  // --- Totals ---
  const totalPatients = filteredPatients.filter((p) =>
    ["confirmed", "completed"].includes((p.status ?? "") as string)
  ).length;

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

// const total=

useEffect(() => {
console.log(startDate)
}, [startDate])




const totals = computeTotals(patients, startDate, endDate);
const totalAdvance = totals.totalAdvance;
const opticalAdvance = totals.opticalTotal;

// Derived aggregates over filtered range
const opticalaPrice = filteredPatients.reduce((sum, p) => sum + ((Number(p.framePrice) || 0) + (Number(p.lensePrice) || 0)), 0);
const opticalDue = filteredPatients.reduce((sum, p) => {
  const paid = Array.isArray(p.opticalPayDetails) ? p.opticalPayDetails.reduce((s, d) => s + (Number(d.amount) || 0), 0) : 0;
  const due = (Number(p.framePrice) || 0) + (Number(p.lensePrice) || 0) - paid;
  return sum + due;
}, 0);
const totalDue = opticalDue;

  const totalVisitAmount = sumVisit(patients, startDate, endDate);
  const medicinAmount = sumMedicines(patients, startDate, endDate);

  // --- Stats ---
  const stats = {
    totalOperators: staffs.length,
    todayAppointments: filteredPatients.filter(
      (apt) =>
        apt.preferredDate &&
        new Date(apt.preferredDate).toDateString() === new Date().toDateString()
    ).length,
    pendingAppointments: filteredPatients.filter(
      (apt) => apt.status === "pending"
    ).length,
    confirmedAppointments: filteredPatients.filter(
      (apt) => apt.status === "confirmed"
    ).length,
    completedAppointments: filteredPatients.filter(
      (apt) => apt.status === "completed"
    ).length,
    cancelledAppointments: filteredPatients.filter(
      (apt) => apt.status === "cancelled"
    ).length,
  };

  const cleanedPatients = filteredPatients.filter(p => p.status !== "pending");

const recentAppointments = cleanedPatients.slice(0, 5);


  return (
    <div>
  {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ):(

    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* Left side: Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
            <span>Dashboard Overview</span>
            <span className="text-[16px] md:text-xl font-bold text-green-600 bg-green-100 px-4 py-1 rounded-lg">
              ₹{totalAdvance + opticalDue}
            </span>
          </h1>
          <p className="text-gray-600 mt-1 hidden md:block">
            Welcome back! Here's what's happening at your clinic today.
          </p>
        </div>

        {/* Right side: Date filters */}
        <div className="flex justify-end w-full md:w-fit gap-2 mt-4 md:mt-0">
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
        </div>
      </div>

    

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4 gap-2">
        {/* 💸 Total Amount */}

        {/* 💳 Total Collection */}
<div className="bg-white rounded-xl p-2 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
  <div className="items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">
        Total Collection
      </p>
    </div>

    <div className="flex rounded-lg items-center justify-between gap-2">
      <p className="text-2xl font-bold text-green-700">
        {totalAdvance}
      </p>

      {/* Responsive Icon Size */}
      <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
    </div>
  </div>
</div>

{/* 💼 Total Visit Amount */}
<div className="bg-white rounded-xl p-2 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
  <div className="">
    <p className="text-sm font-medium text-gray-600">Total Visit Amount</p>

    <div className="flex items-center justify-between gap-2 mt-1">
      <p className="text-2xl font-bold text-purple-700">{totalVisitAmount}</p>
      <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
    </div>
  </div>
</div>


{/* 💊 Medicine */}
<div className="bg-white rounded-xl p-2 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
  <div>
    <p className="text-sm font-medium text-gray-600">Medicine Amount</p>

    <div className="flex items-center justify-between gap-2 mt-1">
      <p className="text-2xl font-bold text-blue-700">{medicinAmount}</p>
      <IndianRupee className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
    </div>
  </div>
</div>


{/* 💵 Optical Collection */}
<div className="bg-white rounded-xl p-2 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
  <div>
    <p className="text-sm font-medium text-gray-600">Optical Collection</p>

    <div className="flex items-center justify-between gap-2 mt-1">
      <p className="text-2xl font-bold text-green-700">{opticalAdvance}</p>
      <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
    </div>
  </div>
</div>


{/* 👓 Total Optical */}
<div className="bg-white rounded-xl p-2 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
  <div>
    <p className="text-sm font-medium text-gray-600">Total Optical</p>

    <div className="flex items-center justify-between gap-2 mt-1">
      <p className="text-2xl font-bold text-indigo-700">{opticalaPrice}</p>
      <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-indigo-500" />
    </div>
  </div>
</div>


{/* 🧾 Optical Due */}
<div className="bg-white rounded-xl p-2 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
  <div>
    <p className="text-sm font-medium text-gray-600">Optical Due</p>

    <div className="flex items-center justify-between gap-2 mt-1">
      <p className="text-2xl font-bold text-orange-700">{opticalDue}</p>
      <PiggyBank className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
    </div>
  </div>
</div>


{/* 🧍 Total Patients */}
<div className="bg-white rounded-xl p-2 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
  <div>
    <p className="text-sm font-medium text-gray-600">Total Patients</p>

    <div className="flex items-center justify-between gap-2 mt-1">
      <p className="text-2xl font-bold text-blue-700">{totalPatients}</p>
      <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
    </div>
  </div>
</div>


{/* 🧾 Total Orders */}
<div className="bg-white rounded-xl p-2 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
  <div>
    <p className="text-sm font-medium text-gray-600">Total Orders</p>

    <div className="flex items-center justify-between gap-2 mt-1">
      <p className="text-2xl font-bold text-purple-700">
        {patients.filter((p) => p.billNo && p.billNo.trim() !== "").length}
      </p>
      <Receipt className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
    </div>
  </div>
</div>


      </div>
      {/* Appointment Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-4 gap-3">
        <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Appointment Status
          </h3>
          <div className="space-y-1 md:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="font-semibold text-orange-600">
                {stats.pendingAppointments}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">Confirmed</span>
              </div>
              <span className="font-semibold text-green-600">
                {stats.confirmedAppointments}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-gray-700">Completed</span>
              </div>
              <span className="font-semibold text-blue-600">
                {stats.completedAppointments}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-gray-700">Cancelled</span>
              </div>
              <span className="font-semibold text-red-600">
                {stats.cancelledAppointments}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 md:mb-4">
            Recent Appointments
          </h3>
          <div className="space-y-3">
            {recentAppointments.map((appointment,index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {appointment.ptName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appointment.preferredDate} at {appointment.preferredTime}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === "pending"
                      ? "bg-orange-100 text-orange-700"
                      : appointment.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : appointment.status === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      )
      }

    </div>
  );
}

