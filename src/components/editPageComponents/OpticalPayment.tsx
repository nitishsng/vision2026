
import React from "react";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import { Delete } from "lucide-react";
import { DateInput } from "../ui/DateInput";
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
        { date: todayDate, amount: 0, transectionId: "", mode: "offline" as "online" | "offline" },
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
        <h3 className="font-semibold text-base">Advance Payments</h3>

        {formData.opticalPayDetails.length > 0 && (
          <div className="grid grid-cols-[80px_55px_1fr] gap-1 w-full text-[10px] md:text-xs font-bold mt-2">
            <div className="px-1 py-1 rounded-t-sm">Date</div>
            <div className="px-1 py-1 rounded-t-sm">Mode</div>
            <div className="px-1 py-1 rounded-t-sm flex overflow-hidden">
              <div className="w-[40%] border-r border-red-500/30">T-Id</div>
              <div className="w-[60%]">Amount</div>
            </div>
          </div>
        )}

        {formData.opticalPayDetails.map((med, index) => {
          const maxValue = getMaxForIndex(index);

          return (
<div
  key={index}
  className="grid grid-cols-[80px_55px_1fr] gap-1 items-center py-1 w-full"
>
  {/* Date */}
  <DateInput
    name="date"
    value={med.date}
    onChange={(e) => handleAdvanceChange(e, index)}
    disabled={!(index === lastAddedIndex || eligibleForFeatures(4))}
    className="border px-1 py-2 text-[15px] w-full"
  />

  {/* Mode */}
  <select
    name="mode"
    value={med.mode}
    onChange={(e) => handleAdvanceChange(e, index)}
    disabled={!(index === lastAddedIndex || eligibleForFeatures(4))}
    className="border px-1 py-2 text-[15px] w-full"
  >
    <option value="offline">Off</option>
    <option value="online">On</option>
  </select>

  {/* Right side (compact inline) */}
  <div className="flex items-center gap-1 min-w-0">
    <input
      type="text"
      name="transectionId"
      value={med.transectionId}
      onChange={(e) => handleAdvanceChange(e, index)}
      placeholder="T"
      disabled={!(index === lastAddedIndex || eligibleForFeatures(4))}
      className="border px-1 py-2 text-[15px] w-[40%]"
    />

    <input
      type="number"
      name="amount"
      value={med.amount}
      onChange={(e) => handleAdvanceChange(e, index)}
      placeholder="₹"
      disabled={!(index === lastAddedIndex || eligibleForFeatures(4))}
      max={maxValue}
      className="border px-1 py-2 text-[15px] w-[60%]"
    />

    {eligibleForFeatures(4) && (
      <button
        type="button"
        onClick={() => removePaymentField(index)}
        className="bg-red-500 text-white px-1 py-1"
      >
        <Delete className="w-5 h-5" />
      </button>
    )}
  </div>
</div>
          );
        })}

        <div className="grid grid-cols-2 justify-between px-2 md:px-3 mt-2 w-full">
          <button
            type="button"
            onClick={addPayment}
            className="bg-blue-500 text-white rounded-sm px-2 md:px-3 py-2 w-fit hover:bg-blue-600 transition text-sm md:text-base h-full"
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
              className="border py-2 min-w-[90px] md:min-w-[100px] rounded-sm bg-gray-100 text-gray-700 text-center text-sm md:text-base w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpticalPayment;
