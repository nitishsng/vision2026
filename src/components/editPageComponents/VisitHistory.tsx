import React from "react";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import { DateInput } from "../ui/DateInput";

import { Delete } from "lucide-react";
import useEligibility from "../elegibleForfeatures";

type VisitProps = {
  formData: PatientFullTypeWithObjectId;
  handleNestedChange: (path: string, value: any) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<PatientFullTypeWithObjectId>
  >;
};

const VisitHistory: React.FC<VisitProps> = ({
  formData,
  handleNestedChange,
  setFormData,
}) => {
  const eligibleForFeatures = useEligibility();

  // Track only newly added editable row
  const [lastAddedIndex, setLastAddedIndex] = React.useState<number | null>(
    null
  );

 // Remove visit entry with confirmation
const removeVisitObject = (index: number) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this visit entry?"
  );
  if (!confirmed) return;

  if (index === lastAddedIndex) setLastAddedIndex(null);

  setFormData((prev) => {
    if (!prev) return prev;

    const updated = (prev.visitDetails ?? []).filter((_, i) => i !== index);

    return {
      ...prev,
      visitDetails: updated,
    };
  });
};


  // Decide if row should be editable
  const isEditable = (index: number) =>
    eligibleForFeatures(4) || index === lastAddedIndex;

  return (
    <div className="flex flex-col md:w-[350px] w-full">
      
      <h3 className="font-semibold text-base">Visit History</h3>
      {formData.visitDetails && formData.visitDetails.length > 0 && (
        <div className="grid mb-2 grid-cols-[110px_70px_1fr_40px] gap-1 w-full text-[15px] md:text-xs font-bold mt-3 px-1">
          <div>Date</div>
          <div>Mode</div>
          <div>Price</div>
        </div>
      )}

      {(formData.visitDetails || []).map((v, index) => {
        const editable = isEditable(index);

        return (
    <div
  key={index}
  className="grid grid-cols-[110px_70px_1fr_40px] gap-1 items-center w-full p-1"
>
  {/* Visit Date */}
  <DateInput
    name="visitDate"
    value={v.visitDate || ""}
    onChange={(e) =>
      handleNestedChange(
        `visitDetails.${index}.visitDate`,
        e.target.value
      )
    }
    disabled={!editable}
    className={`border px-1 py-2 text-[15px] w-full min-w-0 rounded-sm ${
      !editable && "bg-gray-100 cursor-not-allowed"
    }`}
  />

  {/* Mode */}
  <select
    value={v.mode || "offline"}
    onChange={(e) =>
      handleNestedChange(
        `visitDetails.${index}.mode`,
        e.target.value
      )
    }
    disabled={!editable}
    className={`border px-1 py-2 text-[15px] w-full min-w-0 rounded-sm ${
      !editable && "bg-gray-100 cursor-not-allowed"
    }`}
  >
    <option value="offline">Off</option>
    <option value="online">On</option>
  </select>

  {/* Price */}
  <input
    type="number"
    value={Number(v.visitPrice) || 0}
    onChange={(e) =>
      handleNestedChange(
        `visitDetails.${index}.visitPrice`,
        e.target.value
      )
    }
    disabled={!editable}
    className={`border px-1 py-2 text-[15px] w-full min-w-0 rounded-sm ${
      !editable && "bg-gray-100 cursor-not-allowed"
    }`}
  />

  {/* Delete */}
  {eligibleForFeatures(4) && (
    <button
      onClick={() => removeVisitObject(index)}
        className="bg-red-500 text-white px-1 py-2 flex justify-center items-center rounded-sm"
            >
              <Delete className="w-4 h-4" />
            </button>
  )}
</div>
        );
      })}

      {/* Add New Visit + Total */}
      <div className="flex flex-col-2 justify-evenly mt-2">
        <div>
          <button
            onClick={() => {
              const list = formData.visitDetails ?? [];

              const newEntry = {
                visitDate: todayDate,
                visitPrice: 0,
                mode: "offline" as "online" | "offline",
              };

              const newList = [...list, newEntry];

              // Make ONLY this row editable
              setLastAddedIndex(newList.length - 1);

              setFormData((prev) =>
                prev ? { ...prev, visitDetails: newList } : prev
              );
            }}
            className="px-2 py-2 bg-blue-600 text-white rounded text-sm md:text-base"
          >
            + Add Visit
          </button>
        </div>

        {/* Total Price */}
        <div>
          <input
            type="number"
            readOnly
            value={(formData.visitDetails || []).reduce(
              (total, v) => total + Number(v.visitPrice || 0),
              0
            )}
            className="border py-2 px-2 rounded-sm bg-gray-100 cursor-not-allowed w-full text-center"
          />
        </div>
      </div>
    </div>
  );
};

export default VisitHistory;
