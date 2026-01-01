import React from "react";
import { PatientFullTypeWithObjectId } from "@/src/contexts/type";
import { Delete } from "lucide-react";

type DiagnosisProps = {
  formData: PatientFullTypeWithObjectId;
  handleNestedChange: (path: string, value: any) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<PatientFullTypeWithObjectId>
  >;
};

const Diagnosis: React.FC<DiagnosisProps> = ({ formData, setFormData }) => {
  const todayDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  // Auto-grow textarea
  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const removeDiagnosis = (index: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this diagnosis?"
    );
    if (!confirmed) return;

    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        diagnosis: prev.diagnosis?.filter((_, i) => i !== index),
      };
    });
  };

  return (
    <div className="space-y-4 w-full">
      <h3 className="text-lg md:text-xl font-semibold text-gray-700">
        Diagnosis
      </h3>

      {/* Diagnosis List */}
      <div className="space-y-3">
        {(formData.diagnosis || []).map((diagnosisItem, index) => {
          // Backward compatibility
          const date =
            typeof diagnosisItem === "string" ? todayDate : diagnosisItem.date;

          const value =
            typeof diagnosisItem === "string"
              ? diagnosisItem
              : diagnosisItem.value;

          return (
            <div
              key={index}
              className="flex items-start md:items-center gap-2 md:gap-3 w-full"
            >
              {/* Date */}
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  const newDiagnosis = [...(formData.diagnosis || [])];
                  const currentItem = newDiagnosis[index];
                  const currentVal =
                    typeof currentItem === "string"
                      ? currentItem
                      : currentItem.value;

                  newDiagnosis[index] = {
                    date: e.target.value,
                    value: currentVal,
                  };

                  setFormData((prev) =>
                    prev ? { ...prev, diagnosis: newDiagnosis } : prev
                  );
                }}
                className="border rounded px-.5 md:px-2 py-2 text-sm md:text-base
             focus:ring-2 focus:ring-blue-400
             w-[115px] md:w-[125px]  shrink-0"
              />

              {/* Diagnosis (auto-growing textarea) */}
              <textarea
                rows={1}
                value={value}
                placeholder={`Diagnosis ${index + 1}`}
                onInput={(e) => autoResize(e.currentTarget)}
                onChange={(e) => {
                  autoResize(e.currentTarget);

                  const newDiagnosis = [...(formData.diagnosis || [])];
                  const currentItem = newDiagnosis[index];
                  const currentDate =
                    typeof currentItem === "string"
                      ? todayDate
                      : currentItem.date;

                  newDiagnosis[index] = {
                    date: currentDate,
                    value: e.target.value,
                  };

                  setFormData((prev) =>
                    prev ? { ...prev, diagnosis: newDiagnosis } : prev
                  );
                }}
                className="border rounded p-2 md:p-3 w-full text-sm md:text-base
                           focus:ring-2 focus:ring-blue-400
                           resize-none overflow-hidden leading-relaxed"
              />

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeDiagnosis(index)}
                className="bg-red-500 text-white p-2 md:p-2.5 rounded-lg
                           hover:bg-red-600 transition flex items-center justify-center"
                title="Remove Diagnosis"
              >
                <Delete className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Diagnosis */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            setFormData((prev) =>
              prev
                ? {
                    ...prev,
                    diagnosis: [
                      ...(prev.diagnosis || []),
                      { date: todayDate, value: "" },
                    ],
                  }
                : prev
            )
          }
          className="bg-green-500 text-white px-4 py-2 rounded-lg
                     hover:bg-green-600 focus:outline-none
                     focus:ring-2 focus:ring-green-400
                     text-sm md:text-base"
        >
          + Add Diagnosis
        </button>
      </div>
    </div>
  );
};

export default Diagnosis;
