"use client";

import React from "react";
import { BarChart3, TrendingUp, Calendar, Users, Download } from "lucide-react";
import { useDashboardData } from "@/src/contexts/dataCollection";
export function ReportsTab() {
  const {patients, isLoading } = useDashboardData();
 const appointments = patients.filter(
  (a) => a.status === "confirmed" || a.status === "completed"
);

  const stats = {
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter(
      (apt) => apt.status === "completed"
    ).length,
    pendingAppointments: appointments.filter((apt) => apt.status === "pending")
      .length,
    confirmAppointments: appointments.filter(
      (apt) => apt.status === "confirmed"
    ).length,
    cancelledAppointments: appointments.filter(
      (apt) => apt.status === "cancelled"
    ).length,
    totalPatients: patients.length,
    thisWeekAppointments: appointments.filter((apt) => {
      const appointmentDate = new Date(apt?.createdAt);
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      return appointmentDate >= weekStart;
    }).length,
  };

  const completionRate =
    stats.totalAppointments > 0
      ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(
          1
        )
      : 0;

  return (
        <div>
  {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ):(
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[20px] md:text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 hidden lg:flex ">
            View clinic performance and statistics
          </p>
        </div>
        {/* <button className="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 md:px-4 d:py-4 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button> */}
      </div>



      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
        <div className="bg-white rounded-lg p-2 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Appointments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAppointments}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-2 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {completionRate}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-2 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.thisWeekAppointments}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-2 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Patients
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPatients}
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        <div className="bg-white rounded-lg p-2 md:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Appointment Status Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Completed</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.completedAppointments /
                          stats.totalAppointments) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.completedAppointments}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Confirm</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.confirmAppointments / stats.totalAppointments) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.completedAppointments}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Pending</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.pendingAppointments / stats.totalAppointments) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.pendingAppointments}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Cancelled</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.cancelledAppointments /
                          stats.totalAppointments) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.cancelledAppointments}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-2 md:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Service Popularity
          </h3>
          <div className="space-y-3">
            {["eye-test", "consultation", "frame-selection"].map((purpose) => {
              const count = appointments.filter(
                (apt) => apt.purpose === purpose
              ).length;
              const percentage =
                stats.totalAppointments > 0
                  ? (count / stats.totalAppointments) * 100
                  : 0;

              return (
                <div
                  key={purpose}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700 capitalize">
                    {purpose.replace("-", " ")}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
      )}</div>
  );
}
