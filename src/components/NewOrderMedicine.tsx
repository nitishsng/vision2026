import React, { useState, useEffect } from "react";
import { initialPatient, PatientFullTypeWithObjectId, todayDate } from "../contexts/type";

import toast from "react-hot-toast";
import Medicine from "./editPageComponents/Medicine";
import OpticalPayment from "./editPageComponents/OpticalPayment";
import GlassesPrescription from "./editPageComponents/GlassesPrescription";
import Diagnosis from "./editPageComponents/Diagnosis";
import { DateInput } from "./ui/DateInput";



interface PatientFormProps {
  setNewOrderForm: React.Dispatch<React.SetStateAction<boolean>>;
  setorderSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  catagory: string;
}

const NewOrder: React.FC<PatientFormProps> = ({
  setNewOrderForm,
  setorderSuccess,
  catagory,
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

  type VisionEntry = PatientFullTypeWithObjectId["vision"][number];
  type VisionKey = keyof VisionEntry["rightEye"];

  const handleNestedChange = (path: string, value: any) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const parts = path.split(".");
      const section = parts[0];
      const index = Number(parts[1]);
      if (parts.length === 1) {
        return { ...prev, [section]: value } as PatientFullTypeWithObjectId;
      }
      if (Number.isNaN(index)) return prev;

      const next: any = { ...prev };
      const arr: any[] = Array.isArray((prev as any)[section])
        ? [...(prev as any)[section]]
        : [];

      const defaults: Record<string, any> = {
        vision: {
          updateDate: todayDate,
          rightEye: { unaidedDistance: "" },
          leftEye: { unaidedDistance: "" },
        },
        examDetails: {
          updateDate: todayDate,
          adnexa: { right: "", left: "" },
          conjunctiva: { right: "", left: "" },
          cornea: { right: "", left: "" },
          anteriorChamber: { right: "", left: "" },
          iris: { right: "", left: "" },
          lens: { right: "", left: "" },
          fundus: { right: "", left: "" },
          orbit: { right: "", left: "" },
          syringing: { right: "", left: "" },
          vitreous: { right: "", left: "" },
        },
        iopPachyCCT: {
          updateDate: todayDate,
          rightEye: { methodTime: "", iop: 0 },
          leftEye: { methodTime: "", iop: 0 },
        },
        glassesPrescription: {
          updateDate: todayDate,
          use: "",
          rightEye: { sph: "", add: "" },
          leftEye: { sph: "", add: "" },
        },
        visitDetails: { visitDate: todayDate, visitPrice: 0 },
      };

      const current = arr[index] ?? defaults[section];

      if (parts[2] === "updateDate") {
        arr[index] = { ...current, updateDate: value };
      } else if (section === "vision") {
        const eye = parts[2] as "rightEye" | "leftEye";
        const key = parts[3] as VisionKey;
        arr[index] = { ...current, [eye]: { ...current[eye], [key]: value } };
      } else if (section === "glassesPrescription") {
        if (parts[2] === "use") {
          arr[index] = { ...current, use: value };
        } else {
          const eye = parts[2];
          const key = parts[3];
          const isNumeric = key === "axis";
          arr[index] = {
            ...current,
            [eye]: {
              ...current[eye],
              [key]: isNumeric ? Number(value) : value,
            },
          };
        }
      } else if (section === "iopPachyCCT") {
        const eye = parts[2];
        const key = parts[3];
        const isNumeric =
          key === "iop" || key === "correctedIop" || key === "cct";
        arr[index] = {
          ...current,
          [eye]: { ...current[eye], [key]: isNumeric ? Number(value) : value },
        };
      } else if (section === "examDetails") {
        const param = parts[2];
        const side = parts[3];
        arr[index] = {
          ...current,
          [param]: { ...current[param], [side]: value },
        };
      } else if (section === "visitDetails") {
        const key = parts[2];
        const isNumeric = key === "visitPrice";
        arr[index] = {
          ...current,
          [key]: isNumeric ? Number(value) : value,
        };
      } else {
        return prev;
      }

      next[section] = arr;
      return next as PatientFullTypeWithObjectId;
    });
  };


  // Derived totals are computed inline for display

  // set default dates
  useEffect(() => {
    const getISTDate = (date: Date) => {
      const istString = date.toLocaleString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      return istString.split(",")[0]; // returns YYYY-MM-DD
    };

    const today = getISTDate(new Date());

    const nextWeek = new Date();
    nextWeek.setDate(new Date().getDate() + 7);
    const nextWeekDate = getISTDate(nextWeek);

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
    if (catagory == "medicine") formData.catagory = "medicine";
    else if (catagory == "order") formData.catagory = "order";

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
          {catagory === "medicine" ? (
            <div>New Medicine Customer</div>
          ) : catagory === "order" ? (
            <div>New Optical Order</div>
          ) : null}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Details */}
          <section className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div>
                <label className="font-medium block text-sm md:text-base">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="ptName"
                  value={formData.ptName}
                  onChange={handleInputChange}
                  required
                  className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="font-medium block text-sm md:text-base">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleInputChange}
                  required
                  className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="font-medium block text-sm md:text-base">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="font-medium block text-sm md:text-base">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="font-medium block text-sm md:text-base">
                  Bill No {catagory === "order" && <span>*</span>}
                </label>
                <input
                  type="text"
                  name="billNo"
                  value={formData.billNo}
                  onChange={handleInputChange}
                  className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                />
              </div>
            </div>
          </section>

          {/* Order Information */}
          {catagory === "order" && (
            <section className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
                Order Information
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                  <label className="font-medium block text-sm md:text-base">
                    Order Date
                  </label>
                  <DateInput
                    name="orderDate"
                    value={formData.orderDate?.split("T")[0] || ""}
                    onChange={handleInputChange}
                    className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />

                </div>

                <div>
                  <label className="font-medium block text-sm md:text-base">
                    Delivery Date
                  </label>
                  <DateInput
                    name="deliveryDate"
                    value={formData.deliveryDate?.split("T")[0] || ""}
                    onChange={handleInputChange}
                    className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />

                </div>

                <div>
                  <label className="font-medium block text-sm md:text-base">
                    Frame ID
                  </label>
                  <input
                    type="text"
                    name="frameId"
                    value={formData.frameId}
                    onChange={handleInputChange}
                    className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="font-medium block text-sm md:text-base">
                    Frame Price
                  </label>
                  <input
                    type="number"
                    name="framePrice"
                    value={formData.framePrice}
                    onChange={handleInputChange}
                    className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="font-medium block text-sm md:text-base">
                    Lens Type
                  </label>
                  <select
                    name="lenseType"
                    value={formData.lenseType || ""}
                    onChange={handleInputChange}
                    className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
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
                  <label className="font-medium block text-sm md:text-base">
                    Lens Price
                  </label>
                  <input
                    type="number"
                    name="lensePrice"
                    value={formData.lensePrice}
                    onChange={handleInputChange}
                    className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="font-medium block text-sm md:text-base">
                    Optical Price
                  </label>
                  <input
                    type="number"
                    value={
                      (formData.framePrice || 0) + (formData.lensePrice || 0)
                    }
                    readOnly
                    className="border p-2 md:p-3 rounded w-full bg-gray-100 cursor-not-allowed text-sm md:text-base"
                  />
                </div>
              </div>
              {formData && (
                <GlassesPrescription
                  formData={formData}
                  handleNestedChange={handleNestedChange}
                  setFormData={
                    setFormData as React.Dispatch<
                      React.SetStateAction<PatientFullTypeWithObjectId>
                    >
                  }
                />
              )}
              {formData && (
                <Diagnosis
                  formData={formData}
                  handleNestedChange={handleNestedChange}
                  setFormData={
                    setFormData as React.Dispatch<
                      React.SetStateAction<PatientFullTypeWithObjectId>
                    >
                  }
                />
              )}
              {formData && (
                <OpticalPayment
                  formData={formData}
                  setFormData={
                    setFormData as React.Dispatch<
                      React.SetStateAction<PatientFullTypeWithObjectId>
                    >
                  }
                />
              )}


            </section>
          )}

          {/* Medicine Section */}
          {catagory === "medicine" && formData && (
             <Diagnosis
                  formData={formData}
                  handleNestedChange={handleNestedChange}
                  setFormData={
                    setFormData as React.Dispatch<
                      React.SetStateAction<PatientFullTypeWithObjectId>
                    >
                  }
                />
          )}

          {catagory === "medicine" && formData && (
            <Medicine
              formData={formData}
              setFormData={
                setFormData as React.Dispatch<
                  React.SetStateAction<PatientFullTypeWithObjectId>
                >
              }
            />
          )}

          {/* Financial Summary */}
          <section className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Financial Summary
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-medium block text-sm md:text-base">
                  T-Amount
                </label>
                <input
                  type="number"
                  value={
                    (formData.framePrice || 0) + (formData.lensePrice || 0)
                  }
                  readOnly
                  className="border p-1 md:p-3 rounded w-full bg-gray-100 cursor-not-allowed text-sm md:text-base"
                />
              </div>

              <div>
                <label className="font-medium block text-sm md:text-base">
                  T-Advance
                </label>
                <input
                  type="number"
                  value={
                    (formData.opticalPayDetails || []).reduce(
                      (sum, d) => sum + (Number(d.amount) || 0),
                      0
                    ) +
                    (formData.visitDetails || []).reduce(
                      (sum, v) => sum + (Number(v.visitPrice) || 0),
                      0
                    ) +
                    (formData.medicines || []).reduce(
                      (sum, m) => sum + (Number(m.price) || 0),
                      0
                    )
                  }
                  readOnly
                  className="border p-1 md:p-3 rounded w-full bg-gray-100 cursor-not-allowed text-sm md:text-base"
                />
              </div>

              <div>
                <label className="font-medium block text-sm md:text-base">
                  T-Due
                </label>
                <input
                  type="number"
                  value={
                    (formData.framePrice || 0) +
                    (formData.lensePrice || 0) -
                    (formData.opticalPayDetails || []).reduce(
                      (sum, d) => sum + (Number(d.amount) || 0),
                      0
                    )
                  }
                  readOnly
                  className="border p-1 md:p-3 rounded w-full bg-gray-100 cursor-not-allowed text-sm md:text-base"
                />
              </div>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex flex-col-2 gap-2 sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setNewOrderForm(false)}
              className="px-4 py-1 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 w-full sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                (catagory === "medicine" && formData.medicines.length < 1) ||
                (catagory === "order" &&
                  (formData.opticalPayDetails.length < 1 ||
                    formData.billNo === ""))
              }
              className="flex items-center justify-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-70 w-full sm:w-auto"
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
