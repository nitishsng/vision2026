import React from "react";
import { PatientFullTypeWithObjectId } from "@/src/contexts/type";
type BasicInfo = {
  formData: PatientFullTypeWithObjectId;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<PatientFullTypeWithObjectId>
  >;
};

const PatientBasicInfo  : React.FC<BasicInfo> = ({ formData, handleChange, setFormData }) => {
  return (
        <div className="space-y-4">
          {/* Patient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <input
              type="text"
              name="ptName"
              value={formData.ptName}
              onChange={handleChange}
              placeholder="Patient Name"
              className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
            />
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
            >
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              placeholder="Phone Number"
              className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
            />
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="Email"
              className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
            />

            <select
              name="purpose"
              required
              onChange={handleChange}
              className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-teal-500 w-full"
            >
              <option value="">Select Purpose</option>
              <option value="eye-test">Eye Test</option>
              <option value="frame-selection">Frame Selection</option>
              <option value="consultation">Consultation</option>
            </select>

            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate || ""}
              onChange={handleChange}
              className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
            />

            <select
              name="preferredTime"
              value={formData.preferredTime || ""}
              onChange={handleChange}
              className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
            >
              {Array.from({ length: 19 }, (_, i) => {
                const hour = 9 + Math.floor(i / 2);
                const minutes = i % 2 === 0 ? "00" : "30";
                const time = `${hour.toString().padStart(2, "0")}:${minutes}`;
                return (
                  <option key={time} value={time}>
                    {time}
                  </option>
                );
              })}
            </select>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
            >
              {["pending", "cancelled"].includes(formData.status) && (
                <>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}

              {formData.status === "confirmed" && (
                <>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </>
              )}

              {formData.status === "completed" && (
                <option value="completed">Completed</option>
              )}
            </select>
          </div>

          {/* Notes & Complaints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-sm md:text-base">
                Address
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border p-2 md:p-3 rounded text-sm md:text-base w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-sm md:text-base">
                Present Complaints
              </label>
              <input
                name="presentComplaints"
                value={formData.presentComplaints}
                onChange={handleChange}
                className="border p-2 md:p-3 rounded text-sm md:text-base w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

  )
}

export default PatientBasicInfo