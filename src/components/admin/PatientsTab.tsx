"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Edit, Eye, Delete, Plus } from "lucide-react";
import { useDashboardData } from "@/src/contexts/dataCollection";
import { DateInput } from "../ui/DateInput";

import Link from "next/link";
import ExportPatientsDetails from "../ExportPatientsDetails";
import { todayDate } from "@/src/contexts/type";
import { PatientFullType } from "@/src/contexts/type";
import PatientDetailsModal from "./PatientDetailsModal";
import NewPatient from "../AppointmentForm";
import useEligibility from "../elegibleForfeatures";
import { useAuth } from "@/src/contexts/AuthContext";
export function PatientsTab() {
  const eligibleForFeatures = useEligibility();
  const { user } = useAuth();
  const { patients, fetchData, isLoading } = useDashboardData();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(todayDate);
  const [repeatedFilter, setRepeatedFilter] = useState(""); // ✅ new filter
  const [newPatintModel, setNewPatintModel] = useState(false);
  const formatDateDisplay = (date: Date | string) => {
    const d = new Date(date); // handle string or Date object
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()); // last 2 digits
    return `${year}-${month}-${day}`;
  };

  const [viewDetails, setviewDetails] = useState<PatientFullType | null>(null);
  const [ViewDetailsOpen, setViewDetailsOpen] = useState(false);

  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (bookingSuccess) {
      fetchData();
    }
  }, [bookingSuccess]);

  const filteredPatients = patients.filter((patient) => {
    const patientCatagory = patient.catagory === "patient";
    const matchStatus =
      patient.ptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    return (
      matchStatus &&
      matchRepeated &&
      matchesDate &&
      validpatient &&
      patientCatagory
    );
  });

  const handleDeleteClick = async (patient: any) => {
    try {
      const id = (patient as any)?._id;
      if (!id) {
        return;
      }
      const confirmed = window.confirm("Delete this patient record?");
      if (!confirmed) return;
      const res = await fetch(`/api/patient?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        return;
      }
      localStorage.setItem("activeTab", "patients");
      fetchData();
    } catch (err) {}
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="space-y-2 md:space-x-6">
          <div className="flex justify-between items-center p-2">
            <div>
              <div className="md:flex">
                <div className="text-[20px] md:text-2xl font-bold text-gray-900 mr-4">
                  Patients Management
                </div>
                {user?.staffGrade &&
                  !eligibleForFeatures(5) &&
                  user.role == "admin" && <ExportPatientsDetails />}
              </div>

              <p className="text-gray-600 hidden lg:flex ">
                Manage patient records and prescription information
              </p>
            </div>

            {eligibleForFeatures(3) && (
              <div className="inline-block">
                <button
                  onClick={() => setNewPatintModel(true)}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Patient</span>
                </button>
              </div>
            )}
          </div>
          {newPatintModel && (
            <div>
              <NewPatient
                setShowBookingForm={setNewPatintModel}
                setBookingSuccess={setBookingSuccess}
                setFrom={"staff"}
              />
            </div>
          )}

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

              <div className="grid grid-cols-3 md:grid-cols-3 gap-1">
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
                {/* Date Filter */}
        <DateInput
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border p-2 rounded-lg w-full md:w-auto focus:ring-2 focus:ring-teal-500"
          placeholder="Filter by Date"
        />
                </div>
                <div className="flex items-end ">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setRepeatedFilter("");
                      setDateFilter("");
                    }}
                    className="w-full px-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear filter
                  </button>
                </div>
              </div>
            </div>
          </div>
          {ViewDetailsOpen && (
            <PatientDetailsModal
              open={ViewDetailsOpen}
              onClose={() => setViewDetailsOpen(false)}
              data={viewDetails}
            />
          )}

          {/* Patients Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Visit Date
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Patient Name
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Phone No
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Diagnosis
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient, index) => (
                    <tr
                      key={index}
                      className={`transition-colors ${
                        (patient.framePrice || 0) +
                          (patient.lensePrice || 0) -
                          (patient.opticalPayDetails || []).reduce(
                            (sum, d) => sum + (Number(d.amount) || 0),
                            0
                          ) >
                        0
                          ? "bg-red-50"
                          : "bg-white text-gray-800"
                      } hover:bg-gray-50`}
                    >
                      {/* Visit Date */}
                      <td className="px-2 md:px-4 py-2 flex items-center gap-1 whitespace-nowrap">
                        <div className="flex gap-1 items-center">
                          {/* Repeated / status dots */}
                          <div className="flex flex-col gap-1 items-center justify-center">
                            {patient.repeated && (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                            )}
                            {(patient.framePrice || 0) +
                              (patient.lensePrice || 0) >
                              0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            )}
                            {(patient.medicines?.length || 0) > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-800"></span>
                            )}
                            {!(
                              patient.repeated ||
                              (patient.framePrice || 0) +
                                (patient.lensePrice || 0) >
                                0 ||
                              (patient.medicines?.length || 0) > 0
                            ) && (
                              <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
                            )}
                          </div>

                          {/* Full formatted date */}
                          <span className="whitespace-nowrap">
                            {patient.visitDate
                              ? new Date(patient.visitDate).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                )
                              : ""}
                          </span>
                        </div>
                      </td>

                      {/* Patient Name */}
                      <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm font-semibold whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {patient.ptName}
                            </p>
                            {patient.email && (
                              <p className="text-xs text-gray-500 truncate">
                                {patient.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone No */}
                      <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm font-semibold whitespace-nowrap">
                        {patient.phoneNo ? (
                          <a
                            href={`tel:${patient.phoneNo}`}
                            className="hover:underline"
                          >
                            {patient.phoneNo}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>

                      {/* Diagnosis */}
                      <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm font-semibold whitespace-nowrap">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium truncate">
                          {(() => {
                            const diag = patient.diagnosis?.[0];
                            if (!diag) return "N/A";
                            return typeof diag === "string" ? diag : diag.value;
                          })()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm text-center whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setviewDetails(patient);
                              setViewDetailsOpen(true);
                            }}
                            className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>

                          <div className="flex items-center space-x-2">
                            {/* Edit Button */}
                            {eligibleForFeatures(3) && (
                              <Link href={`edit/${patient._id}`}>
                                <button className="text-teal-600 p-1 rounded hover:text-teal-800 transition-colors">
                                  <Edit className="h-5 w-5" />
                                </button>
                              </Link>
                            )}

                            {/* Delete Button */}
                            {eligibleForFeatures(4) && (
                              <div className="inline-block">
                                <button
                                  onClick={() => handleDeleteClick(patient)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                  title="Delete Patient"
                                >
                                  <Delete className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>
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
      )}
    </div>
  );
}
