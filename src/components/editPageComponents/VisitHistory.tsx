import React from "react";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
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
      
      {
        formData.visitDetails?.length &&(
          <label className="font-medium text-gray-700 mb-1">Visit History</label>
        )
      }

      {(formData.visitDetails || []).map((v, index) => {
        const editable = isEditable(index);

        return (
          <div
            key={index}
            className="grid grid-cols-2 gap-2 items-center w-full p-2 rounded"
          >
            {/* Visit Date */}
            <div>
              <input
                type="date"
                value={v.visitDate || ""}
                onChange={(e) =>
                  handleNestedChange(
                    `visitDetails.${index}.visitDate`,
                    e.target.value
                  )
                }
                disabled={!editable}
                className={`border px-2 py-1 md:py-2 rounded text-sm w-full ${
                  !editable && "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Visit Price */}
            <div className="flex gap-2 items-center">
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
                className={`border px-2 py-1 md:py-2 rounded text-sm w-full ${
                  !editable && "bg-gray-100 cursor-not-allowed"
                }`}
              />

              {eligibleForFeatures(4) && (
                <button
                  onClick={() => removeVisitObject(index)}
                  className="text-red-500"
                >
                  <Delete className="w-8 h-8" />
                </button>
              )}
            </div>
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
              };

              const newList = [...list, newEntry];

              // Make ONLY this row editable
              setLastAddedIndex(newList.length - 1);

              setFormData((prev) =>
                prev ? { ...prev, visitDetails: newList } : prev
              );
            }}
            className="px-10 py-2 bg-blue-600 text-white rounded text-sm md:text-base"
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
            className="border py-1 px-2 md:py-2 rounded-lg bg-gray-100 cursor-not-allowed max-w-[150px]"
          />
        </div>
      </div>
    </div>
  );
};

export default VisitHistory;
