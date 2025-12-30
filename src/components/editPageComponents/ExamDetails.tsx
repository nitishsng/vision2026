import React from "react";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import { Delete } from "lucide-react";
import { DateInput } from "../ui/DateInput";

type ExamDetailsProps = {
  formData: PatientFullTypeWithObjectId;
  handleNestedChange: (path: string, value: any) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<PatientFullTypeWithObjectId>
  >;
};
const ExamDetails: React.FC<ExamDetailsProps> = ({
  formData,
  handleNestedChange,
  setFormData,
}) => {
  type VisionEntry = PatientFullTypeWithObjectId["vision"][number];
  return (
    <div className="space-y-3 md:space-y-4 w-full">
      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">

      <h3 className="text-base md:text-lg font-semibold text-gray-700">
        Exam Details
      </h3>

      <button
        onClick={() =>
          setFormData((prev) => {
            if (!prev) return prev;
            const newEntry = {
              updateDate: todayDate,
              adnexa: { right: "", left: "" },
              conjunctiva: { right: "", left: "" },
              cornea: { right: "", left: "" },
              anteriorChamber: { right: "", left: "" },
              iris: { right: "", left: "" },
              lens: { right: "", left: "" },
              fundus: { right: "", left: "" },
              orbit: { right: "", left: "" },
              syringing: { right: "", left: "" },
              vitreous: { right: "", left: "" },
            };
            return {
              ...prev,
              examDetails: [newEntry, ...(prev.examDetails || [])],
            } as PatientFullTypeWithObjectId;
          })
        }
        className="px-3 py-1 bg-blue-600 text-white rounded text-xs md:text-sm"
      >
        + Add Exam Entry
      </button>
      </div>

      {formData.examDetails?.map((entry, index) => (
        <div key={index} className="space-y-3 border p-2 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center">
            <h4 className="text-sm md:text-base font-semibold text-gray-700">
              Exam Entry #{(formData.examDetails?.length || 0) - index}
            </h4>
            <div className="flex gap-3 items-center">
              <DateInput
                value={entry.updateDate || ""}
                onChange={(e) =>
                  handleNestedChange(
                    `examDetails.${index}.updateDate`,
                    e.target.value
                  )
                }
                className="border p-1.5 md:p-2 rounded text-xs md:text-sm"
              />

              <button
                onClick={() => {
                  const confirmDelete = window.confirm(
                    "Are you sure you want to delete this exam detail?"
                  );
                  if (!confirmDelete) return;

                  setFormData((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      examDetails: (prev.examDetails || []).filter(
                        (_, i) => i !== index
                      ),
                    } as PatientFullTypeWithObjectId;
                  });
                }}
                className="text-red-500 text-xs underline flex items-center"
              >
                <Delete className="h-8 w-8" />
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="inline-block w-full align-middle">
              <table className="w-full border border-gray-300 rounded-lg overflow-hidden text-xs md:text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 md:px-4 py-1.5 md:py-2 text-left font-medium text-gray-600 w-1/3 md:w-[40%]">
                      Parameter
                    </th>
                    <th className="px-2 md:px-4 py-1.5 md:py-2 text-left font-medium text-gray-600 w-1/3 md:w-[30%]">
                      Right
                    </th>
                    <th className="px-2 md:px-4 py-1.5 md:py-2 text-left font-medium text-gray-600 w-1/3 md:w-[30%]">
                      Left
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    {
                      label: "Adnexa",
                      name: "adnexa",
                      options: ["Normal", "Swelling", "Redness"],
                    },
                    {
                      label: "Conjunctiva",
                      name: "conjunctiva",
                      options: ["Normal", "Pale", "Injected"],
                    },
                    {
                      label: "Cornea",
                      name: "cornea",
                      options: ["Clear", "Opacity", "Edema"],
                    },
                    {
                      label: "Anterior Chamber",
                      name: "anteriorChamber",
                      options: ["Normal", "Shallow", "Deep"],
                    },
                    {
                      label: "Iris",
                      name: "iris",
                      options: ["Normal", "Atrophy"],
                    },
                    {
                      label: "Lens",
                      name: "lens",
                      options: ["Clear", "Cataract", "Pseudophakia"],
                    },
                    {
                      label: "Fundus",
                      name: "fundus",
                      options: ["Normal", "DR", "HR", "AMD"],
                    },
                    {
                      label: "Orbit",
                      name: "orbit",
                      options: ["Normal", "Mass", "Inflammation"],
                    },
                    {
                      label: "Syringing",
                      name: "syringing",
                      options: ["Patent", "Blocked"],
                    },
                    {
                      label: "Vitreous",
                      name: "vitreous",
                      options: ["Clear", "Floaters"],
                    },
                  ].map(({ label, name, options }) => (
                    <tr key={name}>
                      <td className="px-2 md:px-4 py-1 md:py-2 font-medium text-gray-700 whitespace-nowrap">
                        {label}
                      </td>
                      <td className="px-2 md:px-4 py-1 md:py-2">
                        <input
                          type="text"
                          list={`${name}Options`}
                          value={(entry as any)?.[name]?.right || ""}
                          onChange={(e) =>
                            handleNestedChange(
                              `examDetails.${index}.${name}.right`,
                              e.target.value
                            )
                          }
                          placeholder="R"
                          className="border p-1 md:p-2 rounded w-full focus:ring-1 focus:ring-blue-400 text-xs md:text-sm"
                        />
                      </td>
                      <td className="px-2 md:px-4 py-1 md:py-2">
                        <input
                          type="text"
                          list={`${name}Options`}
                          value={(entry as any)?.[name]?.left || ""}
                          onChange={(e) =>
                            handleNestedChange(
                              `examDetails.${index}.${name}.left`,
                              e.target.value
                            )
                          }
                          placeholder="L"
                          className="border p-1 md:p-2 rounded w-full focus:ring-1 focus:ring-blue-400 text-xs md:text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {[
        {
          label: "Adnexa",
          name: "adnexa",
          options: ["Normal", "Swelling", "Redness"],
        },
        {
          label: "Conjunctiva",
          name: "conjunctiva",
          options: ["Normal", "Pale", "Injected"],
        },
        {
          label: "Cornea",
          name: "cornea",
          options: ["Clear", "Opacity", "Edema"],
        },
        {
          label: "Anterior Chamber",
          name: "anteriorChamber",
          options: ["Normal", "Shallow", "Deep"],
        },
        {
          label: "Iris",
          name: "iris",
          options: ["Normal", "Atrophy"],
        },
        {
          label: "Lens",
          name: "lens",
          options: ["Clear", "Cataract", "Pseudophakia"],
        },
        {
          label: "Fundus",
          name: "fundus",
          options: ["Normal", "DR", "HR", "AMD"],
        },
        {
          label: "Orbit",
          name: "orbit",
          options: ["Normal", "Mass", "Inflammation"],
        },
        {
          label: "Syringing",
          name: "syringing",
          options: ["Patent", "Blocked"],
        },
        {
          label: "Vitreous",
          name: "vitreous",
          options: ["Clear", "Floaters"],
        },
      ].map(({ name, options }) => (
        <datalist key={name} id={`${name}Options`}>
          {options.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      ))}
    </div>
  );
};

export default ExamDetails;
