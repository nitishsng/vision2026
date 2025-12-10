import React from "react";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import { Delete } from "lucide-react";
type VisionProps = {
  formData: PatientFullTypeWithObjectId;
  handleNestedChange: (path: string, value: any) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<PatientFullTypeWithObjectId>
  >;
};
const VisionEntry: React.FC<VisionProps> = ({
  formData,
  handleNestedChange,
  setFormData,
}) => {
  type VisionEntry = PatientFullTypeWithObjectId["vision"][number];
  type VisionKey = keyof VisionEntry["rightEye"];
  return (
    <div className="space-y-3 md:space-y-4 w-full">
      <h3 className="text-base md:text-lg font-semibold text-gray-700">
        Vision Details
      </h3>

      {/* Add new vision entry */}
      <button
        onClick={() =>
          setFormData((prev) => {
            if (!prev) return prev;
            const newEntry = {
              updateDate: todayDate,
              rightEye: { unaidedDistance: "" },
              leftEye: { unaidedDistance: "" },
            };
            return {
              ...prev,
              vision: [newEntry, ...(prev.vision || [])],
            } as PatientFullTypeWithObjectId;
          })
        }
        className="px-3 py-1 bg-blue-600 text-white rounded text-xs md:text-sm"
      >
        + Add Vision Entry
      </button>

      {/* Loop through all vision entries */}
      {formData.vision?.map((entry, index) => (
        <div key={index} className="space-y-2 border p-2 rounded-lg bg-gray-50">
          {/* Entry Heading */}
          <div className="flex justify-between items-center">
            <h4 className="text-sm md:text-base font-semibold text-gray-700">
              Vision Entry #{(formData.vision?.length || 0) - index}
            </h4>
            {/* Date */}
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={entry.updateDate || ""}
                onChange={(e) =>
                  handleNestedChange(
                    `vision.${index}.updateDate`,
                    e.target.value
                  )
                }
                className="border p-1.5 md:p-2 rounded text-xs md:text-sm"
              />
           
              {/* Delete entry */}
              <button
                onClick={() => {
                  const confirmed = window.confirm(
                    "Are you sure you want to delete this vision entry?"
                  );
                  if (!confirmed) return;

                  setFormData((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      vision: (prev.vision || []).filter((_, i) => i !== index),
                    };
                  });
                }}
                className="text-red-500 text-xs underline"
              >
                <Delete className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg text-xs md:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-600 w-1/3">
                    Parameter
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-600 w-1/3">
                    Right
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-600 w-1/3">
                    Left
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {(
                  [
                    {
                      label: "Unaided Distance",
                      key: "unaidedDistance" as VisionKey,
                      options: [
                        "6/6",
                        "6/9",
                        "6/12",
                        "6/18",
                        "6/24",
                        "6/36",
                        "6/60",
                      ],
                    },
                    {
                      label: "Unaided Near",
                      key: "unaidedNear" as VisionKey,
                      options: ["N5", "N6", "N8", "N10", "N12"],
                    },
                    {
                      label: "Best Corrected Distance",
                      key: "bestCorrectedDistance" as VisionKey,
                      options: ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36"],
                    },
                    {
                      label: "Best Corrected Near",
                      key: "bestCorrectedNear" as VisionKey,
                      options: ["N5", "N6", "N8", "N10", "N12"],
                    },
                  ] as {
                    label: string;
                    key: VisionKey;
                    options: string[];
                  }[]
                ).map(({ label, key, options }) => (
                  <tr key={key}>
                    <td className="px-2 md:px-4 py-2 font-medium text-gray-700 whitespace-nowrap">
                      {label}
                    </td>

                    {/* Right eye */}
                    <td className="px-2 md:px-4 py-1">
                      <input
                        type="text"
                        list={`${key}Options-${index}`}
                        value={(entry.rightEye[key] ?? "") as string}
                        onChange={(e) =>
                          handleNestedChange(
                            `vision.${index}.rightEye.${key}`,
                            e.target.value
                          )
                        }
                        className="border p-1 md:p-2 rounded w-full"
                      />
                    </td>

                    {/* Left eye */}
                    <td className="px-2 md:px-4 py-1">
                      <input
                        type="text"
                        list={`${key}Options-${index}`}
                        value={(entry.leftEye[key] ?? "") as string}
                        onChange={(e) =>
                          handleNestedChange(
                            `vision.${index}.leftEye.${key}`,
                            e.target.value
                          )
                        }
                        className="border p-1 md:p-2 rounded w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(
            [
              {
                label: "Unaided Distance",
                key: "unaidedDistance" as VisionKey,
                options: ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36", "6/60"],
              },
              {
                label: "Unaided Near",
                key: "unaidedNear" as VisionKey,
                options: ["N5", "N6", "N8", "N10", "N12"],
              },
              {
                label: "Best Corrected Distance",
                key: "bestCorrectedDistance" as VisionKey,
                options: ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36"],
              },
              {
                label: "Best Corrected Near",
                key: "bestCorrectedNear" as VisionKey,
                options: ["N5", "N6", "N8", "N10", "N12"],
              },
            ] as { label: string; key: VisionKey; options: string[] }[]
          ).map(({ key, options }) => (
            <datalist key={key} id={`${key}Options-${index}`}>
              {options.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
          ))}
        </div>
      ))}
    </div>
  );
};

export default VisionEntry;
