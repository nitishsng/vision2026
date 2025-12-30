import React from "react";
import { PatientFullTypeWithObjectId } from "@/src/contexts/type";
import { Delete } from "lucide-react";
import { todayDate } from "@/src/contexts/type";
import useEligibility from "../elegibleForfeatures";

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
  const [lastAddedIndex, setLastAddedIndex] = React.useState<number | null>(
    null
  );

  // Function to calculate dynamic max for a payment row
  const getMaxForIndex = (index: number) => {
    const totalPrice = (formData.lensePrice || 0) + (formData.framePrice || 0);

    const otherPayments =
      formData.opticalPayDetails
        ?.filter((_, i) => i !== index)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

    return totalPrice - otherPayments;
  };

  // Handles field edits with dynamic max
  const handleAdvanceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedAdvance = [...formData.opticalPayDetails];

    let finalValue: string | number = value;

    if (name === "amount") {
      const numericValue = Number(value);
      const maxValue = getMaxForIndex(index);

      // Clamp value to dynamic max
      const clamped = Math.min(numericValue, maxValue);
      finalValue = clamped;

      // Update input display immediately
      e.target.value = clamped.toString();
    }

    updatedAdvance[index] = {
      ...updatedAdvance[index],
      [name]: name === "amount" ? Number(finalValue) : String(finalValue),
    };

    setFormData((prev) => ({
      ...prev,
      opticalPayDetails: updatedAdvance,
    }));
  };

  const addPayment = () => {
    setLastAddedIndex(formData.opticalPayDetails.length);
    setFormData((prev) => ({
      ...prev,
      opticalPayDetails: [
        ...prev.opticalPayDetails,
        { date: todayDate, amount: 0, transectionId: "" },
      ],
    }));
  };

const removePaymentField = (index: number) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this payment entry?"
  );
  if (!confirmed) return;

  if (index === lastAddedIndex) setLastAddedIndex(null);

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

        {formData.opticalPayDetails.length > 0 && (
          <div className="grid grid-cols-3 w-full text-xs md:text-sm font-medium text-gray-700 px-1 md:px-3">
            <label>Date</label>
            <label>T-Id</label>
            <label>Amount</label>
          </div>
        )}

        {formData.opticalPayDetails.map((med, index) => {
          const maxValue = getMaxForIndex(index);

          return (
            <div
              key={index}
              className="grid grid-cols-3 gap-1 items-end py-1 md:p-2 rounded"
            >
              <div className="flex flex-col">
                <input
                  type="date"
                  name="date"
                  value={med.date}
                  onChange={(e) => handleAdvanceChange(e, index)}
                  disabled={
                    !(index === lastAddedIndex || eligibleForFeatures(4))
                  }
                  className="border py-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                />
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  name="transectionId"
                  value={med.transectionId}
                  onChange={(e) => handleAdvanceChange(e, index)}
                  placeholder="Enter Transection ID"
                  disabled={
                    !(index === lastAddedIndex || eligibleForFeatures(4))
                  }
                  className="border p-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <input
                    type="number"
                    name="amount"
                    value={med.amount}
                    onChange={(e) => handleAdvanceChange(e, index)}
                    placeholder="Enter Amount"
                    disabled={
                      !(index === lastAddedIndex || eligibleForFeatures(4))
                    }
                    max={maxValue}
                    className="border p-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />
                  {eligibleForFeatures(4) && (
                    <button
                      type="button"
                      onClick={() => removePaymentField(index)}
                      className="bg-red-500 text-white rounded-sm px-2 md:px-4 py-2 ml-1 hover:bg-red-600 transition"
                    >
                      <Delete className="w-4 h-5 md:w-5 md:h-6" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="grid grid-cols-2 justify-between px-2 md:px-3 mt-2 w-full">
          <button
            type="button"
            onClick={addPayment}
            className="bg-blue-500 text-white rounded-sm px-2 md:px-3 py-1 md:py-2 w-fit hover:bg-blue-600 transition text-sm md:text-base"
          >
            + Add Payment
          </button>

          <div className="flex justify-end">
            <input
              type="number"
              value={formData.opticalPayDetails?.reduce(
                (sum, d) => sum + (Number(d.amount) || 0),
                0
              )}
              readOnly
              className="border py-2 min-w-[90px] md:min-w-[100px] rounded-sm bg-gray-100 text-gray-700 text-center text-sm md:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpticalPayment;
