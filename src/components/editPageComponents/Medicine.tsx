
import React from "react";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import { Delete } from "lucide-react";
import { DateInput } from "../ui/DateInput";

import useEligibility from "../elegibleForfeatures";

type MedicineProps = {
  formData: PatientFullTypeWithObjectId;
  setFormData: React.Dispatch<
    React.SetStateAction<PatientFullTypeWithObjectId>
  >;
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
    const newEntry = { date: todayDate, medicinename: "", price: 0, mode: "offline" as "online" | "offline" };

    setFormData((prev) => {
      const updated = [...prev.medicines, newEntry];
      return { ...prev, medicines: updated };
    });

    if (!eligibleForFeatures(4)) {
      // Newly added row is editable
      setEditableIndex(formData.medicines.length);
    }
  };

 // Remove medicine row with confirmation
const removeMedicineField = (index: number) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this medicine entry?"
  );
  if (!confirmed) return;

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
    field: "date" | "medicinename" | "price" | "mode",
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
  <h3 className="font-semibold">Medicine</h3>
  {formData.medicines.length > 0 && (
    <div className="grid grid-cols-[70px_1fr_60px_85px] lg:grid-cols-[70px_1fr_140px_130px] w-full text-[15px] font-medium text-gray-700 px-1">
      <label>Date</label>
      <label>M-Name</label>
      <label>Mode</label>
      <label>Price</label>
    </div>
  )}

  {/* Medicine Rows */}
  {formData.medicines.map((med, index) => {
    const isEditable = eligibleForFeatures(4) || index === editableIndex;

    return (
      <div
        key={index}
        className="grid grid-cols-[70px_1fr_60px_85px] lg:grid-cols-[70px_1fr_140px_140px] gap-1 items-center w-full"
      >
        {/* Date */}
        <DateInput
          value={med.date}
          onChange={(e) => updateField(index, "date", e.target.value)}
          readOnly={!isEditable}
          className={`border px-[2px] py-2 text-[15px] w-full min-w-0 rounded-sm ${
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
          placeholder="Med"
          className={`border px-[2px] py-2 text-[15px] w-full min-w-0 rounded-sm ${
            !isEditable ? "bg-gray-200 cursor-not-allowed" : ""
          }`}
        />

        {/* Mode */}
        <select
          value={med.mode || "offline"}
          disabled={!isEditable}
          onChange={(e) => updateField(index, "mode", e.target.value)}
          className={`border px-[2px] py-2 text-[15px] w-full min-w-0 rounded-sm ${
            !isEditable ? "bg-gray-200 cursor-not-allowed" : ""
          }`}
        >
          <option value="offline">Off</option>
          <option value="online">On</option>
        </select>

        {/* Price + Delete */}
        <div className="flex items-center gap-1 min-w-0">
          <input
            type="number"
            value={med.price}
            readOnly={!isEditable}
            onChange={(e) =>
              updateField(index, "price", Number(e.target.value))
            }
            placeholder="₹"
            className={`border px-[2px] py-2 text-[15px] w-full min-w-0 rounded-sm ${
              !isEditable ? "bg-gray-200 cursor-not-allowed" : ""
            }`}
          />

          {eligibleForFeatures(4) && (
            <button
              type="button"
              onClick={() => removeMedicineField(index)}
              className="bg-red-500 text-white px-1 py-1 rounded-sm"
            >
              <Delete className="w-5 h-6" />
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
  <div className="grid grid-cols-2 gap-2 mt-2 px-1">
    <button
      type="button"
      onClick={addMedicineField}
      className="bg-blue-500 text-white rounded-sm px-2 py-2 text-sm hover:bg-blue-600 transition h-full"
    >
      + Medicine
    </button>

    <input
      type="number"
      readOnly
      value={formData.medicines.reduce(
        (sum, m) => sum + (Number(m.price) || 0),
        0
      )}
      className="border py-2 px-1 rounded-sm bg-gray-100 text-center text-sm w-full"
    />
  </div>
</div>
  );
};

export default Medicine;
