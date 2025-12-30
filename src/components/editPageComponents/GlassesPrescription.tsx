import React from "react";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import { Delete } from "lucide-react";
import { DateInput } from "../ui/DateInput";

type GlassesPrescriptionProps = {
  formData: PatientFullTypeWithObjectId;
  handleNestedChange: (path: string, value: any) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<PatientFullTypeWithObjectId>
  >;
};
const GlassesPrescription: React.FC<GlassesPrescriptionProps> = ({
  formData,
  handleNestedChange,
  setFormData,
}) => {
  return (
    <div className="space-y-3 md:space-y-4 w-full">
      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
      <h3 className="text-lg md:text-xl font-semibold text-gray-700">
        Prescription
      </h3>


      <button
        type="button"
        onClick={() =>
          setFormData((prev) => {
            if (!prev) return prev;
            const newEntry = {
              updateDate: todayDate,
              use: "",
              rightEye: { sph: "", add: "" },
              leftEye: { sph: "", add: "" },
            };
            return {
              ...prev,
              glassesPrescription: [
                newEntry,
                ...(prev.glassesPrescription || []),
              ],
            } as PatientFullTypeWithObjectId;
          })
        }
        className="px-3 py-2 bg-blue-600 text-white rounded text-xs md:text-sm"
      >
        + Add Prescription
      </button>
      </div>

      {formData.glassesPrescription?.map((entry, index) => (
        <div key={index} className="space-y-3 border p-2 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center">
            <h4 className="text-sm md:text-base font-semibold text-gray-700">
              Prescription #
              {(formData.glassesPrescription?.length || 0) - index}
            </h4>
            <div className="flex gap-3 items-center">
              <DateInput
                value={entry.updateDate || ""}
                onChange={(e) =>
                  handleNestedChange(
                    `glassesPrescription.${index}.updateDate`,
                    e.target.value
                  )
                }
                className="border p-1.5 md:p-2 rounded text-xs md:text-sm"
              />

              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    "Are you sure you want to delete this glasses prescription?"
                  );
                  if (!confirmed) return;

                  setFormData((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      glassesPrescription: (
                        prev.glassesPrescription || []
                      ).filter((_, i) => i !== index),
                    } as PatientFullTypeWithObjectId;
                  });
                }}
                className="text-red-500 text-xs underline"
              >
                <Delete className="h-8 w-8" />
              </button>
            </div>
          </div>

          <div className="flex flex-col w-full md:max-w-md">
            <label className="font-medium mb-1 text-sm md:text-base">Use</label>
            <input
              type="text"
              list="useOptions"
              value={entry.use || ""}
              onChange={(e) =>
                handleNestedChange(
                  `glassesPrescription.${index}.use`,
                  e.target.value
                )
              }
              placeholder="Select or enter use"
              className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
            />
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden text-xs md:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 md:px-4 py-1.5 md:py-2 text-left font-medium text-gray-600 w-1/3">
                    Parameter
                  </th>
                  <th className="border px-2 md:px-4 py-1.5 md:py-2 text-center font-medium text-gray-600 w-1/3">
                    Right Eye
                  </th>
                  <th className="border px-2 md:px-4 py-1.5 md:py-2 text-center font-medium text-gray-600 w-1/3">
                    Left Eye
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "SPH", key: "sph" },
                  { label: "CYL", key: "cyl" },
                  { label: "Axis", key: "axis" },
                  { label: "Add", key: "add" },
                  { label: "Prism", key: "prism" },
                  { label: "V/A", key: "V_A" },
                  { label: "N/V", key: "N_V" },
                ].map(({ label, key }) => (
                  <tr key={key} className="odd:bg-white even:bg-gray-50">
                    <td className="border px-2 md:px-4 py-1 md:py-2 font-medium text-gray-700 whitespace-nowrap">
                      {label}
                    </td>
                    <td className="border px-2 md:px-4 py-1 md:py-2">
                      <input
                        type="text"
                        list={`${key}Options`}
                        value={(entry.rightEye as any)?.[key] || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            `glassesPrescription.${index}.rightEye.${key}`,
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
                        list={`${key}Options`}
                        value={(entry.leftEye as any)?.[key] || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            `glassesPrescription.${index}.leftEye.${key}`,
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
      <datalist id="useOptions">
        <option value="Distance" />
        <option value="Near" />
        <option value="Bifocal" />
        <option value="Progressive" />
      </datalist>
      <datalist id="sphOptions">
        {Array.from({ length: 53 }, (_, i) => {
          const numValue = i * 0.25 - 6;
          const display = numValue.toFixed(2);
          return (
            <option
              key={display}
              value={numValue > 0 ? `+${display}` : display}
            />
          );
        })}
      </datalist>

      <datalist id="addOptions">
        {[
          "+0.50",
          "+0.75",
          "+1.00",
          "+1.25",
          "+1.50",
          "+1.75",
          "+2.00",
          "+2.25",
          "+2.50",
          "+2.75",
          "+3.00",
        ].map((val) => (
          <option key={val} value={val} />
        ))}
      </datalist>

      <datalist id="cylOptions">
        {["0.00", "-0.25", "-0.50", "-0.75", "-1.00", "-2.00"].map((val) => (
          <option key={val} value={val} />
        ))}
      </datalist>

      <datalist id="axisOptions">
        {Array.from({ length: 180 }, (_, i) => (
          <option key={i + 1} value={i + 1} />
        ))}
      </datalist>

      <datalist id="prismOptions">
        {["1Δ", "2Δ", "3Δ", "4Δ"].map((val) => (
          <option key={val} value={val} />
        ))}
      </datalist>

      <datalist id="vaOptions">
        {[
          "6/6",
          "6/7.5",
          "6/9",
          "6/12",
          "6/15",
          "6/18",
          "6/24",
          "6/30",
          "6/36",
          "6/45",
          "6/60",
          "5/60",
          "4/60",
          "3/60",
          "2/60",
          "CFC",
          "HM",
          "PL+",
          "PL-",
          "PLPr+",
          "NLP",
          "LP",
        ].map((val) => (
          <option key={val} value={val} />
        ))}
      </datalist>

      <datalist id="nvOptions">
        {[
          "N3",
          "N4",
          "N5",
          "N6",
          "N8",
          "N10",
          "N12",
          "N14",
          "N16",
          "N18",
          "N20",
          "N24",
          "N36",
          "N48",
          "N60",
        ].map((val) => (
          <option key={val} value={val} />
        ))}
      </datalist>
    </div>
  );
};

export default GlassesPrescription;
