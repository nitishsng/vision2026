import React from "react";
import { PatientFullTypeWithObjectId } from "../contexts/type";
import { Delete } from "lucide-react";
import { todayDate } from "../contexts/type";
import useEligibility from "./elegibleForfeatures";
interface OpticalPaymentProps {
  formData: PatientFullTypeWithObjectId;
  setFormData: React.Dispatch<
    React.SetStateAction<PatientFullTypeWithObjectId>
  >;
}

const OpticalPayment: React.FC<OpticalPaymentProps> = ({
  formData,
  setFormData,
}) => {
  const eligibleForFeatures = useEligibility();
  // ✅ Handles field edits for each payment
  const handleAdvanceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedAdvance = [...formData.opticalPayDetails];
    updatedAdvance[index] = {
      ...updatedAdvance[index],
      [name]: name === "amount" ? Number(value) : value,
    };

    setFormData((prev) => ({
      ...prev,
      opticalPayDetails: updatedAdvance,
    }));
  };

  // ✅ Adds a new payment entry
  const addPayment = () => {
    setFormData((prev) => ({
      ...prev,
      opticalPayDetails: [
        ...prev.opticalPayDetails,
        { date: todayDate, amount: 0, transectionId: "" },
      ],
    }));
  };

  // ✅ Removes a payment field by index
  const removePaymentField = (index: number) => {
    setFormData((prev) => {
      const updatedPaymentDetails = prev.opticalPayDetails.filter(
        (_, i) => i !== index
      );

      return {
        ...prev,
        opticalPayDetails: updatedPaymentDetails,
      };
    });
  };

  return (
    <div className="w-full grid md:flex rounded-md gap-1 md:gap-3">
      <div className="flex mt-3 rounded-md flex-col w-full">
        <h3 className="font-semibold text-base md:text-lg">Advance Payments</h3>

        <div className="grid grid-cols-3 w-full text-xs md:text-sm font-medium text-gray-700 px-1 md:px-3">
          <label>Date</label>
          <label>T-Id</label>
          <label>Amount</label>
        </div>

        {formData.opticalPayDetails && formData.opticalPayDetails.length > 0 ? (
          <>
            {formData.opticalPayDetails.map((med, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-1 items-end md:p-2 rounded"
              >
                <div className="flex flex-col">
                  <input
                    type="date"
                    name="date"
                    value={med.date}
                    onChange={(e) => handleAdvanceChange(e, index)}
                    className="border py-2 md:p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />
                </div>

                <div className="flex flex-col">
                  <input
                    type="text"
                    name="transectionId"
                    value={med.transectionId}
                    onChange={(e) => handleAdvanceChange(e, index)}
                    placeholder="Enter Transection ID"
                    className="border p-1 py-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex">
                    <input
                      type="number"
                      name="amount"
                      value={med.amount}
                      onChange={(e) => handleAdvanceChange(e, index)}
                      placeholder="Enter Amount"
                      className="border p-1 py-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                    />
                    <div className="relative inline-block group">
                      <button
                        type="button"
                        disabled={!eligibleForFeatures(4)}
                        onClick={() => removePaymentField(index)}
                        className="bg-red-500 text-white rounded-lg px-3 md:px-4 py-2 ml-1 hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Delete className="w-4 h-4 md:w-6 md:h-6" />
                      </button>

                      {/* Tooltip */}
                      {!eligibleForFeatures(4) && (
                        <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap hidden group-hover:block z-10">
                          You are not eligible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div></div>
        )}

        <div className="grid grid-cols-2 justify-between px-2 md:px-3 mt-2 w-full">
          <button
            type="button"
            onClick={addPayment}
            className="bg-blue-500 text-white rounded-lg px-2 md:px-3 py-2 w-fit hover:bg-blue-600 transition text-sm md:text-base"
          >
            + Add Payment
          </button>
          <div className="flex justify-end">
            <input
              type="number"
              value={formData.opticalPayDetails.reduce(
                (sum, d) => sum + (Number(d.amount) || 0),
                0
              )}
              readOnly
              className="border py-2 min-w-[90px] md:min-w-[100px] rounded-lg bg-gray-100 text-gray-700 text-center text-sm md:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpticalPayment;
