"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Phone,
  Eye,
  Plus,
  Search,
  CheckCircle,
} from "lucide-react";
import { useDashboardData } from "@/src/contexts/dataCollection";
import AppointmentForm from "@/src/components/AppointmentForm";
import { PatientFullTypeWithObjectId } from "@/src/contexts/type";
import toast from "react-hot-toast";

export function AppointmentsTab() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { fetchData, patients } = useDashboardData();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
    const today= new Date().toLocaleString('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
  const [dateFilter, setDateFilter] = useState(today);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Track local edits for status as an array
  const [editedAppointments, setEditedAppointments] = useState<
    PatientFullTypeWithObjectId[]
  >([]);
  useEffect(() => {
    fetchData();
  }, [showBookingForm]);

  const filteredAppointments = patients.filter((appointment) => {
    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;
    const matchesSearch =
      appointment.ptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.phoneNo.includes(searchTerm);
    const matchesDate = !dateFilter || appointment.preferredDate === dateFilter;
    const validAppointment = appointment.orderOnly == false ;
        return matchesStatus && matchesSearch && matchesDate && validAppointment;
  });

  // Track status changes locally
  const handleStatusChange = (
    appointment: PatientFullTypeWithObjectId,
    newStatus: string
  ) => {
    const updated: PatientFullTypeWithObjectId = {
      ...appointment,
      status: newStatus as PatientFullTypeWithObjectId["status"], // ✅ cast here
    };

    setEditedAppointments((prev) => {
      const exists = prev.find((a) => a.id === appointment.id);
      if (exists) {
        return prev.map((a) => (a.id === appointment.id ? updated : a));
      } else {
        return [...prev, updated];
      }
    });
  };

  // Save entire appointment document
  const saveAppointment = async (id: string) => {
    const updatedAppointment = editedAppointments.find((a) => a.id === id);
    if (!updatedAppointment) return;
    setSavingId(id);
    updatedAppointment.visitDate=new Date();
    try {
      const res = await fetch("/api/appointment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAppointment),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      toast.success("Saved successfully!");
      setSavingId(null);
      fetchData();
    } catch (err) {
      console.error("Error updating appointment:", err);
      toast.error("Failed to save appointment.");
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[20px] md:text-2xl font-bold text-gray-900">
            Appointments
          </h1>
          <p className="text-gray-600 hidden lg:flex ">
            View and manage all patient appointments
          </p>
        </div>
        <button
          onClick={() => setShowBookingForm(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 md:px-4 d:py-4 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Appointment</span>
        </button>
      </div>

      {/* Booking Form */}
      {showBookingForm && (
        <AppointmentForm
          setShowBookingForm={setShowBookingForm}
          setBookingSuccess={setBookingSuccess}
        />
      )}

      {/* Booking Success */}
      {bookingSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">
              Appointment booked successfully! We'll contact you soon to
              confirm.
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
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
                placeholder="Patient name or phone..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
                  setStatusFilter("all");
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

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 md:gap-4 gap-2">
        {filteredAppointments.map((appointment) => {
          const editedAppointment =
            editedAppointments.find((a) => a.id === appointment.id) ??
            appointment;

          return (
            <div
              key={appointment.id}
              className="bg-white rounded-lg p-3 md:p-5 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between ">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {appointment.ptName}{" "}
                    <span className="text-[10px] text-green-600">
                      {appointment.repeated ? "Repeated" : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Age: {appointment.age}
                  </p>
                </div>
                <div>
                  <select
                    value={editedAppointment.status}
                    onChange={(e) =>
                      handleStatusChange(appointment, e.target.value)
                    }
                    className={`text-xs rounded-full px-3 py-1 font-medium border-0 focus:ring-2 focus:ring-teal-500 ${
                      editedAppointment.status === "pending"
                        ? "bg-orange-100 text-orange-700"
                        : editedAppointment.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : editedAppointment.status === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {/* Show options based on status */}
                    {["pending", "cancelled"].includes(
                      editedAppointment.status
                    ) && (
                      <>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </>
                    )}

                    {editedAppointment.status === "confirmed" && (
                      <>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                      </>
                    )}

                    {editedAppointment.status === "completed" && (
                      <>
                        <option value="completed">Completed</option>
                      </>
                    )}
                  </select>

                  <div className="flex mt-2 items-center space-x-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span className="capitalize">
                      {appointment.purpose.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{appointment.preferredDate}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.preferredTime}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {appointment.phoneNo ? (
                    <a
                      href={`tel:${appointment.phoneNo}`}
                    >
                      {appointment.phoneNo}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              </div>

              {appointment.notes && (
                <div className="">
                  <p className="text-sm text-gray-600">
                    <strong>Notes:</strong> {appointment.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                {appointment.status !== "completed" && (
                  <button
                    onClick={() => saveAppointment(appointment.id)}
                    className="flex items-center justify-center px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium transition-colors disabled:opacity-70"
                    disabled={savingId === appointment.id}
                  >
                    {savingId === appointment.id ? (
                      <span className="spin"></span>
                    ) : (
                      "Save"
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No appointments found
          </h3>
          <p className="text-gray-500">
            No appointments match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}
