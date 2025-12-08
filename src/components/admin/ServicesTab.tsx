"use client";
import React, { useState } from "react";
import { Eye, Plus, Search, Clock, IndianRupee } from "lucide-react";

import { serviceWithId } from "@/src/contexts/type"; // your Service type
import { initialService } from "@/src/contexts/type"; // initialService object
import { useDashboardData } from "@/src/contexts/dataCollection";
import toast from "react-hot-toast";
export function ServicesTab() {
  const [showServiceForm, setShowServiceFrom] = useState(false);
  const { services, fetchData, isLoading } = useDashboardData();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [serviceForm, setServiceForm] = useState<serviceWithId>(initialService);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 🔹 Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value, // ensure price is number
    }));
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddNewService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch("/api/service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceForm),
      });

      if (!res.ok) {
        throw new Error("Failed to book appointment");
      }

      const result = await res.json();
      setServiceForm(initialService);
      setShowServiceFrom(false);

      toast.success("Service added successfully!");
      fetchData();
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to add service.");
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (id: string, currentStatus: boolean) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/service", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error("Failed to toggle status");

      toast.success("Status updated successfully!");
      fetchData();
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast.error("Failed to update status.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteService = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );
    if (!confirmed) {
      toast("Deletion Cancelled.");
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch("/api/service", {
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
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-[24px] md:text-2xl font-bold text-gray-900">
                Services
              </h1>
              <p className="text-gray-600 hidden lg:flex ">
                Manage eye care services and pricing
              </p>
            </div>
            <button
              onClick={() => setShowServiceFrom(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 md:px-4 d:py-4 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Service</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-2 md:p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Categories</option>
                <option value="examination">Examination</option>
                <option value="treatment">Treatment</option>
                <option value="surgery">Surgery</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{service.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <IndianRupee className="h-4 w-4" />
                    <span>₹{service.price}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs">
                      {service.category}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() =>
                      service._id &&
                      toggleServiceStatus(service._id, service.isActive)
                    }
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                      service.isActive
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                    disabled={savingId === service._id}
                  >
                    {savingId === service._id ? (
                      <span className="spin"></span>
                    ) : service.isActive ? (
                      "Deactivate"
                    ) : (
                      "Activate"
                    )}
                  </button>
                  <button
                    onClick={() => service._id && deleteService(service._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors flex items-center justify-center"
                    disabled={deletingId === service._id}
                  >
                    {deletingId === service._id ? (
                      <span className="spin"></span>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showServiceForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Add New Service
                </h2>
                <form onSubmit={handleAddNewService}>
                  <div className="space-y-2 md:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name*
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={serviceForm.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description*
                      </label>
                      <textarea
                        name="description"
                        value={serviceForm.description}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹)*
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={serviceForm.price}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration*
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={serviceForm.duration}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 30 minutes"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category*
                      </label>
                      <select
                        name="category"
                        value={serviceForm.category}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select Category</option>
                        <option value="examination">Examination</option>
                        <option value="treatment">Treatment</option>
                        <option value="surgery">Surgery</option>
                        <option value="consultation">Consultation</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowServiceFrom(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                      disabled={loading}
                    >
                      {loading ? <span className="spin"></span> : "Add Service"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {filteredServices.length === 0 && (
            <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No services found
              </h3>
              <p className="text-gray-500">
                No services match your search criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
