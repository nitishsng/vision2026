"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  CheckCircle,
  IdCard,
} from "lucide-react";
import { staffWithId } from "../../contexts/type";
import { initialStaff } from "../../contexts/type";
import { useDashboardData } from "@/src/contexts/dataCollection";
import toast from "react-hot-toast";
import bcrypt from "bcryptjs";
export function OperatorsTab() {
  const { staffs, fetchData ,isLoading} = useDashboardData();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveSuccessfully, setSaveSuccessfully] = useState(false);

  const filteredOperators = staffs.filter(
    (operator) =>
      // operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (operator.phone && operator.phone.includes(searchTerm))
  );
  const [loading, setLoading] = useState(false);

  // Initialize form state
  const [staffForm, setStaffForm] = useState<staffWithId>(initialStaff);

  // Handle input/select changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setStaffForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Example: POST to your API
    try {
      const hashedPassword = await bcrypt.hash(staffForm.password, 10);
      const staffData = { ...staffForm, password: hashedPassword };
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffData),
      });

      if (!res.ok) throw new Error("Failed to add staff");
      setLoading(false);
      const result = await res.json();
      setSaveSuccessfully(true);
      toast.success("Operator Create Successfully!");
      setTimeout(() => setSaveSuccessfully(false), 5000);
      fetchData();
      setShowAddForm(false);
      setStaffForm(initialStaff);
    } catch (err) {
      console.error(err);
    }
  };
  const deleteOperator = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service? This action cannot be undone."
    );

    if (!confirmDelete) {
      toast("Deletion cancelled.");
      return;
    }

    try {
      const res = await fetch("/api/staff", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete service");
      toast.success("Service deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service.");
    }
  };

  return (
        <div>
  {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ):(
    <div className="space-y-3 md:space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[20px] md:text-2xl font-bold text-gray-900">
            Operator Management
          </h1>
          <p className="text-gray-600 hidden lg:flex ">
            Manage system operators and their access
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 md:px-4 d:py-4 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Operator</span>
        </button>
      </div>
      {/* Success Message */}
      {saveSuccessfully && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">
              Operator Create Successfully!
            </span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white flex items-center justify-between w-full rounded-lg p-4 border border-gray-200">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Clear Button */}
        <button
          onClick={() => setSearchTerm("")}
          className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
        >
          Clear Filters
        </button>
      </div>

      {/* Operators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {filteredOperators.map((operator) => (
          <div
            key={operator.id}
            className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {operator.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-500 capitalize">
                      {operator.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <IdCard className="h-4 w-4" />
                <span>{operator.id}</span>
              </div>
              {operator.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {operator.phone ? (
                    <a
                      href={`tel:${operator.phone}`}
                      className="hover:underline"
                    >
                      {operator.phone}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{operator.email}</span>
              </div>
            </div>

            <div className="flex justify-end items-center">
              <button
                onClick={() => operator._id && deleteOperator(operator._id)}
                className="px-3 py-1.5 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Operator Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Add New Operator
            </h2>

            <form onSubmit={handleAddOperator}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Id*
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={staffForm.id}
                    required
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={staffForm.name}
                    required
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={staffForm.email}
                    required
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password*
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={staffForm.password}
                    required
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={staffForm.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={staffForm.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="operator">Operator</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  {loading ? <span className="spin"></span> : "Add Operator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredOperators.length === 0 && (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No operators found
          </h3>
          <p className="text-gray-500">
            No operators match your search criteria.
          </p>
        </div>
      )}
    </div>
      )}</div>
  );
}
