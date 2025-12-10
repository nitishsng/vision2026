import React from "react";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import { Delete } from "lucide-react";
import useEligibility from "../elegibleForfeatures";
type IpoPachyCCTProps = {
  formData: PatientFullTypeWithObjectId;
  handleNestedChange: (path: string, value: any) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<PatientFullTypeWithObjectId>
  >;
};
const IpoPachyCCT: React.FC<IpoPachyCCTProps> = ({
  formData,
  handleNestedChange,
  setFormData,
}) => {
  const eligibleForFeatures = useEligibility();
  type VisionEntry = PatientFullTypeWithObjectId["vision"][number];
  type VisionKey = keyof VisionEntry["rightEye"];
  return (
    <div className="space-y-3 md:space-y-4 w-full">
      <h3 className="text-lg md:text-xl font-semibold text-gray-700">
        IOP Pachy CCT
      </h3>

      <button
        onClick={() =>
          setFormData((prev) => {
            if (!prev) return prev;
            const newEntry = {
              updateDate: todayDate,
              rightEye: { methodTime: "", iop: 0, correctedIop: 0, cct: 0 },
              leftEye: { methodTime: "", iop: 0, correctedIop: 0, cct: 0 },
            };
            return {
              ...prev,
              iopPachyCCT: [newEntry, ...(prev.iopPachyCCT || [])],
            } as PatientFullTypeWithObjectId;
          })
        }
        className="px-3 py-1 bg-blue-600 text-white rounded text-xs md:text-sm"
      >
        + Add IOP Entry
      </button>

      {formData.iopPachyCCT?.map((entry, index) => (
        <div key={index} className="space-y-2 md:space-y-3 border p-2 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center">
            <h4 className="text-sm md:text-base font-semibold text-gray-700">
              IOP Entry #{(formData.iopPachyCCT?.length || 0) - index}
            </h4>
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={entry.updateDate || ""}
                onChange={(e) =>
                  handleNestedChange(
                    `iopPachyCCT.${index}.updateDate`,
                    e.target.value
                  )
                }
                className="border p-1.5 md:p-2 rounded text-xs md:text-sm"
              />
              <button
                onClick={() =>
                  setFormData((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      iopPachyCCT: (prev.iopPachyCCT || []).filter(
                        (_, i) => i !== index
                      ),
                    } as PatientFullTypeWithObjectId;
                  })
                }
                className="text-red-500 text-xs underline"
              >
                <Delete className="h-8 w-8" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden text-xs md:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 md:px-4 py-1.5 md:py-2 text-left font-medium text-gray-600 w-1/3">
                    Parameter
                  </th>
                  <th className="border px-2 md:px-4 py-1.5 md:py-2 text-center font-medium text-gray-600 w-1/3">
                    Right
                  </th>
                  <th className="border px-2 md:px-4 py-1.5 md:py-2 text-center font-medium text-gray-600 w-1/3">
                    Left
                  </th>
                </tr>
              </thead>

              <tbody>
                {[
                  { label: "IOP (mmHg)", key: "iop" },
                  { label: "Corrected IOP (mmHg)", key: "correctedIop" },
                  { label: "CCT (µm)", key: "cct" },
                  { label: "Method/Time", key: "methodTime" },
                ].map(({ label, key }) => (
                  <tr key={key} className="odd:bg-white even:bg-gray-50">
                    <td className="border px-2 md:px-4 py-1 md:py-2 font-medium text-gray-700 whitespace-nowrap">
                      {label}
                    </td>
                    <td className="border px-2 md:px-4 py-1 md:py-2">
                      <input
                        type="text"
                        list={
                          key === "cct"
                            ? "cctOptions"
                            : key.includes("iop")
                            ? "iopOptions"
                            : undefined
                        }
                        value={(entry.rightEye as any)?.[key] ?? ""}
                        onChange={(e) =>
                          handleNestedChange(
                            `iopPachyCCT.${index}.rightEye.${key}`,
                            e.target.value
                          )
                        }
                        placeholder="R"
                        className="border p-1 md:p-2 rounded w-full focus:ring-2 focus:ring-blue-400 text-xs md:text-sm"
                      />
                    </td>
                    <td className="border px-2 md:px-4 py-1 md:py-2">
                      <input
                        type="text"
                        list={
                          key === "cct"
                            ? "cctOptions"
                            : key.includes("iop")
                            ? "iopOptions"
                            : undefined
                        }
                        value={(entry.leftEye as any)?.[key] ?? ""}
                        onChange={(e) =>
                          handleNestedChange(
                            `iopPachyCCT.${index}.leftEye.${key}`,
                            e.target.value
                          )
                        }
                        placeholder="L"
                        className="border p-1 md:p-2 rounded w-full focus:ring-2 focus:ring-blue-400 text-xs md:text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Common Datalists */}
      <datalist id="iopOptions">
        {["10", "12", "14", "16", "18", "20", "22", "24", "26", "28"].map(
          (val) => (
            <option key={val} value={val} />
          )
        )}
      </datalist>

      <datalist id="cctOptions">
        {["480", "500", "520", "540", "560", "580", "600", "620"].map((val) => (
          <option key={val} value={val} />
        ))}
      </datalist>
    </div>
  );
};

export default IpoPachyCCT;
