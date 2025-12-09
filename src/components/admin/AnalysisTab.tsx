"use client";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDashboardData } from "@/src/contexts/dataCollection";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Brush,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar, BarChart3, PieChart as PieIcon } from "lucide-react";
const df = require("@/src/utils/dateFilters.js");

type Mode = "monthly" | "quarterly" | "yearly" | "custom";
type DayAgg = {
  date: string;
  appointments: number;
  visit: number;
  medicines: number;
  optical: number;
  total: number;
};
type MonthAgg = { month: string; total: number; appointments: number };

const COLORS = [
  "#0f766e",
  "#2563eb",
  "#7c3aed",
  "#f59e0b",
  "#ef4444",
  "#10b981",
];



export function AnalysisTab() {
  const { patients, isLoading } = useDashboardData();
  const [mode, setMode] = useState<Mode>("monthly");

const istString = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
const now = new Date(istString);

  const [month, setMonth] = useState<number>(now.getMonth());
  const [quarter, setQuarter] = useState<number>(
    Math.floor(now.getMonth() / 3) + 1
  );
  const [year, setYear] = useState<number>(now.getFullYear());
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const cacheRef = useRef<Map<string, any>>(new Map());

  // ---------------------
  // RANGE LOGIC
  // ---------------------
 

  const range = useMemo(() => {
    if (mode === "monthly") {
      return {
        start: new Date(year, month, 1).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }),
        end: new Date(year, month + 1, 0).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }),
        key: `m-${year}-${month}`,
      };
    }

    if (mode === "quarterly") {
      const startMonth = (quarter - 1) * 3;
      const endMonth = startMonth + 2;
      return {
        start: new Date(year, startMonth, 1).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }),
        end: new Date(year, endMonth + 1, 0).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }),
        key: `q-${year}-${quarter}`,
      };
    }

    if (mode === "yearly") {
      return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
        key: `y-${year}`,
      };
    }

    return {
      start: startDate || "",
      end: endDate || "",
      key: `c-${startDate}-${endDate}`,
    };
  }, [mode, month, quarter, year, startDate, endDate]);

  // ---------------------
  // DATA PROCESSING
  // ---------------------
  const data = useMemo(() => {
    const key = range.key;
    if (cacheRef.current.has(key)) return cacheRef.current.get(key);
    const byDayMap = new Map<string, DayAgg>();

    patients.forEach((p: any) => {
      const visits = Array.isArray(p.visitDetails) ? p.visitDetails : [];
      visits
        .filter((e: any) => df.isInRange(e.visitDate, range.start, range.end))
        .forEach((e: any) => {
          const d = df.normalizeYYYYMMDD(e.visitDate);
          if (!d) return;
          const prev =
            byDayMap.get(d) || {
              date: d,
              appointments: 0,
              visit: 0,
              medicines: 0,
              optical: 0,
              total: 0,
            };
          const visitAmt = Number(e.visitPrice || 0);
          byDayMap.set(d, {
            date: d,
            appointments: prev.appointments + 1,
            visit: prev.visit + visitAmt,
            medicines: prev.medicines,
            optical: prev.optical,
            total: prev.total + visitAmt,
          });
        });

      const meds = Array.isArray(p.medicines) ? p.medicines : [];
      meds
        .filter((m: any) => df.isInRange(m.date, range.start, range.end))
        .forEach((m: any) => {
          const d = df.normalizeYYYYMMDD(m.date);
          if (!d) return;
          const prev =
            byDayMap.get(d) || {
              date: d,
              appointments: 0,
              visit: 0,
              medicines: 0,
              optical: 0,
              total: 0,
            };
          const medAmt = Number(m.price || 0);
          byDayMap.set(d, {
            date: d,
            appointments: prev.appointments,
            visit: prev.visit,
            medicines: prev.medicines + medAmt,
            optical: prev.optical,
            total: prev.total + medAmt,
          });
        });

      const optical = Array.isArray(p.opticalPayDetails) ? p.opticalPayDetails : [];
      optical
        .filter((o: any) => df.isInRange(o.date, range.start, range.end))
        .forEach((o: any) => {
          const d = df.normalizeYYYYMMDD(o.date);
          if (!d) return;
          const prev =
            byDayMap.get(d) || {
              date: d,
              appointments: 0,
              visit: 0,
              medicines: 0,
              optical: 0,
              total: 0,
            };
          const amt = Number(o.amount || 0);
          byDayMap.set(d, {
            date: d,
            appointments: prev.appointments,
            visit: prev.visit,
            medicines: prev.medicines,
            optical: prev.optical + amt,
            total: prev.total + amt,
          });
        });
    });

    const byDay = Array.from(byDayMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const totals = df.computeTotals(patients, range.start, range.end);

    const statusCounts = patients
      .filter((p: any) => df.isInRange(p.visitDate, range.start, range.end))
      .reduce((acc: any, p: any) => {
        const s = p.status || "unknown";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});

    const monthsMap = new Map<string, MonthAgg>();

    patients.forEach((p: any) => {
      const visits = Array.isArray(p.visitDetails) ? p.visitDetails : [];
      visits
        .filter((e: any) => df.isInRange(e.visitDate, range.start, range.end))
        .forEach((e: any) => {
          const d = df.normalizeYYYYMMDD(e.visitDate);
          if (!d) return;
          const [yy, mm] = d.split("-");
          const keyMonth = `${yy}-${mm}`;
          const prev = monthsMap.get(keyMonth) || {
            month: keyMonth,
            total: 0,
            appointments: 0,
          };
          const visitAmt = Number(e.visitPrice || 0);
          monthsMap.set(keyMonth, {
            month: keyMonth,
            total: prev.total + visitAmt,
            appointments: prev.appointments + 1,
          });
        });

      const meds = Array.isArray(p.medicines) ? p.medicines : [];
      meds
        .filter((m: any) => df.isInRange(m.date, range.start, range.end))
        .forEach((m: any) => {
          const d = df.normalizeYYYYMMDD(m.date);
          if (!d) return;
          const [yy, mm] = d.split("-");
          const keyMonth = `${yy}-${mm}`;
          const prev = monthsMap.get(keyMonth) || {
            month: keyMonth,
            total: 0,
            appointments: 0,
          };
          const medAmt = Number(m.price || 0);
          monthsMap.set(keyMonth, {
            month: keyMonth,
            total: prev.total + medAmt,
            appointments: prev.appointments,
          });
        });

      const optical = Array.isArray(p.opticalPayDetails) ? p.opticalPayDetails : [];
      optical
        .filter((o: any) => df.isInRange(o.date, range.start, range.end))
        .forEach((o: any) => {
          const d = df.normalizeYYYYMMDD(o.date);
          if (!d) return;
          const [yy, mm] = d.split("-");
          const keyMonth = `${yy}-${mm}`;
          const prev = monthsMap.get(keyMonth) || {
            month: keyMonth,
            total: 0,
            appointments: 0,
          };
          const amt = Number(o.amount || 0);
          monthsMap.set(keyMonth, {
            month: keyMonth,
            total: prev.total + amt,
            appointments: prev.appointments,
          });
        });
    });

    const byMonth = Array.from(monthsMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    const result = { byDay, totals, statusCounts, byMonth };
    cacheRef.current.set(key, result);
    return result;
  }, [patients, range]);

  const statusPieData = useMemo(
    () =>
      Object.entries(data.statusCounts).map(([name, value]) => ({
        name,
        value,
      })),
    [data.statusCounts]
  );

  const donutData = useMemo(
    () => [
      { name: "Visit", value: data.totals.visitTotal },
      { name: "Medicines", value: data.totals.medicineTotal },
      { name: "Optical", value: data.totals.opticalTotal },
    ],
    [data.totals]
  );

  // --------------------------------------------------------------------------
  // UI
  // --------------------------------------------------------------------------
  return (

    <div>
      

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin h-8 w-8 border-b-2 border-teal-500 rounded-full"></div>
        </div>
      ):(
   <div className="space-y-4 md:space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Analysis
          </h1>
          <p className="text-gray-600 hidden md:block">
            Comprehensive insights and visualizations
          </p>
        </div>
      </div>

      {/* FILTER CARD */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

          {/* MODE */}
          <div>
            <label className="text-sm text-gray-700 font-medium">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* MONTHLY */}
          {mode === "monthly" && (
            <>
              <div>
                <label className="text-sm text-gray-700 font-medium">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500"
                >
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* QUARTERLY */}
          {mode === "quarterly" && (
            <>
              <div>
                <label className="text-sm text-gray-700 font-medium">Quarter</label>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500"
                >
                  <option value={1}>Q1</option>
                  <option value={2}>Q2</option>
                  <option value={3}>Q3</option>
                  <option value={4}>Q4</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* YEARLY */}
          {mode === "yearly" && (
            <div>
              <label className="text-sm text-gray-700 font-medium">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500"
              />
            </div>
          )}

          {/* CUSTOM */}
          {mode === "custom" && (
            <>
              <div>
                <label className="text-sm text-gray-700 font-medium">Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">End</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500"
                />
              </div>
            </>
          )}
        </div>
      </div>


      {/* -----------------------
        CHARTS GRID
      ------------------------ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">

        {/* LINE CHART */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h2 className="font-semibold text-gray-800">Trend</h2>
          </div>

          <div className="h-64 md:h-72">
            <ResponsiveContainer>
              <LineChart data={data.byDay} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Brush dataKey="date" height={20} />
                <Line type="monotone" dataKey="appointments" stroke={COLORS[0]} dot={false} name="Appointments" />
                <Line type="monotone" dataKey="total" stroke={COLORS[1]} dot={false} name="Total ₹" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-700" />
            <h2 className="font-semibold text-gray-800">Monthly</h2>
          </div>

          <div className="h-64 md:h-72">
            <ResponsiveContainer>
              <BarChart data={data.byMonth} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Brush dataKey="month" height={20} />
                <Bar dataKey="appointments" fill={COLORS[0]} name="Appointments" />
                <Bar dataKey="total" fill={COLORS[1]} name="Total ₹" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STATUS PIE */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="h-5 w-5 text-gray-700" />
            <h2 className="font-semibold text-gray-800">Status</h2>
          </div>

          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" outerRadius={105}>
                  {statusPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REVENUE DONUT */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="h-5 w-5 text-gray-700" />
            <h2 className="font-semibold text-gray-800">Revenue</h2>
          </div>

          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
      )}
    </div>
 
  );
}
