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
const Diagnosis : React.FC<DiagnosisProps> = ({ formData, setFormData }) => {

const removeDiagnosis = (index: number) => {
  const confirmed = window.confirm("Are you sure you want to delete this diagnosis?");
  if (!confirmed) return; 
  setFormData((prev) => {
    if (!prev) return prev; 
    const updatedDiagnosis = prev.diagnosis?.filter((_, i) => i !== index);
    return {
      ...prev,
      diagnosis: updatedDiagnosis,
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
            {(formData.diagnosis || []).map((diagnosisItem, index) => (
              <div
                key={index}
                className="flex items-center gap-2 md:gap-3 w-full"
              >
                <input
                  type="text"
                  value={diagnosisItem || ""}
                  onChange={(e) => {
                    const newDiagnosis = [...(formData.diagnosis || [])];
                    newDiagnosis[index] = e.target.value;
                    setFormData((prev) =>
                      prev ? { ...prev, diagnosis: newDiagnosis } : prev
                    );
                  }}
                  placeholder={`Diagnosis ${index + 1}`}
                  className="border rounded p-2 md:p-3 w-full text-sm md:text-base focus:ring-2 focus:ring-blue-400"
                />

                <button
                  type="button"
                  onClick={() => removeDiagnosis(index)}
                  className="bg-red-500 text-white p-2 md:p-2.5 rounded-lg hover:bg-red-600 transition flex items-center justify-center"
                  title="Remove Diagnosis"
                >
                  <Delete className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) =>
                  prev
                    ? { ...prev, diagnosis: [...(prev.diagnosis || []), ""] }
                    : prev
                )
              }
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm md:text-base"
            >
              + Add Diagnosis
            </button>
          </div>
        </div>
  )
}

export default Diagnosis