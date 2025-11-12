"use client";

import React, { useState } from "react";
import { Users, Search, Edit, User, Eye } from "lucide-react";
import { useDashboardData } from "@/src/contexts/dataCollection";
import Link from "next/link";
import ExportPatientsDetails from "../ExportPatientsDetails";
import { todayDate } from "@/src/contexts/type";
export function PatientsTab() {
  const { patients } = useDashboardData();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(todayDate);
  const [repeatedFilter, setRepeatedFilter] = useState(""); // ✅ new filter

  const formatDateDisplay = (date: Date | string) => {
    const d = new Date(date); // handle string or Date object
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()); // last 2 digits
    return `${year}-${month}-${day}`;
  };

  const filteredPatients = patients.filter((patient) => {
    const matchStatus =
      patient.ptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRepeated =
      repeatedFilter === "" // show all
        ? true
        : repeatedFilter === "repeated"
        ? patient.repeated === true
        : patient.repeated === false;
    const validpatient =
      patient.status === "completed" || patient.status === "confirmed";
    const matchesDate =
      !dateFilter ||
      (patient.visitDate &&
        formatDateDisplay(patient.visitDate) === dateFilter);
    return matchStatus && matchRepeated && matchesDate && validpatient;
  });

  return (
    <div className="space-y-4 md:space-x-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[20px] md:text-2xl font-bold text-gray-900">
            Patients Management
          </h1>
          <p className="text-gray-600 hidden lg:flex ">
            Manage patient records and prescription information
          </p>
        </div>
        <div>
          <ExportPatientsDetails />
        </div>
      </div>
      <div className="bg-white rounded-lg p-2 md:p-5 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <div>
            <label className="hidden md:block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, phone, bill number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            <div>
              <label className="hidden md:block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="repeated"
                value={repeatedFilter}
                onChange={(e) => setRepeatedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 "
              >
                <option value="">All</option>
                <option value="repeated">Repeated</option>
                <option value="new">New</option>
              </select>
            </div>

            <div>
              <label className="hidden md:block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="hidden md:flex items-end ">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRepeatedFilter("");
                  setDateFilter("");
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visit Date
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone No
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {/* Bill No */}
                  Diagnosis
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                    <span className="flex items-center gap-2">
                      {patient.repeated ? (
                        <div className="flex space-x-1">
                          <span className="w-3 h-3 rounded-full bg-green-600"></span>
                        </div>
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-green-300"></span>
                      )}
                      <span>
                        {patient.visitDate
                          ? formatDateDisplay(patient.visitDate)
                          : ""}
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {patient.ptName}
                        </p>
                        {patient.email && (
                          <p className="text-xs text-gray-500">
                            {patient.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                    {patient.phoneNo ? (
                      <a
                        href={`tel:${patient.phoneNo}`}
                        className=" hover:underline"
                      >
                        {patient.phoneNo}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {/* {patient.billNo} */}
                      {patient.diagnosis}
                    </span>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link href={`edit/${patient._id}`}>
                        <button
                          className="text-teal-600 hover:text-teal-800 p-1 rounded transition-colors"
                          title="Edit Patient"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                        title="Delete Patient"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPatients.length === 0 && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No patients found
          </h3>
          <p className="text-gray-500">
            No patients match your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
