import React, { useState, useEffect } from "react";
import { initialPatient, PatientFullTypeWithObjectId } from "../contexts/type";
import toast from "react-hot-toast";

interface PatientFormProps {
  setNewOrderForm: React.Dispatch<React.SetStateAction<boolean>>;
  setorderSuccess: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewOrder: React.FC<PatientFormProps> = ({
  setNewOrderForm,
  setorderSuccess,
}) => {
  const [formData, setFormData] =
    useState<PatientFullTypeWithObjectId>(initialPatient);
  const [loading, setLoading] = useState(false);

  // handle all inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? parseFloat(value) || 0 : value;

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  // auto calculate totals
  useEffect(() => {
    const opticalaPrice =
      Number(formData.framePrice) + Number(formData.lensePrice);
    const totalAmount = opticalaPrice;
    const totalAdvance = Number(formData.opticalAdvance);
    const totalDue = totalAmount - totalAdvance;
    const opticalDue=opticalaPrice-Number(formData.opticalAdvance);
    setFormData((prev) => ({
      ...prev,
      opticalaPrice,
      totalAmount,
      totalAdvance,
      opticalDue,
      totalDue,
    }));
  }, [formData.framePrice, formData.lensePrice, formData.opticalAdvance]);

  // set default dates
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date();
    nextWeek.setDate(new Date().getDate() + 7);
    const nextWeekDate = nextWeek.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      orderDate: today,
      deliveryDate: nextWeekDate,
    }));
  }, []);

  // submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    formData.orderOnly=true;
    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save order");

      toast.success("Order saved successfully");
      setorderSuccess(true);
      setTimeout(() => setorderSuccess(false), 4000);
      setNewOrderForm(false);
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🧾 New Optical Order
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 👤 Customer Details */}
          <section className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Customer Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="font-medium mb-1 block">Full Name</label>
                <input
                  type="text"
                  name="ptName"
                  value={formData.ptName}
                  onChange={handleInputChange}
                  required
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleInputChange}
                  required
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Bill No</label>
                <input
                  type="text"
                  name="billNo"
                  value={formData.billNo}
                  onChange={handleInputChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </section>

          {/* 🕓 Order Information */}
          <section className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Order Information
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="font-medium mb-1 block">Order Date</label>
                <input
                  type="date"
                  name="orderDate"
                  value={formData.orderDate?.split("T")[0] || ""}
                  onChange={handleInputChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Delivery Date</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate?.split("T")[0] || ""}
                  onChange={handleInputChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Frame ID</label>
                <input
                  type="text"
                  name="frameId"
                  value={formData.frameId}
                  onChange={handleInputChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Frame Price</label>
                <input
                  type="number"
                  name="framePrice"
                  value={formData.framePrice}
                  onChange={handleInputChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Lens Type</label>
                <select
                  name="lenseType"
                  value={formData.lenseType || ""}
                  onChange={handleInputChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" disabled>
                    Select Lens Type
                  </option>
                  <option value="progressive">Progressive</option>
                  <option value="single-vision">Single Vision</option>
                  <option value="bifocal">Bifocal</option>
                  <option value="trifocal">Trifocal</option>
                  <option value="reading">Reading</option>
                </select>
              </div>

              <div>
                <label className="font-medium mb-1 block">Lens Price</label>
                <input
                  type="number"
                  name="lensePrice"
                  value={formData.lensePrice}
                  onChange={handleInputChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Optical Price</label>
                <input
                  type="number"
                  name="opticalaPrice"
                  value={formData.opticalaPrice}
                  readOnly
                  className="border p-3 rounded w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Pay (Advance)</label>
                <input
                  type="number"
                  name="opticalAdvance"
                  value={formData.opticalAdvance}
                  onChange={handleInputChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </section>

          {/* 💰 Financial Summary */}
          <section className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Financial Summary
            </h3>

            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
              <div>
                <label className="font-medium mb-1 block">Total Amount</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  readOnly
                  className="border p-3 rounded w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Total Advance</label>
                <input
                  type="number"
                  name="totalAdvance"
                  value={formData.totalAdvance}
                  readOnly
                  className="border p-3 rounded w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Total Due</label>
                <input
                  type="number"
                  name="totalDue"
                  value={formData.totalDue}
                  readOnly
                  className="border p-3 rounded w-full bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setNewOrderForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
