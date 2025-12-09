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
  return (
    <div className="flex flex-col md:w-[350px] w-full">
      <label className="font-medium text-gray-700 mb-1">Visit History</label>

      {(formData.visitDetails || []).map((v, index) => (
        <div
          key={index}
          className="grid grid-cols-2 gap-2 items-center w-full p-2 rounded"
        >
          {/* LEFT column */}
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
              className="border px-2 py-1 md:py-2 rounded text-sm w-full"
            />
          </div>

          {/* RIGHT column */}
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
              className="border px-2 py-1 md:py-3 rounded text-sm w-full"
            />

            {eligibleForFeatures(4) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setFormData((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        visitDetails: (prev.visitDetails || []).filter(
                          (_, i) => i !== index
                        ),
                      };
                    })
                  }
                  className="text-red-500"
                >
                  <Delete className="w-8 h-8" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex flex-col-2 justify-evenly">
        <div>
          <button
            onClick={() =>
              setFormData((prev) => {
                if (!prev) return prev;
                const newEntry = {
                  visitDate: todayDate,
                  visitPrice: 0,
                };
                return {
                  ...prev,
                  visitDetails: [...(prev.visitDetails || []), newEntry],
                } as PatientFullTypeWithObjectId;
              })
            }
            className=" px-10 py-2 bg-blue-600 text-white rounded text-sm md:text-base"
          >
            + Add Visit
          </button>
        </div>
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
