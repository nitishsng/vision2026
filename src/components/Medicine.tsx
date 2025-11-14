import React from "react";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import { Delete } from "lucide-react";

type MedicineProps = {
  formData: PatientFullTypeWithObjectId;
  setFormData: React.Dispatch<React.SetStateAction<PatientFullTypeWithObjectId>>;
};

const Medicine: React.FC<MedicineProps> = ({ formData, setFormData }) => {
  // 🔹 Medicine name-to-price list
  const medicineList: Record<string, number> = {
    "moximax": 148,
    "yesflox p": 100,
    "heltroz": 150,
    "locfresh gel": 155,
    "cycloact": 70,
    "selfquin lp": 170,
    "ratroday": 210,
    "ciplox": 18,
    "ocurest ah": 117,
    "realtob oint": 90,
    "hycotic": 85,
    "yesflu tab": 54,
    "nepadot": 185,
    "realtob f": 125,
    "tobra": 60,
    "myneph+": 130,
    "selfquin p": 125,
    "ceflox": 58,
    "yesflox": 80,
    "yapat": 105,
    "yapat kt": 140,
    "ralcafit": 240,
  };

  // 🔹 Add medicine
  const addMedicineField = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { date: todayDate, medicinename: "", price: 0 },
      ],
    }));
  };

  // 🔹 Remove medicine + recalc total
  const removeMedicineField = (index: number) => {
    setFormData((prev) => {
      const updatedMedicines = prev.medicines.filter((_, i) => i !== index);
      const totalPrice = updatedMedicines.reduce(
        (sum, med) => sum + (Number(med.price) || 0),
        0
      );
      return { ...prev, medicines: updatedMedicines, medicinePrice: totalPrice };
    });
  };

  // 🔹 Change date
  const handleAdvanceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    const newMedicines = [...formData.medicines];
    if (name === "date" || name === "medicinename") {
      (newMedicines[index] as any)[name] = value;
    }
    setFormData((prev) => ({ ...prev, medicines: newMedicines }));
  };

  // 🔹 Change price + recalc total
  const handleMedicineChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    const newMedicines = [...formData.medicines];
    newMedicines[index].price = Number(value);

    const totalPrice = newMedicines.reduce(
      (sum, med) => sum + (Number(med.price) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      medicines: newMedicines,
      medicinePrice: totalPrice,
    }));
  };

  // 🔹 Select or type medicine name
  const handleMedicineSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    const [namePart] = value.split("-");
    const cleanName = namePart.trim().toLowerCase();

    const newMedicines = [...formData.medicines];
    newMedicines[index].medicinename = value;

    if (cleanName in medicineList) {
      newMedicines[index].price = medicineList[cleanName];
    }

    const totalPrice = newMedicines.reduce(
      (sum, med) => sum + (Number(med.price) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      medicines: newMedicines,
      medicinePrice: totalPrice,
    }));
  };

  return (
    <div className="flex bg-gray-50 flex-col w-full">
      {/* Header */}
      <div className="grid grid-cols-3 w-full">
        <label className="font-medium px-3 text-gray-700">Date</label>
        <label className="font-medium px-3 text-gray-700">Medicine Name</label>
        <label className="font-medium px-3 text-gray-700">Price</label>
      </div>

      {/* Medicine Rows */}
      {formData.medicines.map((med, index) => (
        <div
          key={index}
          className="grid grid-cols-3 gap-1 items-end bg-gray-50 p-1 md:p-2"
        >
          {/* Date */}
          <div className="flex flex-col">
            <input
              type="date"
              name="date"
              value={med.date}
              onChange={(e) => handleAdvanceChange(e, index)}
              className="border py-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
            />
          </div>

          {/* Medicine Name */}
          <div className="flex flex-col">
            <input
              list="medicine-options"
              type="text"
              name="medicinename"
              value={med.medicinename}
              onChange={(e) => handleMedicineSelect(e, index)}
              placeholder="Enter or select Medicine Name"
              className="border py-1 px-3 md:py-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          {/* Price + Delete */}
          <div className="flex flex-col">
            <div className="flex">
              <input
                type="number"
                name="price"
                value={med.price}
                onChange={(e) => handleMedicineChange(e, index)}
                placeholder="Enter Price"
                className="border py-1 px-3 md:py-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
              <div className="flex justify-end items-center ml-2">
                <button
                  type="button"
                  onClick={() => removeMedicineField(index)}
                  className="bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Datalist */}
      <datalist id="medicine-options">
        {Object.keys(medicineList).map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {/* Add + Total */}
      <div className="grid grid-cols-2 justify-between px-3 mt-2 w-full">
        <button
          type="button"
          onClick={addMedicineField}
          className="bg-blue-500 text-white rounded-lg px-2 md:px-3 py-2 w-fit hover:bg-blue-600 transition"
        >
          + Add Medicine
        </button>
        <div className="flex justify-end">
          <input
            type="number"
            value={formData.medicinePrice}
            readOnly
            className="border py-1 md:p-3 min-w-[100px] rounded-lg bg-gray-100 text-gray-700 text-center"
          />
        </div>
      </div>
    </div>
  );
};

export default Medicine;
