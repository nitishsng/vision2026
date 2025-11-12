"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDashboardData } from "@/src/contexts/dataCollection";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Delete } from "lucide-react";
const EditPage = () => {
  const navigate = useRouter();
  const { patients, fetchData } = useDashboardData();
  const params = useParams();
  const id = params?.id as string;

  const existingPatient = patients.find((p) => p._id === id);

  const [formData, setFormData] = useState<PatientFullTypeWithObjectId | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const [basicDetails, setbasicDetails] = useState(false);
  const [showVisionDetails, setShowVisionDetails] = useState(false);
  const [showExamDetails, setShowExamDetails] = useState(false);
  const [showGlassesPrescription, setShowGlassesPrescription] = useState(false);
  const [showIopPachyCCT, setShowIopPachyCCT] = useState(false);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [someDetails, setSomeDetails] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint in Tailwind
    };

    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (existingPatient) {
      setFormData(existingPatient as any); // cast safely
    }
  }, [existingPatient]);

  if (!formData) {
    return <p className="p-4 text-gray-600">Loading patient data...</p>;
  }

  // Generic handler for top-level fields
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              type === "number" ? (value === "" ? "" : Number(value)) : value,
            // Auto-update due if advance changes
            ...(name === "advance"
              ? { due: prev.totalAmount - (value === "" ? 0 : Number(value)) }
              : {}),
          }
        : prev
    );
  };

  // Generic nested change handler
  const handleNestedChange = (path: string, value: any) => {
    setFormData((prev) => {
      if (!prev) return prev;

      const newData = { ...prev };
      const keys = path.split(".");

      let temp: any = newData;
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          temp[key] = value;
        } else {
          temp[key] = { ...temp[key] };
          temp = temp[key];
        }
      });

      return newData;
    });
  };

  // Save handler
  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedFormData = {
        ...formData,
        updatedAt: new Date().toISOString(),

        totalAmount:
          (formData.visitPrice ?? 0) +
          (formData.medicinePrice ?? 0) +
          (formData.framePrice ?? 0) +
          (formData.lensePrice ?? 0),

        totalAdvance:
          (formData.visitPrice ?? 0) +
          (formData.medicinePrice ?? 0) +
          (formData.opticalAdvance ?? 0),

        totalDue:
          (formData.framePrice ?? 0) +
          (formData.lensePrice ?? 0) -
          (formData.opticalAdvance ?? 0),

        opticalaPrice: (formData.framePrice ?? 0) + (formData.lensePrice ?? 0),
        opticalDue:
          (formData?.framePrice ?? 0) +
          (formData?.lensePrice ?? 0) -
          (formData?.opticalAdvance ?? 0),
      };

      if (!id) throw new Error("Missing patient ID");

      const res = await fetch(`/api/patient?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, ...updatedFormData }),
      });

      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      localStorage.setItem("activeTab", "patients");
      toast.success("Saved successfully!");
      fetchData();
      setFormData(updatedFormData);
      navigate.back();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };
  type ToggleInfo = {
    isOpen: boolean;
    onToggle: () => void;
    closedLabel: string;
    buttonLabels: { open: string; closed: string };
  };

  const renderToggleSection = (info: ToggleInfo, isLargeScreen: boolean) => {
    const { isOpen, onToggle, closedLabel, buttonLabels } = info;

    const handleToggle = () => {
      // Reset all sections
      setbasicDetails(false);
      setShowVisionDetails(false);
      setShowExamDetails(false);
      setShowGlassesPrescription(false);
      setShowIopPachyCCT(false);
      setShowDiagnosis(false);
      setSomeDetails(false);
      // Then toggle the current section
      onToggle();
    };

    return (
      <div
        className={
          isLargeScreen
            ? "hidden"
            : isOpen
            ? "flex justify-end items-center py-1 px-2"
            : "flex justify-between items-center py-1 px-2"
        }
      >
        {!isOpen && <span className="text-gray-600">{closedLabel}</span>}
        <button
          onClick={handleToggle}
          className="bg-white text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {isOpen ? buttonLabels.open : buttonLabels.closed}
        </button>
      </div>
    );
  };

  const handleMedicineChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [name]: name === "price" ? Number(value) : value,
    };

    const totalPrice = updatedMedicines.reduce(
      (sum, med) => sum + (Number(med.price) || 0),
      0
    );

    setFormData((prev) => {
      if (!prev) return prev; // handle null safely

      return {
        ...prev, // keep all other properties (id, name, etc.)
        medicines: updatedMedicines,
        medicinePrice: totalPrice,
      };
    });
  };
  const handleAdvanceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedAdvance = [...formData.opticalPayDetails];
    updatedAdvance[index] = {
      ...updatedAdvance[index],
      [name]: name === "amount" ? Number(value) : value,
    };

    const totalPrice = updatedAdvance.reduce(
      (sum, med) => sum + (Number(med.amount) || 0),
      0
    );

    setFormData((prev) => {
      if (!prev) return prev; // handle null safely

      return {
        ...prev, // keep all other properties (id, name, etc.)
        opticalPayDetails: updatedAdvance,
        opticalAdvance: totalPrice,
      };
    });
  };

  const addMedicineField = () => {
    setFormData((prev) => {
      if (!prev) return prev; // or return null safely

      return {
        ...prev,
        medicines: [...prev.medicines, {date:todayDate, medicinename: "", price: 0 }],
      };
    });
  };

  const addPayment = () => {
    setFormData((prev) => {
      if (!prev) return prev; // or return null safely

      return {
        ...prev,
        opticalPayDetails: [
          ...prev.opticalPayDetails,
          { date: todayDate, amount: 0, transectionId: "" },
        ],
      };
    });
  };

  const removeMedicineField = (index: number) => {
    setFormData((prev) => {
      if (!prev) return prev; // safely handle null state

      const updatedMedicines = prev.medicines.filter((_, i) => i !== index);
      const totalPrice = updatedMedicines.reduce(
        (sum, med) => sum + (Number(med.price) || 0),
        0
      );

      return {
        ...prev,
        medicines: updatedMedicines,
        medicinePrice: totalPrice,
      };
    });
  };
  const removepaymentField = (index: number) => {
    setFormData((prev) => {
      if (!prev) return prev; // safely handle null state

      const updatedpamentDetails = prev.opticalPayDetails.filter(
        (_, i) => i !== index
      );
      const totalPrice = updatedpamentDetails.reduce(
        (sum, med) => sum + (Number(med.amount) || 0),
        0
      );

      return {
        ...prev,
        opticalPayDetails: updatedpamentDetails,
        opticalAdvance: totalPrice,
      };
    });
  };

  const removeDiagnosis = (index: number) => {
    setFormData((prev) => {
      if (!prev) return prev; // safely handle null state

      const updatedDiagnosis = prev.diagnosis.filter((_, i) => i !== index);

      return {
        ...prev,
        diagnosis: updatedDiagnosis,
      };
    });
  };

  // Medicine name and price mapping
const medicineList = {
  "moximax": 148,
  "yesflox P": 100,
  "Heltroz": 150,
  "locfresh gel": 155,
  "cycloact": 70,
  "selfquin LP": 170,
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
  "selfquin P": 125,
  "ceflox": 58,
  "yesflox": 80,
  "yapat": 105,
  "yapat kt": 140,
  "ralcafit": 240,
};

// When selecting or typing medicine name
const handleMedicineSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  const { value } = e.target;
  const [namePart] = value.split("-"); // handle "name - price" input
  const cleanName = namePart.trim().toLowerCase();

  const newMedicines = [...formData.medicines];
  newMedicines[index].medicinename = value;

  // Auto-fill price if match found
  if (cleanName in medicineList) {
    newMedicines[index].price = medicineList[cleanName as keyof typeof medicineList];
  }

  // ✅ Recalculate total medicine price
  const totalPrice = newMedicines.reduce(
    (sum, med) => sum + (Number(med.price) || 0),
    0
  );

  // ✅ Update formData including new total
  setFormData({
    ...formData,
    medicines: newMedicines,
    medicinePrice: totalPrice,
  });
};

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-2 md:space-y-4 bg-white shadow rounded-lg">
      {/* Header */}
      <h2 className="text-3xl font-bold text-gray-800">
        Edit Patient{" "}
        <span className="text-sm text-gray-500">{formData.ptName}</span>
      </h2>

    {(basicDetails || isLargeScreen) && (
  <div className="space-y-4">
    {/* Patient Info */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      <input
        type="text"
        name="ptName"
        value={formData.ptName}
        onChange={handleChange}
        placeholder="Patient Name"
        className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
      />
      <input
        type="number"
        name="age"
        value={formData.age}
        onChange={handleChange}
        placeholder="Age"
        className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
      />
      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
      >
        <option value="F">Female</option>
        <option value="M">Male</option>
        <option value="Other">Other</option>
      </select>

      <input
        type="text"
        name="phoneNo"
        value={formData.phoneNo}
        onChange={handleChange}
        placeholder="Phone Number"
        className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
      />
      <input
        type="email"
        name="email"
        value={formData.email || ""}
        onChange={handleChange}
        placeholder="Email"
        className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
      />

      <select
        name="purpose"
        required
        onChange={handleChange}
        className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-teal-500 w-full"
      >
        <option value="">Select Purpose</option>
        <option value="eye-test">Eye Test</option>
        <option value="frame-selection">Frame Selection</option>
        <option value="consultation">Consultation</option>
      </select>

      <input
        type="date"
        name="preferredDate"
        value={formData.preferredDate}
        onChange={handleChange}
        className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
      />

      <select
        name="preferredTime"
        value={formData.preferredTime}
        onChange={handleChange}
        className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
      >
        {Array.from({ length: 19 }, (_, i) => {
          const hour = 9 + Math.floor(i / 2);
          const minutes = i % 2 === 0 ? "00" : "30";
          const time = `${hour.toString().padStart(2, "0")}:${minutes}`;
          return (
            <option key={time} value={time}>
              {time}
            </option>
          );
        })}
      </select>

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
      >
        {["pending", "cancelled"].includes(formData.status) && (
          <>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </>
        )}

        {formData.status === "confirmed" && (
          <>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
          </>
        )}

        {formData.status === "completed" && (
          <option value="completed">Completed</option>
        )}
      </select>
    </div>

    {/* Notes & Complaints */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm md:text-base">Note</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="border p-2 md:p-3 rounded text-sm md:text-base w-full focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm md:text-base">
          Present Complaints
        </label>
        <textarea
          name="presentComplaints"
          value={formData.presentComplaints}
          onChange={handleChange}
          rows={3}
          className="border p-2 md:p-3 rounded text-sm md:text-base w-full focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>
  </div>
)}


      {/* basic details togal */}
      {renderToggleSection(
        {
          isOpen: basicDetails,
          onToggle: () => setbasicDetails(!basicDetails),
          closedLabel: "Basic details",
          buttonLabels: { open: "Hide Details", closed: "Basic Details" },
        },
        isLargeScreen
      )}

      {/* Vision Details */}

{(isLargeScreen || showVisionDetails) && (
  <div className="space-y-3 md:space-y-4 w-full">
    <h3 className="text-base md:text-lg font-semibold text-gray-700">
      Vision Details
    </h3>

    {/* Responsive Scroll Wrapper */}
    <div className="w-full overflow-x-auto">
      <div className="inline-block w-full align-middle">
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden text-xs md:text-sm">
          <thead className="bg-gray-100">
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
                label: "Unaided Distance",
                rightKey: "unaidedDistance",
                leftKey: "unaidedDistance",
                distanceOptions: ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36", "6/60"],
              },
              {
                label: "Unaided Near",
                rightKey: "unaidedNear",
                leftKey: "unaidedNear",
                nearOptions: ["N5", "N6", "N8", "N10", "N12"],
              },
              {
                label: "Best Corrected Distance",
                rightKey: "bestCorrectedDistance",
                leftKey: "bestCorrectedDistance",
                distanceOptions: ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36"],
              },
              {
                label: "Best Corrected Near",
                rightKey: "bestCorrectedNear",
                leftKey: "bestCorrectedNear",
                nearOptions: ["N5", "N6", "N8", "N10", "N12"],
              },
            ].map(({ label, rightKey, leftKey, distanceOptions, nearOptions }) => {
              const options = distanceOptions || nearOptions || [];
              return (
                <tr key={label}>
                  <td className="px-2 md:px-4 py-1 md:py-1.5 font-medium text-gray-700 whitespace-nowrap">
                    {label}
                  </td>

                  {/* Right Eye */}
                  <td className="px-2 md:px-4 py-1 md:py-1.5">
                    <input
                      type="text"
                      list={`${rightKey}Options`}
                      name={`vision.rightEye.${rightKey}`}
                      value={(formData.vision?.rightEye as any)?.[rightKey] || ""}
                      onChange={(e) =>
                        handleNestedChange(`vision.rightEye.${rightKey}`, e.target.value)
                      }
                      placeholder="Value"
                      className="border p-1.5 md:p-2 rounded w-full focus:ring-1 focus:ring-blue-400 text-xs md:text-sm"
                    />
                    <datalist id={`${rightKey}Options`}>
                      {options.map((opt) => (
                        <option key={opt} value={opt} />
                      ))}
                    </datalist>
                  </td>

                  {/* Left Eye */}
                  <td className="px-2 md:px-4 py-1 md:py-1.5">
                    <input
                      type="text"
                      list={`${leftKey}Options`}
                      name={`vision.leftEye.${leftKey}`}
                      value={(formData.vision?.leftEye as any)?.[leftKey] || ""}
                      onChange={(e) =>
                        handleNestedChange(`vision.leftEye.${leftKey}`, e.target.value)
                      }
                      placeholder="Value"
                      className="border p-1.5 md:p-2 rounded w-full focus:ring-1 focus:ring-blue-400 text-xs md:text-sm"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}


      {/* Vision Details Toggle */}
      {renderToggleSection(
        {
          isOpen: showVisionDetails,
          onToggle: () => setShowVisionDetails(!showVisionDetails),
          closedLabel: "Vision details",
          buttonLabels: { open: "Hide Details", closed: "Show Details" },
        },
        isLargeScreen
      )}

{/* Exam Details */}
{(isLargeScreen || showExamDetails) && (
  <div className="space-y-3 md:space-y-4 w-full">
    <h3 className="text-base md:text-lg font-semibold text-gray-700">
      Exam Details
    </h3>

    {/* Responsive Scroll Wrapper */}
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
              { label: "Adnexa", name: "adnexa", options: ["Normal", "Swelling", "Redness"] },
              { label: "Conjunctiva", name: "conjunctiva", options: ["Normal", "Pale", "Injected"] },
              { label: "Cornea", name: "cornea", options: ["Clear", "Opacity", "Edema"] },
              { label: "Anterior Chamber", name: "anteriorChamber", options: ["Normal", "Shallow", "Deep"] },
              { label: "Iris", name: "iris", options: ["Normal", "Atrophy"] },
              { label: "Lens", name: "lens", options: ["Clear", "Cataract", "Pseudophakia"] },
              { label: "Fundus", name: "fundus", options: ["Normal", "DR", "HR", "AMD"] },
              { label: "Orbit", name: "orbit", options: ["Normal", "Mass", "Inflammation"] },
              { label: "Syringing", name: "syringing", options: ["Patent", "Blocked"] },
              { label: "Vitreous", name: "vitreous", options: ["Clear", "Floaters"] },
            ].map(({ label, name, options }) => (
              <tr key={name}>
                <td className="px-2 md:px-4 py-1 md:py-1.5 font-medium text-gray-700 whitespace-nowrap">
                  {label}
                </td>

                {/* Right Eye */}
                <td className="px-2 md:px-4 py-1 md:py-1.5">
                  <input
                    type="text"
                    list={`${name}Options`}
                    name={`examDetails.${name}.right`}
                    value={(formData.examDetails as any)?.[name]?.right || ""}
                    onChange={(e) =>
                      handleNestedChange(`examDetails.${name}.right`, e.target.value)
                    }
                    placeholder="R"
                    className="border p-1.5 md:p-2 rounded w-full focus:ring-1 focus:ring-blue-400 text-xs md:text-sm"
                  />
                  <datalist id={`${name}Options`}>
                    {options.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </td>

                {/* Left Eye */}
                <td className="px-2 md:px-4 py-1 md:py-1.5">
                  <input
                    type="text"
                    list={`${name}Options`}
                    name={`examDetails.${name}.left`}
                    value={(formData.examDetails as any)?.[name]?.left || ""}
                    onChange={(e) =>
                      handleNestedChange(`examDetails.${name}.left`, e.target.value)
                    }
                    placeholder="L"
                    className="border p-1.5 md:p-2 rounded w-full focus:ring-1 focus:ring-blue-400 text-xs md:text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}


      {/* Exam Details Toggle */}
      {renderToggleSection(
        {
          isOpen: showExamDetails,
          onToggle: () => setShowExamDetails(!showExamDetails),
          closedLabel: "Write Report",
          buttonLabels: { open: "Hide Details", closed: "Show Details" },
        },
        isLargeScreen
      )}

      {/* Glasses Prescription */}
  {(isLargeScreen || showGlassesPrescription) && (
  <div className="space-y-3 md:space-y-4 w-full">
    <h3 className="text-lg md:text-xl font-semibold text-gray-700">
      Glasses Prescription
    </h3>

    {/* Use */}
    <div className="flex flex-col w-full md:max-w-md">
      <label className="font-medium mb-1 text-sm md:text-base">Use</label>
      <input
        type="text"
        list="useOptions"
        name="glassesPrescription.use"
        value={formData.glassesPrescription?.use || ""}
        onChange={(e) =>
          handleNestedChange("glassesPrescription.use", e.target.value)
        }
        placeholder="Select or enter use"
        className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
      />
      <datalist id="useOptions">
        <option value="Distance" />
        <option value="Near" />
        <option value="Bifocal" />
        <option value="Progressive" />
      </datalist>
    </div>

    {/* Table Layout */}
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
              <td className="border px-2 md:px-4 py-1.5 md:py-2 font-medium text-gray-700 whitespace-nowrap">
                {label}
              </td>

              {/* Right Eye */}
              <td className="border px-2 md:px-4 py-1.5 md:py-2">
                <input
                  type="text"
                  list={`${key}Options`}
                  name={`glassesPrescription.rightEye.${key}`}
                  value={
                    (formData.glassesPrescription?.rightEye as any)?.[key] || ""
                  }
                  onChange={(e) =>
                    handleNestedChange(
                      `glassesPrescription.rightEye.${key}`,
                      e.target.value
                    )
                  }
                  placeholder="R"
                  className="border p-1.5 md:p-2 rounded w-full focus:ring-2 focus:ring-blue-400 text-xs md:text-sm"
                />
              </td>

              {/* Left Eye */}
              <td className="border px-2 md:px-4 py-1.5 md:py-2">
                <input
                  type="text"
                  list={`${key}Options`}
                  name={`glassesPrescription.leftEye.${key}`}
                  value={
                    (formData.glassesPrescription?.leftEye as any)?.[key] || ""
                  }
                  onChange={(e) =>
                    handleNestedChange(
                      `glassesPrescription.leftEye.${key}`,
                      e.target.value
                    )
                  }
                  placeholder="L"
                  className="border p-1.5 md:p-2 rounded w-full focus:ring-2 focus:ring-blue-400 text-xs md:text-sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Common Datalists */}
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
      {["+0.50", "+0.75", "+1.00", "+1.25", "+1.50", "+1.75", "+2.00", "+2.25", "+2.50", "+2.75", "+3.00"].map((val) => (
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
      {["6/6","6/7.5","6/9","6/12","6/15","6/18","6/24","6/30","6/36","6/45","6/60","5/60","4/60","3/60","2/60","CFC","HM","PL+","PL-","PLPr+","NLP","LP"].map((val) => (
        <option key={val} value={val} />
      ))}
    </datalist>

    <datalist id="nvOptions">
      {["N3","N4","N5","N6","N8","N10","N12","N14","N16","N18","N20","N24","N36","N48","N60"].map((val) => (
        <option key={val} value={val} />
      ))}
    </datalist>
  </div>
)}

      {/* Glasses Prescription Toggle */}
      {renderToggleSection(
        {
          isOpen: showGlassesPrescription,
          onToggle: () => setShowGlassesPrescription(!showGlassesPrescription),
          closedLabel: "Prescription",
          buttonLabels: {
            open: "Hide Details",
            closed: "Show Details",
          },
        },
        isLargeScreen
      )}

      {/* IOP Pachy CCT */}
{(isLargeScreen || showIopPachyCCT) && (
  <div className="space-y-3 md:space-y-4 w-full">
    <h3 className="text-lg md:text-xl font-semibold text-gray-700">
      IOP Pachy CCT
    </h3>

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
          ].map(({ label, key }) => (
            <tr key={key} className="odd:bg-white even:bg-gray-50">
              <td className="border px-2 md:px-4 py-1.5 md:py-2 font-medium text-gray-700 whitespace-nowrap">
                {label}
              </td>

              {/* Right Eye */}
              <td className="border px-2 md:px-4 py-1.5 md:py-2">
                <input
                  type="text"
                  list={
                    key.includes("cct")
                      ? "cctOptions"
                      : key.includes("iop")
                      ? "iopOptions"
                      : undefined
                  }
                  name={`iopPachyCCT.rightEye.${key}`}
                  value={
                    (formData.iopPachyCCT?.rightEye as any)?.[key] || ""
                  }
                  onChange={(e) =>
                    handleNestedChange(
                      `iopPachyCCT.rightEye.${key}`,
                      e.target.value
                    )
                  }
                  placeholder="R"
                  className="border p-1.5 md:p-2 rounded w-full focus:ring-2 focus:ring-blue-400 text-xs md:text-sm"
                />
              </td>

              {/* Left Eye */}
              <td className="border px-2 md:px-4 py-1.5 md:py-2">
                <input
                  type="text"
                  list={
                    key.includes("cct")
                      ? "cctOptions"
                      : key.includes("iop")
                      ? "iopOptions"
                      : undefined
                  }
                  name={`iopPachyCCT.leftEye.${key}`}
                  value={
                    (formData.iopPachyCCT?.leftEye as any)?.[key] || ""
                  }
                  onChange={(e) =>
                    handleNestedChange(
                      `iopPachyCCT.leftEye.${key}`,
                      e.target.value
                    )
                  }
                  placeholder="L"
                  className="border p-1.5 md:p-2 rounded w-full focus:ring-2 focus:ring-blue-400 text-xs md:text-sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Common Datalists */}
    <datalist id="iopOptions">
      {["10","12","14","16","18","20","22","24","26","28"].map((val) => (
        <option key={val} value={val} />
      ))}
    </datalist>

    <datalist id="cctOptions">
      {["480","500","520","540","560","580","600","620"].map((val) => (
        <option key={val} value={val} />
      ))}
    </datalist>
  </div>
)}

      {/* IOP Pachy CCT Toggle */}
      {renderToggleSection(
        {
          isOpen: showIopPachyCCT,
          onToggle: () => setShowIopPachyCCT(!showIopPachyCCT),
          closedLabel: "IOP Details",
          buttonLabels: {
            open: "Hide Details",
            closed: "Show Details",
          },
        },
        isLargeScreen
      )}

      {/* Diagnosis */}
    {(isLargeScreen || showDiagnosis) && (
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
              handleNestedChange("diagnosis", newDiagnosis);
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
          handleNestedChange("diagnosis", [
            ...(formData.diagnosis || []),
            "",
          ])
        }
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm md:text-base"
      >
        + Add Diagnosis
      </button>
    </div>
  </div>
)}

      {/* Diagnosis Toggle */}
      {renderToggleSection(
        {
          isOpen: showDiagnosis,
          onToggle: () => setShowDiagnosis(!showDiagnosis),
          closedLabel: "Diagnosis",
          buttonLabels: {
            open: "Hide Details",
            closed: "Show Details",
          },
        },
        isLargeScreen
      )}

    {(someDetails || isLargeScreen) && (
  <div className="space-y-6">
    {/* 🧾 Billing & Dates */}
   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white md:p-4 rounded-lg shadow-sm">
      {/* Bill No */}
      <div className="flex flex-col">
        <label className="font-medium mb-1">Bill No</label>
        <input
          type="text"
          name="billNo"
          value={formData.billNo}
          onChange={handleChange}
          placeholder="Enter Bill No"
          className="border border-gray-300 p-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      {/* Delivery Status */}
      <div className="flex flex-col">
        <label className="font-medium mb-1">Delivery Status</label>
        <select
          name="deliveryStatus"
          value={formData.deliveryStatus}
          onChange={handleChange}
          className="border border-gray-300 p-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="pending">Pending</option>
          <option value="inProgress">In Progress</option>
          <option value="readyToDeliver">Ready to Deliver</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Order Date */}
      <div className="flex flex-col">
        <label className="font-medium mb-1">Order Date</label>
        <input
          type="date"
          name="orderDate"
          value={formData.orderDate}
          onChange={handleChange}
          className="border border-gray-300 p-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      {/* Delivery Date */}
      <div className="flex flex-col">
        <label className="font-medium mb-1">Delivery Date</label>
        <input
          type="date"
          name="deliveryDate"
          value={formData.deliveryDate}
          onChange={handleChange}
          className="border border-gray-300 p-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>
    </div>

    {/* 👓 Frame & Lens Details */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white md:p-4 rounded-lg shadow-sm">
      <div className="flex flex-col">
        <label className="font-medium mb-1">Frame ID</label>
        <input
          type="text"
          name="frameId"
          value={formData.frameId || ""}
          onChange={handleChange}
          placeholder="Frame ID"
          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium mb-1">Frame Price</label>
        <input
          type="number"
          name="framePrice"
          value={formData.framePrice}
          onChange={handleChange}
          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium mb-1">Lens Type</label>
        <input
          type="text"
          list="lensTypeOptions"
          name="lenseType"
          value={formData.lenseType || ""}
          onChange={handleChange}
          placeholder="Select or enter lens type"
          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
        <datalist id="lensTypeOptions">
          <option value="Progressive" />
          <option value="Single Vision" />
          <option value="Bifocal" />
          <option value="Trifocal" />
          <option value="Reading" />
        </datalist>
      </div>

      <div className="flex flex-col">
        <label className="font-medium mb-1">Lens Price</label>
        <input
          type="number"
          name="lensePrice"
          value={formData.lensePrice}
          onChange={handleChange}
          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>

    {/* 💳 Optical Payment */}
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Totals */}
      <div className="flex flex-col-2 sm:flex-col gap-3 w-full lg:max-w-[250px]">
        <div>
          <label className="font-medium mb-1">Optical Total</label>
          <input
            type="number"
            readOnly
            value={(formData.framePrice || 0) + (formData.lensePrice || 0)}
            className="border p-2 md:p-3 rounded w-full bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="font-medium mb-1">Optical Due</label>
          <input
            type="number"
            readOnly
            value={
              (formData.framePrice || 0) +
              (formData.lensePrice || 0) -
              (formData.opticalAdvance || 0)
            }
            className="border p-2 md:p-3 rounded w-full bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>

       {/* Payment Details */}
        <div className="w-full grid md:flex rounded-md gap-1 md:gap-3">
          <div className="flex mt-3 rounded-md flex-col w-full">
            <h3 className="font-semibold text-base md:text-lg">Advance Payments</h3>
    
            <div className="grid grid-cols-3 w-full text-xs md:text-sm font-medium text-gray-700 px-1 md:px-3">
              <label>Date</label>
              <label>T-Id</label>
              <label>Amount</label>
            </div>
    
            {formData.opticalPayDetails.map((med, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-1 items-end md:p-2 rounded"
              >
                <div className="flex flex-col">
                  <input
                    type="date"
                    name="date"
                    value={med.date}
                    onChange={(e) => handleAdvanceChange(e, index)}
                    className="border py-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />
                </div>
    
                <div className="flex flex-col">
                  <input
                    type="text"
                    name="transectionId"
                    value={med.transectionId}
                    onChange={(e) => handleAdvanceChange(e, index)}
                    placeholder="Enter TransectionId"
                    className="border p-1 py-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />
                </div>
    
                <div className="flex flex-col">
                  <div className="flex">
                    <input
                      type="number"
                      name="amount"
                      value={med.amount}
                      onChange={(e) => handleAdvanceChange(e, index)}
                      placeholder="Enter Price"
                      className="border p-1 py-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => removepaymentField(index)}
                      className="bg-red-500 text-white rounded-lg px-3 md:px-4 py-2 ml-1 hover:bg-red-600 transition"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
    
            <div className="grid grid-cols-2 justify-between px-2 md:px-3 mt-2 w-full">
              <button
                type="button"
                onClick={addPayment}
                className="bg-blue-500 text-white rounded-lg px-2 md:px-3 py-2 w-fit hover:bg-blue-600 transition text-sm md:text-base"
              >
                + Add Payment
              </button>
              <div className="flex justify-end">
                <input
                  type="number"
                  value={formData.opticalAdvance}
                  readOnly
                  className="border py-2 min-w-[90px] md:min-w-[100px] rounded-lg bg-gray-100 text-gray-700 text-center text-sm md:text-base"
                />
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
)}

      {/*Prescription Details Toggle */}
      {renderToggleSection(
        {
          isOpen: someDetails,
          onToggle: () => setSomeDetails(!someDetails),
          closedLabel: "Order details",
          buttonLabels: { open: "Hide Details", closed: "Show Details" },
        },
        isLargeScreen
      )}

      {/* Payment Details */}
      <div className="space-y-2">
        {/* 🧾 Visit & Medicines Section */}
        <div className="bg-white shadow-md rounded-2xl p-2 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-700">
            Visit & Medicines
          </h3>

          {/* Visit Price */}
          <div className="grid grid-cols-1 md:flex gap-1 md:gap-3">
    <div className="flex flex-col max-w-[200px]">
  <label className="font-medium text-gray-700 mb-1">
    Visit Price
  </label>
  <input
    type="number"
    name="visitPrice"
    value={formData.visitPrice || (formData.repeated ? 100 : 200)}
    onChange={handleChange}
    className="border px-3 py-1 md:py-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
  />
</div>

            {/* Medicines */}
            <div className="flex bg-gray-50 flex-col w-full">
  {/* Header */}
  <div className="grid grid-cols-2 w-full">
    <label className="font-medium px-3 text-gray-700">Date</label>
    <label className="font-medium px-3 text-gray-700">Medicine Name</label>
    <label className="font-medium px-3 text-gray-700">Price</label>
  </div>

  {/* Medicine List */}
  {formData.medicines.map((med, index) => (
    <div
      key={index}
      className="grid grid-cols-3 gap-1 items-end bg-gray-50 p-1 md:p-2"
    >
                 <div className="flex flex-col">
                  <input
                    type="date"
                    name="date"
                    value={med.date}
                    onChange={(e) => handleAdvanceChange(e, index)}
                    className="border py-2 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />
                </div>
    
      <div className="flex flex-col">
        {/* 👇 datalist-enabled input */}
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
          <div className="flex justify-end items-center ml-2 md:justify-start">
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

  {/* Medicine Datalist */}
  <datalist id="medicine-options">
    <option value="moximax" />
    <option value="yesflox P" />
    <option value="Heltroz" />
    <option value="locfresh gel" />
    <option value="cycloact" />
    <option value="selfquin LP" />
    <option value="ratroday" />
    <option value="ciplox" />
    <option value="ocurest ah" />
    <option value="realtob oint" />
    <option value="hycotic" />
    <option value="yesflu tab" />
    <option value="nepadot" />
    <option value="realtob f" />
    <option value="tobra" />
    <option value="myneph+" />
    <option value="selfquin P" />
    <option value="ceflox" />
    <option value="yesflox" />
    <option value="yapat" />
    <option value="yapat kt" />
    <option value="ralcafit" />
  </datalist>

  {/* Add Button and Total */}
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

          </div>
        </div>

        {/* 💰 Grand Totals Section */}
        <div className="bg-white shadow-md rounded-2xl  p-3 md:p-4 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-700 mb-1">
            Grand Totals
          </h3>

          <div className="grid grid-cols-3 gap-2 md:gap-6">
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-1">T-Amount</label>
              <input
                type="number"
                readOnly
                value={
                  (formData.visitPrice || 0) +
                  (formData.framePrice || 0) +
                  (formData.lensePrice || 0) +
                  (formData.medicinePrice || 0)
                }
                className="border py-1 px-3 md:py-3 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-1">
                T-Advance
              </label>
              <input
                type="number"
                readOnly
                value={
                  (formData.opticalAdvance || 0) +
                  (formData.medicinePrice || 0) +
                  (formData.visitPrice || 0)
                }
                className="border py-1 px-3 md:py-3 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-1">
                Total Due
              </label>
              <input
                type="number"
                readOnly
                value={
                  (formData.framePrice || 0) +
                  (formData.lensePrice || 0) -
                  (formData.opticalAdvance || 0)
                }
                className="border py-1 px-3 md:py-3 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditPage;
