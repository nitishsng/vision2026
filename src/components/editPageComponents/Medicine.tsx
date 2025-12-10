import React from "react";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import { Trash } from "lucide-react";
import useEligibility from "../elegibleForfeatures";

type MedicineProps = {
  formData: PatientFullTypeWithObjectId;
  setFormData: React.Dispatch<React.SetStateAction<PatientFullTypeWithObjectId>>;
};

const Medicine: React.FC<MedicineProps> = ({ formData, setFormData }) => {
  const eligibleForFeatures = useEligibility();

  // Track which medicine row is editable (only newly added for non-premium)
  const [editableIndex, setEditableIndex] = React.useState<number | null>(null);

  // Medicine master list
  const medicineList: Record<string, number> = {
    moximax: 148,
    "yesflox p": 100,
    heltroz: 150,
    "locfresh gel": 155,
    cycloact: 70,
    "selfquin lp": 170,
    ratroday: 210,
    ciplox: 18,
    "ocurest ah": 117,
    "realtob oint": 90,
    hycotic: 85,
    "yesflu tab": 54,
    nepadot: 185,
    "realtob f": 125,
    tobra: 60,
    "myneph+": 130,
    "selfquin p": 125,
    ceflox: 58,
    yesflox: 80,
    yapat: 105,
    "yapat kt": 140,
    ralcafit: 240,
  };

  // Add new row (only newly added row editable)
  const addMedicineField = () => {
    const newEntry = { date: todayDate, medicinename: "", price: 0 };

    setFormData((prev) => {
      const updated = [...prev.medicines, newEntry];
      return { ...prev, medicines: updated };
    });

    if (!eligibleForFeatures(4)) {
      // Newly added row is editable
      setEditableIndex(formData.medicines.length);
    }
  };

  // Remove row
  const removeMedicineField = (index: number) => {
    setFormData((prev) => {
      const updated = prev.medicines.filter((_, i) => i !== index);
      return { ...prev, medicines: updated };
    });

    if (editableIndex === index) {
      setEditableIndex(null);
    } else if (editableIndex && index < editableIndex) {
      setEditableIndex((old) => (old !== null ? old - 1 : null));
    }
  };

  // Update fields only in editable row (or all if premium)
  const updateField = (
    index: number,
    field: "date" | "medicinename" | "price",
    value: any
  ) => {
    if (!eligibleForFeatures(4) && editableIndex !== index) return;

    const newMedicines = [...formData.medicines];
    (newMedicines[index] as any)[field] = value;

    // Auto-set price if medicine matches
    if (field === "medicinename") {
      const cleanName = value.split("-")[0].trim().toLowerCase();
      if (medicineList[cleanName]) {
        newMedicines[index].price = medicineList[cleanName];
      }
    }

    setFormData((prev) => ({ ...prev, medicines: newMedicines }));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Header */}
      <div className="grid grid-cols-3 w-full">
        <label className="font-medium px-3 text-gray-700">Date</label>
        <label className="font-medium px-3 text-gray-700">M-Name</label>
        <label className="font-medium px-3 text-gray-700">Price</label>
      </div>

      {/* Medicine Rows */}
      {formData.medicines.map((med, index) => {
        const isEditable = eligibleForFeatures(4) || index === editableIndex;

        return (
          <div key={index} className="grid grid-cols-3 gap-1 items-end">
            {/* Date */}
            <input
              type="date"
              value={med.date}
              readOnly={!isEditable}
              onChange={(e) => updateField(index, "date", e.target.value)}
              className={`border py-2 px-2 rounded-lg ${
                !isEditable ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />

            {/* Medicine Name */}
            <input
              type="text"
              list="medicine-options"
              value={med.medicinename}
              readOnly={!isEditable}
              onChange={(e) =>
                updateField(index, "medicinename", e.target.value)
              }
              placeholder="Medicine Name"
              className={`border py-2 px-2 rounded-lg ${
                !isEditable ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />

            {/* Price + Delete */}
            <div className="flex">
              <input
                type="number"
                value={med.price}
                readOnly={!isEditable}
                onChange={(e) =>
                  updateField(index, "price", Number(e.target.value))
                }
                className={`border py-2 px-2 rounded-lg w-full ${
                  !isEditable ? "bg-gray-200 cursor-not-allowed" : ""
                }`}
              />

              {eligibleForFeatures(4) && (
                <button
                  type="button"
                  onClick={() => removeMedicineField(index)}
                  className="bg-red-500 text-white rounded-lg px-2 ml-2"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Datalist */}
      <datalist id="medicine-options">
        {Object.keys(medicineList).map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {/* Add + Total */}
      <div className="grid grid-cols-2 px-3 gap-3">
        <button
          type="button"
          onClick={addMedicineField}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          + Add Medicine
        </button>

        <input
          type="number"
          readOnly
          value={formData.medicines.reduce(
            (sum, m) => sum + (Number(m.price) || 0),
            0
          )}
          className="border py-2 rounded-lg bg-gray-100 text-center"
        />
      </div>
    </div>
  );
};

export default Medicine;
