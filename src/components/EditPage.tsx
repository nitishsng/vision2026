"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDashboardData } from "@/src/contexts/dataCollection";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import Medicine from "./editPageComponents/Medicine";
import OpticalPayment from "./editPageComponents/OpticalPayment";
import VisitHistory from "./editPageComponents/VisitHistory";
import GrandAmount from "./editPageComponents/GrandAmount";
import PatientBasicInfo from "./editPageComponents/PatientBasicInfo";
import VisionEntry from "./editPageComponents/VisionEntry";
import ExamDetails from "./editPageComponents/ExamDetails";
import GlassesPrescription from "./editPageComponents/GlassesPrescription";
import IpoPachyCCT from "./editPageComponents/IpoPachyCCT";
import Diagnosis from "./editPageComponents/Diagnosis";
import { DateInput } from "./ui/DateInput";

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
  const [visitAndMedicines, setVisitAndMedicines] = useState(false);
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
      setFormData(existingPatient);
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
          }
        : prev
    );
  };

  type VisionEntry = PatientFullTypeWithObjectId["vision"][number];
  type VisionKey = keyof VisionEntry["rightEye"];

  const handleNestedChange = (path: string, value: any) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const parts = path.split(".");
      const section = parts[0];
      const index = Number(parts[1]);
      if (parts.length === 1) {
        return { ...prev, [section]: value } as PatientFullTypeWithObjectId;
      }
      if (Number.isNaN(index)) return prev;

      const next: any = { ...prev };
      const arr: any[] = Array.isArray((prev as any)[section])
        ? [...(prev as any)[section]]
        : [];

      const defaults: Record<string, any> = {
        vision: {
          updateDate: todayDate,
          rightEye: { unaidedDistance: "" },
          leftEye: { unaidedDistance: "" },
        },
        examDetails: {
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
        },
        iopPachyCCT: {
          updateDate: todayDate,
          rightEye: { methodTime: "", iop: 0 },
          leftEye: { methodTime: "", iop: 0 },
        },
        glassesPrescription: {
          updateDate: todayDate,
          use: "",
          rightEye: { sph: "", add: "" },
          leftEye: { sph: "", add: "" },
        },
        visitDetails: { visitDate: todayDate, visitPrice: 0 },
      };

      const current = arr[index] ?? defaults[section];

      if (parts[2] === "updateDate") {
        arr[index] = { ...current, updateDate: value };
      } else if (section === "vision") {
        const eye = parts[2] as "rightEye" | "leftEye";
        const key = parts[3] as VisionKey;
        arr[index] = { ...current, [eye]: { ...current[eye], [key]: value } };
      } else if (section === "glassesPrescription") {
        if (parts[2] === "use") {
          arr[index] = { ...current, use: value };
        } else {
          const eye = parts[2];
          const key = parts[3];
          const isNumeric = key === "axis";
          arr[index] = {
            ...current,
            [eye]: {
              ...current[eye],
              [key]: isNumeric ? Number(value) : value,
            },
          };
        }
      } else if (section === "iopPachyCCT") {
        const eye = parts[2];
        const key = parts[3];
        const isNumeric =
          key === "iop" || key === "correctedIop" || key === "cct";
        arr[index] = {
          ...current,
          [eye]: { ...current[eye], [key]: isNumeric ? Number(value) : value },
        };
      } else if (section === "examDetails") {
        const param = parts[2];
        const side = parts[3];
        arr[index] = {
          ...current,
          [param]: { ...current[param], [side]: value },
        };
      } else if (section === "visitDetails") {
        const key = parts[2];
        const isNumeric = key === "visitPrice";
        arr[index] = {
          ...current,
          [key]: isNumeric ? Number(value) : value,
        };
      } else {
        return prev;
      }

      next[section] = arr;
      return next as PatientFullTypeWithObjectId;
    });
  };

  // Save handler
  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedFormData = {
        ...formData,
        updatedAt: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
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
      setVisitAndMedicines(false);
      // Then toggle the current section
      onToggle();
    };

    return (
      <div
        className={`
        flex items-center py-1 px-2
        ${isLargeScreen ? "hidden" : ""}
        ${!isLargeScreen && isOpen ? "justify-end" : "justify-between"}
        transition-all duration-200 ease-in-out
      `}
      >
        {/* Show label when collapsed */}
        {!isOpen && <span className="text-gray-600">{closedLabel}</span>}

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={`
          px-3 py-1 rounded border
          focus:outline-none focus:ring-2
          ${
            isOpen
              ? "bg-red-500 text-white border-red-600 hover:bg-red-600 focus:ring-red-400"
              : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50 focus:ring-blue-400"
          }
        `}
        >
          {isOpen ? buttonLabels.open : buttonLabels.closed}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-white shadow rounded-lg">
      {/* Header */}
      <h2 className="text-3xl font-bold text-gray-800">
        Edit Patient{" "}
        <span className="text-sm text-gray-500">{formData.ptName}</span>
      </h2>

      {(basicDetails || isLargeScreen) && (
        <PatientBasicInfo formData={formData} handleChange={handleChange} />
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
        <VisionEntry
          formData={formData}
          handleNestedChange={handleNestedChange}
          setFormData={
            setFormData as React.Dispatch<
              React.SetStateAction<PatientFullTypeWithObjectId>
            >
          }
        />
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
        <ExamDetails
          formData={formData}
          handleNestedChange={handleNestedChange}
          setFormData={
            setFormData as React.Dispatch<
              React.SetStateAction<PatientFullTypeWithObjectId>
            >
          }
        />
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
        <GlassesPrescription
          formData={formData}
          handleNestedChange={handleNestedChange}
          setFormData={
            setFormData as React.Dispatch<
              React.SetStateAction<PatientFullTypeWithObjectId>
            >
          }
        />
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
        <IpoPachyCCT
          formData={formData}
          handleNestedChange={handleNestedChange}
          setFormData={
            setFormData as React.Dispatch<
              React.SetStateAction<PatientFullTypeWithObjectId>
            >
          }
        />
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
        <Diagnosis
          formData={formData}
          handleNestedChange={handleNestedChange}
          setFormData={
            setFormData as React.Dispatch<
              React.SetStateAction<PatientFullTypeWithObjectId>
            >
          }
        />
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
        <div className="space-y-1">
          {/* Billing & Dates */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:p-4 rounded-lg ">
            {/* Bill No */}
            <div className="flex flex-col">
              <label className="font-medium mb-[3mb]">Bill No</label>
              <input
                type="text"
                name="billNo"
                value={formData.billNo}
                onChange={handleChange}
                placeholder="Enter Bill No"
                className="border border-gray-300 p-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Delivery Status */}
            <div className="flex flex-col">
              <label className="font-medium mb-[3mb]">Delivery Status</label>
              <select
                name="deliveryStatus"
                value={formData.deliveryStatus}
                onChange={handleChange}
                className="border border-gray-300 p-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="inProgress">In Progress</option>
                <option value="readyToDeliver">Ready to Deliver</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Order Date */}
            <div className="flex flex-col">
              <label className="font-medium mb-[3mb]">Order Date</label>
              <DateInput
                name="orderDate"
                value={formData.orderDate || ""}
                onChange={handleChange}
                className="border border-gray-300 p-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Delivery Date */}
            <div className="flex flex-col">
              <label className="font-medium mb-[3mb]">Delivery Date</label>
              <DateInput
                name="deliveryDate"
                value={formData.deliveryDate || ""}
                onChange={handleChange}
                className="border border-gray-300 p-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 👓 Frame & Lens Details */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2  md:p-4 rounded-lg ">
            <div className="flex flex-col">
              <label className="font-medium mb-[3mb]">Frame ID</label>
              <input
                type="text"
                name="frameId"
                value={formData.frameId || ""}
                onChange={handleChange}
                placeholder="Frame ID"
                className="border p-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-medium mb-[3mb]">Frame Price</label>
              <input
                type="number"
                min={0}
                name="framePrice"
                value={formData.framePrice}
                onChange={handleChange}
                className="border p-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-medium mb-[3mb]">Lens Type</label>
              <input
                type="text"
                list="lensTypeOptions"
                name="lenseType"
                value={formData.lenseType || ""}
                onChange={handleChange}
                placeholder="Select or enter lens type"
                className="border p-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400"
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
              <label className="font-medium mb-[3mb]">Lens Price</label>
              <input
                type="number"
                min={0}
                name="lensePrice"
                value={formData.lensePrice}
                onChange={handleChange}
                className="border p-1 md:p-2 rounded-sm w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* 💳 Optical Payment */}
          <div className="flex flex-col lg:flex-row gap-2">
            {/* Totals */}
            <div className="grid grid-cols-3  gap-2 w-full lg:max-w-[250px]">
              <div>
                <label className="font-medium mb-1 block">Optical Total</label>
                <input
                  type="number"
                  readOnly
                  value={
                    (formData.framePrice || 0) + (formData.lensePrice || 0)
                  }
                  className="border p-1 md:p-2 rounded-sm w-full cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Discount</label>
                <input
                  type="number"
                  name="discount"
                  min={0}
                  max={(formData.framePrice || 0) + (formData.lensePrice || 0)}
                  value={formData.discount || 0}
                  onChange={handleChange}
                  className="border p-1 md:p-2 rounded-sm w-full"
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Optical Due</label>
                <input
                  type="number"
                  readOnly
                  value={
                    (formData.framePrice || 0) +
                    (formData.lensePrice || 0) -
                    (formData.discount || 0) -
                    (formData.opticalPayDetails || []).reduce(
                      (sum, d) => sum + (Number(d.amount) || 0),
                      0
                    )
                  }
                  className="border p-1 md:p-2 rounded-sm w-full cursor-not-allowed"
                />
              </div>
            </div>

            {formData && (
              <OpticalPayment
                formData={formData}
                setFormData={
                  setFormData as React.Dispatch<
                    React.SetStateAction<PatientFullTypeWithObjectId>
                  >
                }
              />
            )}
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

      {(visitAndMedicines || isLargeScreen) && (
        <div className="space-y-2">
          {/* Payment Details */}
          {/* 🧾 Visit & Medicines Section */}
          <div className="bg-white shadow-md rounded-2xl px-2 py-3 border border-gray-100">
            {/* <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Visit & Medicines
          </h3> */}

            <div className="flex flex-col md:flex-row w-full gap-2">
              {formData && (
                <VisitHistory
                  formData={formData}
                  handleNestedChange={handleNestedChange}
                  setFormData={
                    setFormData as React.Dispatch<
                      React.SetStateAction<PatientFullTypeWithObjectId>
                    >
                  }
                />
              )}
              {/* Medicines */}
              <div className="flex-1">
                {formData && (
                  <Medicine
                    formData={formData}
                    setFormData={
                      setFormData as React.Dispatch<
                        React.SetStateAction<PatientFullTypeWithObjectId>
                      >
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {renderToggleSection(
        {
          isOpen: visitAndMedicines,
          onToggle: () => setVisitAndMedicines(!visitAndMedicines),
          closedLabel: "Visit & Medicines",
          buttonLabels: { open: "Hide Details", closed: "Show Details" },
        },
        isLargeScreen
      )}

      {/* Grand Totals Section */}
      {formData && (
        <div className="pt-4">
          <GrandAmount formData={formData} />
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 mt-2 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditPage;
// const normalizePatient = (
//   p: PatientFullTypeWithObjectId
// ): PatientFullTypeWithObjectId => {
//   const toArray = (val: any, def: any) =>
//     Array.isArray(val) ? val : val ? [val] : [def];

//   const examDefault = {
//     updateDate: todayDate,
//     adnexa: { right: "", left: "" },
//     conjunctiva: { right: "", left: "" },
//     cornea: { right: "", left: "" },
//     anteriorChamber: { right: "", left: "" },
//     iris: { right: "", left: "" },
//     lens: { right: "", left: "" },
//     fundus: { right: "", left: "" },
//     orbit: { right: "", left: "" },
//     syringing: { right: "", left: "" },
//     vitreous: { right: "", left: "" },
//   };

//   const iopDefault = {
//     updateDate: todayDate,
//     rightEye: { methodTime: "", iop: 0, correctedIop: 0, cct: 0 },
//     leftEye: { methodTime: "", iop: 0, correctedIop: 0, cct: 0 },
//   };

//   const gpDefault = {
//     updateDate: todayDate,
//     use: "",
//     rightEye: { sph: "", add: "" },
//     leftEye: { sph: "", add: "" },
//   };

//   const visionDefault = {
//     updateDate: todayDate,
//     rightEye: { unaidedDistance: "" },
//     leftEye: { unaidedDistance: "" },
//   };

//   const normExam = toArray((p as any).examDetails, examDefault).map(
//     (e: any) => ({
//       ...examDefault,
//       ...e,
//       updateDate: e?.updateDate || todayDate,
//       adnexa: { ...examDefault.adnexa, ...(e?.adnexa || {}) },
//       conjunctiva: { ...examDefault.conjunctiva, ...(e?.conjunctiva || {}) },
//       cornea: { ...examDefault.cornea, ...(e?.cornea || {}) },
//       anteriorChamber: {
//         ...examDefault.anteriorChamber,
//         ...(e?.anteriorChamber || {}),
//       },
//       iris: { ...examDefault.iris, ...(e?.iris || {}) },
//       lens: { ...examDefault.lens, ...(e?.lens || {}) },
//       fundus: { ...examDefault.fundus, ...(e?.fundus || {}) },
//       orbit: { ...examDefault.orbit, ...(e?.orbit || {}) },
//       syringing: { ...examDefault.syringing, ...(e?.syringing || {}) },
//       vitreous: { ...examDefault.vitreous, ...(e?.vitreous || {}) },
//     })
//   );

//   const normIop = toArray((p as any).iopPachyCCT, iopDefault).map((e: any) => ({
//     updateDate: e?.updateDate || todayDate,
//     rightEye: { ...iopDefault.rightEye, ...(e?.rightEye || {}) },
//     leftEye: { ...iopDefault.leftEye, ...(e?.leftEye || {}) },
//   }));

//   const normGp = toArray((p as any).glassesPrescription, gpDefault).map(
//     (e: any) => ({
//       updateDate: e?.updateDate || todayDate,
//       use: e?.use ?? "",
//       rightEye: { ...gpDefault.rightEye, ...(e?.rightEye || {}) },
//       leftEye: { ...gpDefault.leftEye, ...(e?.leftEye || {}) },
//     })
//   );

//   const normVision = toArray((p as any).vision, visionDefault).map(
//     (e: any) => ({
//       updateDate: e?.updateDate || todayDate,
//       rightEye: { ...visionDefault.rightEye, ...(e?.rightEye || {}) },
//       leftEye: { ...visionDefault.leftEye, ...(e?.leftEye || {}) },
//     })
//   );
//   const normVisits = Array.isArray((p as any).visitDetails)
//     ? (p as any).visitDetails.map((e: any) => ({
//         visitDate: e?.visitDate || todayDate,
//         visitPrice: Number(e?.visitPrice) || 0,
//       }))
//     : [
//         {
//           visitDate:
//             typeof (p as any).visitDate === "string"
//               ? (p as any).visitDate
//               : todayDate,
//           visitPrice: Number((p as any).visitPrice) || 0,
//         },
//       ];

//   return {
//     ...p,
//     examDetails: normExam,
//     iopPachyCCT: normIop,
//     glassesPrescription: normGp,
//     vision: normVision,
//     visitDetails: normVisits.length ? normVisits : [],
//   } as PatientFullTypeWithObjectId;
// };
