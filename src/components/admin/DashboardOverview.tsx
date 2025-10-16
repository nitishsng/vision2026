"use client";
import React, { useState } from "react";
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
export function DashboardOverview() {
  const { staffs, patients } = useDashboardData();

  // --- Date range filter states ---
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

// Helper: get YYYY-MM-DD string in IST
const getDateOnlyIST = (date : string) =>
  new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const getDateOnly = (date : Date) =>
  new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

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
    ["confirmed", "completed"].includes(p.status)
  ).length;

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

const { totalAdvance, opticalAdvance, } = patients.reduce((acc, patient) => {
  const createdDate = getDateOnlyIST(patient.visitDate ? new Date(patient.visitDate).toISOString() : ""); // patient date in IST
  const startDateOnly = start ? getDateOnly(start) : null; // start in IST
  const endDateOnly = end ? getDateOnly(end) : null; // end in IST

  // Compare only dates
  const isInRange =
    (!startDateOnly || createdDate >= startDateOnly) &&
    (!endDateOnly || createdDate <= endDateOnly);

  // Only add visit + medicine prices if in range
  if (isInRange) {
    acc.totalAdvance += (patient.visitPrice ?? 0) + (patient.medicinePrice ?? 0);
   
  }

  // Add optical payments within date range
  if (Array.isArray(patient.opticalPayDetails)) {
    const opticalSum = patient.opticalPayDetails.reduce((sum, detail) => {
      const payDate = getDateOnlyIST(detail.date);
      const isOpticalInRange =
        (!startDateOnly || payDate >= startDateOnly) &&
        (!endDateOnly || payDate <= endDateOnly);
      return isOpticalInRange ? sum + (detail.amount ?? 0) : sum;
    }, 0);
    acc.opticalAdvance +=opticalSum;
    acc.totalAdvance += opticalSum;
  }

  return acc;
}, { 
  totalAdvance: 0,
      opticalAdvance:0,
 });

  const {
    totalDue,
    totalAmount,
    opticalaPrice,
    opticalDue,
    totalVisitAmount,
    medicinAmount,
  } = filteredPatients.reduce(
    (acc, patient) => {
      acc.totalAmount += patient.totalAmount ?? 0;
      acc.totalDue += patient.totalDue ?? 0;
      acc.opticalaPrice += patient.opticalaPrice ?? 0;
      acc.opticalDue += patient.opticalDue ?? 0;
      acc.totalVisitAmount += patient.visitPrice ?? 0;
      acc.medicinAmount += patient.medicinePrice ?? 0;
      return acc;
    },
    {
      totalDue: 0,
      totalAmount: 0,
      opticalaPrice: 0,
      opticalDue: 0,
      totalVisitAmount: 0,
      medicinAmount: 0,
    }
  );

  // --- Stats ---
  const stats = {
    totalOperators: staffs.length,
    todayAppointments: filteredPatients.filter(
      (apt) =>
        new Date(apt.preferredDate).toDateString() === new Date().toDateString()
    ).length,
    pendingAppointments: filteredPatients.filter(
      (apt) => apt.status === "pending" && !apt.orderOnly
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

  const recentAppointments = filteredPatients.slice(0, 5);
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* Left side: Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
            <span>Dashboard Overview</span>
            <span className="text-[16px] md:text-xl font-bold text-green-600 bg-green-100 px-4 py-1 rounded-lg">
              ₹{totalAmount}
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
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Collection
              </p>
              <p className="text-2xl font-bold text-green-700">
                {totalAdvance}
              </p>
            </div>
            <div className="w-10 h-10 flex bg-green-100 rounded-lg items-center justify-center">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        {/* 💼 Total Visit Amount */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Visit Amount
              </p>
              <p className="text-2xl font-bold text-purple-700">
                {totalVisitAmount}
              </p>
            </div>
            <div className="w-10 h-10 flex bg-purple-100 rounded-lg items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
        {/* medicine */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Mediccine Amount
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {medicinAmount}
              </p>
            </div>
            <div className="w-10 h-10 flex bg-blue-100 rounded-lg items-center justify-center">
              <IndianRupee className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        {/* 💵 Optical Collection */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Optical Collection
              </p>
              <p className="text-2xl font-bold text-green-700">
                {opticalAdvance}
              </p>
            </div>
            <div className="w-10 h-10 flex bg-green-100 rounded-lg items-center justify-center">
              <CreditCard className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* 💰 Total Due */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Due</p>
              <p className="text-2xl font-bold text-red-700">{totalDue}</p>
            </div>
            <div className="w-10 h-10 flex bg-red-100 rounded-lg items-center justify-center">
              <Wallet className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* 👓 Total Optical */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Optical</p>
              <p className="text-2xl font-bold text-indigo-700">
                {opticalaPrice}
              </p>
            </div>
            <div className="w-10 h-10 flex bg-indigo-100 rounded-lg items-center justify-center">
              <BarChart3 className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* 🧾 Optical Due */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Optical Due</p>
              <p className="text-2xl font-bold text-orange-700">{opticalDue}</p>
            </div>
            <div className="w-10 h-10 flex bg-orange-100 rounded-lg items-center justify-center">
              <PiggyBank className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* 🧍 Total Patients */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Patients
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {totalPatients}
              </p>
            </div>
            <div className="w-10 h-10 flex bg-blue-100 rounded-lg items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* 👩‍⚕️ Total Staff */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-teal-700">
                {staffs.length}
              </p>
            </div>
            <div className="w-10 h-10 flex bg-teal-100 rounded-lg items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-teal-500" />
            </div>
          </div>
        </div>

        {/* 📅 Total Appointments */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Appointments
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {patients.filter((p) => p.orderOnly === false).length}
              </p>
            </div>
            <div className="w-10 h-10 flex bg-cyan-100 rounded-lg items-center justify-center">
              <Calendar className="h-6 w-6 text-cyan-500" />
            </div>
          </div>
        </div>

        {/* ⏳ Pending Requests */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Requests
              </p>
              <p className="text-2xl font-bold text-orange-700">
                {stats.pendingAppointments}
              </p>
            </div>
            <div className="w-10 h-10 flex bg-orange-100 rounded-lg items-center justify-center">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>
        {/* 🧾 Total Orders */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-purple-700">
                {
                  patients.filter((p) => p.billNo && p.billNo.trim() !== "")
                    .length
                }
              </p>
            </div>
            <div className="w-10 h-10 flex bg-purple-100 rounded-lg items-center justify-center">
              <Receipt className="h-6 w-6 text-purple-500" />
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
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
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
  );
}
