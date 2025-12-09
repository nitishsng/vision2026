"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDashboardData } from "@/src/contexts/dataCollection";
import { PatientFullTypeWithObjectId, todayDate } from "@/src/contexts/type";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Delete } from "lucide-react";
import Medicine from "./Medicine";
import OpticalPayment from "./OpticalPayment";
import useEligibility from "./elegibleForfeatures";
const EditPage = () => {
  const eligibleForFeatures = useEligibility();
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
      setFormData(normalizePatient(existingPatient as any));
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
        updatedAt: new Date().toISOString(),
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

  return (
    <div className="max-w-5xl mx-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-white shadow rounded-lg">
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
              value={formData.preferredDate || ""}
              onChange={handleChange}
              className="border p-2 md:p-3 rounded text-sm md:text-base focus:ring-2 focus:ring-blue-400 w-full"
            />

            <select
              name="preferredTime"
              value={formData.preferredTime || ""}
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
              <label className="font-semibold mb-1 text-sm md:text-base">
                Address
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border p-2 md:p-3 rounded text-sm md:text-base w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-sm md:text-base">
                Present Complaints
              </label>
              <input
                name="presentComplaints"
                value={formData.presentComplaints}
                onChange={handleChange}
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
            <div
              key={index}
              className="space-y-3 border p-2 rounded-lg bg-gray-50"
            >
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
                    onClick={() =>
                      setFormData((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          vision: (prev.vision || []).filter(
                            (_, i) => i !== index
                          ),
                        };
                      })
                    }
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
                          options: [
                            "6/6",
                            "6/9",
                            "6/12",
                            "6/18",
                            "6/24",
                            "6/36",
                          ],
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
                        <td className="px-2 md:px-4 py-2">
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
                            className="border p-1.5 md:p-2 rounded w-full"
                          />
                        </td>

                        {/* Left eye */}
                        <td className="px-2 md:px-4 py-2">
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
                            className="border p-1.5 md:p-2 rounded w-full"
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

          {formData.examDetails?.map((entry, index) => (
            <div
              key={index}
              className="space-y-3 border p-2 rounded-lg bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm md:text-base font-semibold text-gray-700">
                  Exam Entry #{(formData.examDetails?.length || 0) - index}
                </h4>
                <div className="flex gap-3 items-center">
                  <input
                    type="date"
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
                    onClick={() =>
                      setFormData((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          examDetails: (prev.examDetails || []).filter(
                            (_, i) => i !== index
                          ),
                        } as PatientFullTypeWithObjectId;
                      })
                    }
                    className="text-red-500 text-xs underline"
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
                          <td className="px-2 md:px-4 py-1 md:py-1.5 font-medium text-gray-700 whitespace-nowrap">
                            {label}
                          </td>
                          <td className="px-2 md:px-4 py-1 md:py-1.5">
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
                              className="border p-1.5 md:p-2 rounded w-full focus:ring-1 focus:ring-blue-400 text-xs md:text-sm"
                            />
                          </td>
                          <td className="px-2 md:px-4 py-1 md:py-1.5">
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
          <button
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
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs md:text-sm"
          >
            + Add Prescription Entry
          </button>

          {formData.glassesPrescription?.map((entry, index) => (
            <div
              key={index}
              className="space-y-3 border p-2 rounded-lg bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm md:text-base font-semibold text-gray-700">
                  Prescription Entry #
                  {(formData.glassesPrescription?.length || 0) - index}
                </h4>
                <div className="flex gap-3 items-center">
                  <input
                    type="date"
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
                    onClick={() =>
                      setFormData((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          glassesPrescription: (
                            prev.glassesPrescription || []
                          ).filter((_, i) => i !== index),
                        } as PatientFullTypeWithObjectId;
                      })
                    }
                    className="text-red-500 text-xs underline"
                  >
                    <Delete className="h-8 w-8" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col w-full md:max-w-md">
                <label className="font-medium mb-1 text-sm md:text-base">
                  Use
                </label>
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
                        <td className="border px-2 md:px-4 py-1.5 md:py-2 font-medium text-gray-700 whitespace-nowrap">
                          {label}
                        </td>
                        <td className="border px-2 md:px-4 py-1.5 md:py-2">
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
                            className="border p-1.5 md:p-2 rounded w-full focus:ring-2 focus:ring-blue-400 text-xs md:text-sm"
                          />
                        </td>
                        <td className="border px-2 md:px-4 py-1.5 md:py-2">
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
                            className="border p-1.5 md:p-2 rounded w-full focus:ring-2 focus:ring-blue-400 text-xs md:text-sm"
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
            {["0.00", "-0.25", "-0.50", "-0.75", "-1.00", "-2.00"].map(
              (val) => (
                <option key={val} value={val} />
              )
            )}
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

          <button
            onClick={() =>
              setFormData((prev) => {
                if (!prev) return prev;
                const newEntry = {
                  updateDate: todayDate,
                  rightEye: { methodTime: "", iop: 0, correctedIop: 0, cct: 0 },
                  leftEye: { methodTime: "", iop: 0, correctedIop: 0, cct: 0 },
                };
                return {
                  ...prev,
                  iopPachyCCT: [newEntry, ...(prev.iopPachyCCT || [])],
                } as PatientFullTypeWithObjectId;
              })
            }
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs md:text-sm"
          >
            + Add IOP Entry
          </button>

          {formData.iopPachyCCT?.map((entry, index) => (
            <div
              key={index}
              className="space-y-3 border p-2 rounded-lg bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm md:text-base font-semibold text-gray-700">
                  IOP Entry #{(formData.iopPachyCCT?.length || 0) - index}
                </h4>
                <div className="flex gap-3 items-center">
                  <input
                    type="date"
                    value={entry.updateDate || ""}
                    onChange={(e) =>
                      handleNestedChange(
                        `iopPachyCCT.${index}.updateDate`,
                        e.target.value
                      )
                    }
                    className="border p-1.5 md:p-2 rounded text-xs md:text-sm"
                  />
                  <button
                    onClick={() =>
                      setFormData((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          iopPachyCCT: (prev.iopPachyCCT || []).filter(
                            (_, i) => i !== index
                          ),
                        } as PatientFullTypeWithObjectId;
                      })
                    }
                    className="text-red-500 text-xs underline"
                  >
                    <Delete className="h-8 w-8" />
                  </button>
                </div>
              </div>

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
                      { label: "Method/Time", key: "methodTime" },
                    ].map(({ label, key }) => (
                      <tr key={key} className="odd:bg-white even:bg-gray-50">
                        <td className="border px-2 md:px-4 py-1.5 md:py-2 font-medium text-gray-700 whitespace-nowrap">
                          {label}
                        </td>
                        <td className="border px-2 md:px-4 py-1.5 md:py-2">
                          <input
                            type="text"
                            list={
                              key === "cct"
                                ? "cctOptions"
                                : key.includes("iop")
                                ? "iopOptions"
                                : undefined
                            }
                            value={(entry.rightEye as any)?.[key] ?? ""}
                            onChange={(e) =>
                              handleNestedChange(
                                `iopPachyCCT.${index}.rightEye.${key}`,
                                e.target.value
                              )
                            }
                            placeholder="R"
                            className="border p-1.5 md:p-2 rounded w-full focus:ring-2 focus:ring-blue-400 text-xs md:text-sm"
                          />
                        </td>
                        <td className="border px-2 md:px-4 py-1.5 md:py-2">
                          <input
                            type="text"
                            list={
                              key === "cct"
                                ? "cctOptions"
                                : key.includes("iop")
                                ? "iopOptions"
                                : undefined
                            }
                            value={(entry.leftEye as any)?.[key] ?? ""}
                            onChange={(e) =>
                              handleNestedChange(
                                `iopPachyCCT.${index}.leftEye.${key}`,
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
            </div>
          ))}

          {/* Common Datalists */}
          <datalist id="iopOptions">
            {["10", "12", "14", "16", "18", "20", "22", "24", "26", "28"].map(
              (val) => (
                <option key={val} value={val} />
              )
            )}
          </datalist>

          <datalist id="cctOptions">
            {["480", "500", "520", "540", "560", "580", "600", "620"].map(
              (val) => (
                <option key={val} value={val} />
              )
            )}
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
                value={formData.orderDate || ""}
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
                value={formData.deliveryDate || ""}
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
                  value={
                    (formData.framePrice || 0) + (formData.lensePrice || 0)
                  }
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
                    (formData.opticalPayDetails || []).reduce(
                      (sum, d) => sum + (Number(d.amount) || 0),
                      0
                    )
                  }
                  className="border p-2 md:p-3 rounded w-full bg-gray-100 cursor-not-allowed"
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

      {/* Payment Details */}
      <div className="space-y-2">
        {/* 🧾 Visit & Medicines Section */}
        <div className="bg-white shadow-md rounded-2xl px-2 py-3 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Visit & Medicines
          </h3>

          <div className="flex flex-col md:flex-row w-full gap-6">
            {/* Visit History */}
            <div className="flex flex-col md:w-[350px] w-full">
              <label className="font-medium text-gray-700 mb-2">
                Visit History
              </label>

              {(formData.visitDetails || []).map((v, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-2 items-center mb-2 w-full p-2 rounded"
                >
                  {/* LEFT column */}
                  <div>
                    <input
                      type="date"
                      value={v.visitDate || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          `visitDetails.${index}.visitDate`,
                          e.target.value
                        )
                      }
                      className="border px-2 py-1 md:py-3 rounded text-sm w-full"
                    />
                  </div>

                  {/* RIGHT column */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={Number(v.visitPrice) || 0}
                      onChange={(e) =>
                        handleNestedChange(
                          `visitDetails.${index}.visitPrice`,
                          e.target.value
                        )
                      }
                      className="border px-2 py-1 md:py-3 rounded text-sm w-full"
                    />

                    <button
                      onClick={() =>
                        setFormData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            visitDetails: (prev.visitDetails || []).filter(
                              (_, i) => i !== index
                            ),
                          };
                        })
                      }
                      className="text-red-500"
                    >
                      <Delete className="w-8 h-8" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-col-2 justify-evenly">
                <div>
                  <button
                    onClick={() =>
                      setFormData((prev) => {
                        if (!prev) return prev;
                        const newEntry = {
                          visitDate: todayDate,
                          visitPrice: 0,
                        };
                        return {
                          ...prev,
                          visitDetails: [
                            ...(prev.visitDetails || []),
                            newEntry,
                          ],
                        } as PatientFullTypeWithObjectId;
                      })
                    }
                    className=" px-10 py-2 bg-blue-600 text-white rounded text-sm md:text-base"
                  >
                    + Add Visit
                  </button>
                </div>
                <div>
                  <input
                    type="number"
                    readOnly
                    value={(formData.visitDetails || []).reduce(
                      (total, v) => total + Number(v.visitPrice || 0),
                      0
                    )}
                    className="border py-1 px-2 md:py-2 rounded-lg bg-gray-100 cursor-not-allowed max-w-[150px]"
                  />
                </div>
              </div>
            </div>

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

        {/* 💰 Grand Totals Section */}
        <div className="bg-white shadow-md rounded-2xl  p-2 md:p-4 border border-gray-100">
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
                  (formData.visitDetails || []).reduce(
                    (sum, v) => sum + (Number(v.visitPrice) || 0),
                    0
                  ) +
                  (formData.framePrice || 0) +
                  (formData.lensePrice || 0) +
                  (formData.medicines || []).reduce(
                    (sum, m) => sum + (Number(m.price) || 0),
                    0
                  )
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
                  (formData.opticalPayDetails || []).reduce(
                    (sum, d) => sum + (Number(d.amount) || 0),
                    0
                  ) +
                  (formData.visitDetails || []).reduce(
                    (sum, v) => sum + (Number(v.visitPrice) || 0),
                    0
                  ) +
                  (formData.medicines || []).reduce(
                    (sum, m) => sum + (Number(m.price) || 0),
                    0
                  )
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
                  (formData.opticalPayDetails || []).reduce(
                    (sum, d) => sum + (Number(d.amount) || 0),
                    0
                  )
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
const normalizePatient = (
  p: PatientFullTypeWithObjectId
): PatientFullTypeWithObjectId => {
  const toArray = (val: any, def: any) =>
    Array.isArray(val) ? val : val ? [val] : [def];

  const examDefault = {
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

  const iopDefault = {
    updateDate: todayDate,
    rightEye: { methodTime: "", iop: 0, correctedIop: 0, cct: 0 },
    leftEye: { methodTime: "", iop: 0, correctedIop: 0, cct: 0 },
  };

  const gpDefault = {
    updateDate: todayDate,
    use: "",
    rightEye: { sph: "", add: "" },
    leftEye: { sph: "", add: "" },
  };

  const visionDefault = {
    updateDate: todayDate,
    rightEye: { unaidedDistance: "" },
    leftEye: { unaidedDistance: "" },
  };

  const normExam = toArray((p as any).examDetails, examDefault).map(
    (e: any) => ({
      ...examDefault,
      ...e,
      updateDate: e?.updateDate || todayDate,
      adnexa: { ...examDefault.adnexa, ...(e?.adnexa || {}) },
      conjunctiva: { ...examDefault.conjunctiva, ...(e?.conjunctiva || {}) },
      cornea: { ...examDefault.cornea, ...(e?.cornea || {}) },
      anteriorChamber: {
        ...examDefault.anteriorChamber,
        ...(e?.anteriorChamber || {}),
      },
      iris: { ...examDefault.iris, ...(e?.iris || {}) },
      lens: { ...examDefault.lens, ...(e?.lens || {}) },
      fundus: { ...examDefault.fundus, ...(e?.fundus || {}) },
      orbit: { ...examDefault.orbit, ...(e?.orbit || {}) },
      syringing: { ...examDefault.syringing, ...(e?.syringing || {}) },
      vitreous: { ...examDefault.vitreous, ...(e?.vitreous || {}) },
    })
  );

  const normIop = toArray((p as any).iopPachyCCT, iopDefault).map((e: any) => ({
    updateDate: e?.updateDate || todayDate,
    rightEye: { ...iopDefault.rightEye, ...(e?.rightEye || {}) },
    leftEye: { ...iopDefault.leftEye, ...(e?.leftEye || {}) },
  }));

  const normGp = toArray((p as any).glassesPrescription, gpDefault).map(
    (e: any) => ({
      updateDate: e?.updateDate || todayDate,
      use: e?.use ?? "",
      rightEye: { ...gpDefault.rightEye, ...(e?.rightEye || {}) },
      leftEye: { ...gpDefault.leftEye, ...(e?.leftEye || {}) },
    })
  );

  const normVision = toArray((p as any).vision, visionDefault).map(
    (e: any) => ({
      updateDate: e?.updateDate || todayDate,
      rightEye: { ...visionDefault.rightEye, ...(e?.rightEye || {}) },
      leftEye: { ...visionDefault.leftEye, ...(e?.leftEye || {}) },
    })
  );

  const visitDefault = { visitDate: todayDate, visitPrice: 0 };
  const normVisits = Array.isArray((p as any).visitDetails)
    ? (p as any).visitDetails.map((e: any) => ({
        visitDate: e?.visitDate || todayDate,
        visitPrice: Number(e?.visitPrice) || 0,
      }))
    : [
        {
          visitDate:
            typeof (p as any).visitDate === "string"
              ? (p as any).visitDate
              : todayDate,
          visitPrice: Number((p as any).visitPrice) || 0,
        },
      ];

  return {
    ...p,
    examDetails: normExam,
    iopPachyCCT: normIop,
    glassesPrescription: normGp,
    vision: normVision,
    visitDetails: normVisits.length ? normVisits : [visitDefault],
  } as PatientFullTypeWithObjectId;
};
