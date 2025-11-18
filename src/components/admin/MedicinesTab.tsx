import React, { useEffect, useState } from "react";
import { Eye, Edit, Search, Plus } from "lucide-react";
import { PatientFullTypeWithObjectId } from "@/src/contexts/type";
import { useDashboardData } from "@/src/contexts/dataCollection";
import toast from "react-hot-toast";
import NewOrder from "../NewOrderMedicine";
import Medicine from "../Medicine";

export function MedicinesTab() {
  const { patients, fetchData } = useDashboardData();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [formData, setFormData] = useState<PatientFullTypeWithObjectId | null>(
    null
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);
  const [newOrderForm, setNewOrderForm] = useState(false);
  const [orderSuccess, setorderSuccess] = useState(false);

  const formatDateDisplay = (date: Date | string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear());
    return `${year}-${month}-${day}`;
  };

  const medicinesPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.ptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const hasMedicines =
      (patient.medicines?.length || 0) > 0 || (patient.medicinePrice || 0) > 0;

    const matchesDate =
      !dateFilter ||
      (patient.medicines || []).some(
        (m) => formatDateDisplay(m.date) === dateFilter
      );

    return matchesSearch && matchesDate && hasMedicines;
  });

  const handleViewClick = (p: PatientFullTypeWithObjectId) => {
    setFormData(p);
    setIsPopupOpen(true);
  };

  const handleEditClick = (p: PatientFullTypeWithObjectId) => {
    setFormData({ ...p });
    setIsEditPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setFormData(null);
  };

  const handleCloseEditPopup = () => {
    setIsEditPopupOpen(false);
    setFormData(null);
  };

  const [saving, setSaving] = useState(false);
  const handleSaveEdit = async () => {
    const id = formData?._id;
    try {
      setSaving(true);

      const computedMedicinePrice = (formData?.medicines || []).reduce(
        (sum, m) => sum + (Number(m.price) || 0),
        0
      );

      const updatedFormData = {
        ...formData,
        updatedAt: new Date().toISOString(),
        medicinePrice: computedMedicinePrice,

        // Totals similar to OrdersTab
        totalAmount:
          (formData?.visitPrice ?? 0) +
          computedMedicinePrice +
          (formData?.framePrice ?? 0) +
          (formData?.lensePrice ?? 0),
        totalAdvance:
          (formData?.visitPrice ?? 0) +
          computedMedicinePrice +
          (formData?.opticalAdvance ?? 0),
        totalDue:
          (formData?.framePrice ?? 0) +
          (formData?.lensePrice ?? 0) -
          (formData?.opticalAdvance ?? 0),
      };

      if (!id) throw new Error("Missing patient ID");

      const res = await fetch(`/api/patient?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, ...updatedFormData }),
      });

      if (!res.ok) throw new Error("Failed to save");
      await res.json();
      localStorage.setItem("activeTab", "medicines");
      toast.success("Saved successfully!");
      fetchData();
      setIsEditPopupOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
      handleCloseEditPopup();
    }
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[20px] md:text-2xl font-bold text-gray-900">
            Medicines Management
          </h1>
          <p className="text-gray-600 hidden lg:flex ">
            Track and manage medicines
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setNewOrderForm(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 md:px-4 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 md:p-5 border border-gray-200">
        <div className="flex gap-2 md:gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, phone, bill number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Date Input */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-auto"
              style={{ width: "fit-content" }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[560px] md:min-w-full leading-normal w-full">
            <thead>
              <tr>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pt-Name
                </th>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone No
                </th>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {medicinesPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-2 md:px-4 text-gray-500 py-4"
                  >
                    No medicines found.
                  </td>
                </tr>
              ) : (
                medicinesPatients.map((p, index) => (
                  <tr
                    key={index}
                    className={`transition-colors ${
                      p.totalDue > 0 ? "bg-red-50" : "bg-white text-gray-800"
                    } hover:bg-gray-50`}
                  >
                    <td className="px-2 gap-1 flex md:px-4 py-2 border-b border-gray-200 text-sm">
                      <div>
                        {p.repeated && (
                          <div className="flex mb-[2px] space-x-1 items-center">
                            <span className="w-2 h-2 rounded-full bg-green-600"></span>
                          </div>
                        )}
                        {p.opticalaPrice > 0 && (
                          <div className="flex mb-[2px] space-x-1 items-center">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          </div>
                        )}
                      </div>
                      {p.ptName}
                    </td>
                    <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm">
                      {p.phoneNo ? (
                        <a
                          href={`tel:${p.phoneNo}`}
                          className="hover:underline"
                        >
                          {p.phoneNo}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm font-semibold">
                      {new Date(p.createdAt).toLocaleDateString("en-GB")}
                    </td>

                    <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm font-semibold">
                      ₹{p.medicinePrice || 0}
                    </td>
                    <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm text-center">
                      <div className="flex justify-center items-center space-x-3">
                        <button
                          onClick={() => handleViewClick(p)}
                          className="text-teal-600 hover:text-teal-900 focus:outline-none"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditClick(p)}
                          className="text-blue-600 hover:text-blue-900 focus:outline-none"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {newOrderForm && (
        <NewOrder
          setNewOrderForm={setNewOrderForm}
          setorderSuccess={setorderSuccess}
          catagory={"medicine"}
        />
      )}

      {isPopupOpen && formData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-8 border w-full max-w-2xl md:max-w-3xl lg:max-w-4xl shadow-lg rounded-md bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Medicine Details (Bill No: {formData.billNo})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p>
                  <strong>Patient Name:</strong> {formData.ptName}
                </p>
                <p>
                  <strong>Phone No:</strong>{" "}
                  {formData.phoneNo ? (
                    <a
                      href={`tel:${formData.phoneNo}`}
                      className="text-blue-600 hover:underline"
                    >
                      {formData.phoneNo}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p>
                  <strong>Email Id:</strong> {formData.email || "N/A"}
                </p>
                <p>
                  <strong>Age:</strong> {formData.age || "N/A"}
                </p>
                <p>
                  <strong>Gender:</strong> {formData.gender || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mt-2">Medicines:</h4>
                <div className="space-y-1">
                  {(formData.medicines || []).map((m, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        {m.date} - {m.medicinename}
                      </span>
                      <span>₹{m.price}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <strong>Total:</strong> ₹{formData.medicinePrice || 0}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 bg-teal-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditPopupOpen && formData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-2 md:p-4 border w-full max-w-2xl md:max-w-3xl lg:max-w-4xl shadow-lg rounded-xl bg-white overflow-y-auto max-h-[95vh]">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Edit Medicines (Bill No: {formData.billNo})
            </h3>
            <div className="space-y-3">
              {formData && (
                <Medicine
                  formData={formData}
                  setFormData={
                    setFormData as React.Dispatch<
                      React.SetStateAction<PatientFullTypeWithObjectId>
                    >
                  }
                />
              )}

              <div className="bg-white shadow-md rounded-2xl p-3 md:p-4 border border-gray-100">
                <div className="grid grid-cols-3 gap-1 md:gap-6">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1 text-sm md:text-base">
                      T-Amount
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={
                        (formData.visitPrice || 0) +
                        (formData.framePrice || 0) +
                        (formData.lensePrice || 0) +
                        (formData.medicinePrice || 0)
                      }
                      className="border p-2 md:p-3 rounded-lg bg-gray-100 cursor-not-allowed text-sm md:text-base"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1 text-sm md:text-base">
                      T-Advance
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={
                        (formData.opticalAdvance || 0) +
                        (formData.medicinePrice || 0) +
                        (formData.visitPrice || 0)
                      }
                      className="border p-2 md:p-3 rounded-lg bg-gray-100 cursor-not-allowed text-sm md:text-base"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1 text-sm md:text-base">
                      Total Due
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={
                        (formData.framePrice || 0) +
                        (formData.lensePrice || 0) -
                        (formData.opticalAdvance || 0)
                      }
                      className="border p-2 md:p-3 rounded-lg bg-gray-100 cursor-not-allowed text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 space-x-4">
                <button
                  onClick={handleCloseEditPopup}
                  className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                >
                  {saving ? "saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
