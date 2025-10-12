"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDashboardData } from "@/src/contexts/dataCollection";
import { PatientFullTypeWithObjectId } from "@/src/contexts/type";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-white shadow rounded-lg">
      {/* Header */}
      <h2 className="text-3xl font-bold text-gray-800">
        Edit Patient{" "}
        <span className="text-sm text-gray-500">{formData.ptName}</span>
      </h2>

      {(basicDetails || isLargeScreen) && (
        <div className="">
          {/* Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              name="ptName"
              value={formData.ptName}
              onChange={handleChange}
              placeholder="Patient Name"
              className="border p-3 rounded focus:ring-2 focus:ring-blue-400 w-full"
            />
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              className="border p-3 rounded focus:ring-2 focus:ring-blue-400 w-full"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="border p-3 rounded focus:ring-2 focus:ring-blue-400 w-full"
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
              className="border p-3 rounded focus:ring-2 focus:ring-blue-400 w-full"
            />
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="Email"
              className="border p-3 rounded focus:ring-2 focus:ring-blue-400 w-full"
            />

            <select
              name="purpose"
              required
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="border p-3 rounded focus:ring-2 focus:ring-blue-400 w-full"
            />
            <select
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              className="border p-3 rounded focus:ring-2 focus:ring-blue-400 w-full"
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
              className="border p-3 rounded focus:ring-2 focus:ring-blue-400 w-full"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="compleated">Completed</option>
              <option value="canciled">Canciled</option>
            </select>
          </div>
          {/* Notes & Complaints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Note</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Present Complaints</label>
              <textarea
                name="presentComplaints"
                value={formData.presentComplaints}
                onChange={handleChange}
                rows={3}
                className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
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
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Vision Details
          </h3>

          {/* Scrollable wrapper */}
          <div className="w-full overflow-x-auto">
            <div className="inline-block min-w-[500px] md:min-w-full align-middle">
              <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Parameter
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Right
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
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
                      distanceOptions: [
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
                      rightKey: "unaidedNear",
                      leftKey: "unaidedNear",
                      nearOptions: ["N5", "N6", "N8", "N10", "N12"],
                    },
                    {
                      label: "Best Corrected Distance",
                      rightKey: "bestCorrectedDistance",
                      leftKey: "bestCorrectedDistance",
                      distanceOptions: [
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
                      rightKey: "bestCorrectedNear",
                      leftKey: "bestCorrectedNear",
                      nearOptions: ["N5", "N6", "N8", "N10", "N12"],
                    },
                  ].map(
                    ({
                      label,
                      rightKey,
                      leftKey,
                      distanceOptions,
                      nearOptions,
                    }) => {
                      const options = distanceOptions || nearOptions || [];
                      return (
                        <tr key={label}>
                          <td className="px-2 md:px-4 py-2 font-medium text-gray-700 whitespace-nowrap">
                            {label}
                          </td>

                          {/* Right Eye */}
                          <td className="px-2 md:px-4 py-2">
                            <input
                              type="text"
                              list={`${rightKey}Options`}
                              name={`vision.rightEye.${rightKey}`}
                              value={
                                (formData.vision?.rightEye as any)?.[
                                  rightKey
                                ] || ""
                              }
                              onChange={(e) =>
                                handleNestedChange(
                                  `vision.rightEye.${rightKey}`,
                                  e.target.value
                                )
                              }
                              placeholder="Enter value"
                              className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                            />
                            <datalist id={`${rightKey}Options`}>
                              {options.map((opt) => (
                                <option key={opt} value={opt} />
                              ))}
                            </datalist>
                          </td>

                          {/* Left Eye */}
                          <td className="px-2 md:px-4 py-2">
                            <input
                              type="text"
                              list={`${leftKey}Options`}
                              name={`vision.leftEye.${leftKey}`}
                              value={
                                (formData.vision?.leftEye as any)?.[leftKey] ||
                                ""
                              }
                              onChange={(e) =>
                                handleNestedChange(
                                  `vision.leftEye.${leftKey}`,
                                  e.target.value
                                )
                              }
                              placeholder="Enter value"
                              className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                            />
                          </td>
                        </tr>
                      );
                    }
                  )}
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
        <div className="space-y-2 md:space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Exam Details</h3>

          {/* Scrollable wrapper */}
          <div className="w-full overflow-x-auto">
            <div className="inline-block min-w-[400px] md:min-w-full align-middle">
              <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 md:px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Parameter
                    </th>
                    <th className="px-2 md:px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Right
                    </th>
                    <th className="px-2 md:px-4 py-2 text-left text-sm font-medium text-gray-600">
                      Left
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {[
                    {
                      label: "Adnexa",
                      name: "adnexa",
                      options: ["Normal", "Swelling", "Discharge", "Redness"],
                    },
                    {
                      label: "Conjunctiva",
                      name: "conjunctiva",
                      options: ["Normal", "Congested", "Pale", "Injected"],
                    },
                    {
                      label: "Cornea",
                      name: "cornea",
                      options: ["Clear", "Opacity", "Edema"],
                    },
                    {
                      label: "Anterior Chamber",
                      name: "anteriorChamber",
                      options: ["Normal", "Shallow", "Deep", "Cells/Flare"],
                    },
                    {
                      label: "Iris",
                      name: "iris",
                      options: ["Normal", "Atrophy", "Neovascularization"],
                    },
                    {
                      label: "Lens",
                      name: "lens",
                      options: ["Clear", "Cataract", "Pseudophakia"],
                    },
                    {
                      label: "Fundus",
                      name: "fundus",
                      options: [
                        "Normal",
                        "Diabetic Retinopathy",
                        "Hypertensive Retinopathy",
                        "Macular Degeneration",
                      ],
                    },
                    {
                      label: "Orbit",
                      name: "orbit",
                      options: ["Normal", "Mass", "Fracture", "Inflammation"],
                    },
                    {
                      label: "Syringing",
                      name: "syringing",
                      options: ["Patent", "Blocked", "Partial Block"],
                    },
                    {
                      label: "Vitreous",
                      name: "vitreous",
                      options: ["Clear", "Floaters", "Hemorrhage"],
                    },
                  ].map(({ label, name, options }) => (
                    <tr key={name}>
                      <td className="px-2 md:px-4 py-2 font-medium text-gray-700 whitespace-nowrap">
                        {label}
                      </td>

                      {/* Right Eye */}
                      <td className="px-2 md:px-4 py-2">
                        <input
                          type="text"
                          list={`${name}Options`}
                          name={`examDetails.${name}.right`}
                          value={
                            (formData.examDetails as any)?.[name]?.right || ""
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              `examDetails.${name}.right`,
                              e.target.value
                            )
                          }
                          placeholder="Enter value"
                          className="border p-2 rounded md:w-full w-[160px] focus:ring-2 focus:ring-blue-400"
                        />
                        <datalist id={`${name}Options`}>
                          {options.map((opt) => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      </td>

                      {/* Left Eye */}
                      <td className="px-2 md:px-4 py-2">
                        <input
                          type="text"
                          list={`${name}Options`}
                          name={`examDetails.${name}.left`}
                          value={
                            (formData.examDetails as any)?.[name]?.left || ""
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              `examDetails.${name}.left`,
                              e.target.value
                            )
                          }
                          placeholder="Enter value"
                          className="border p-2 rounded md:w-full w-[160px] focus:ring-2 focus:ring-blue-400"
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
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Glasses Prescription
          </h3>

          {/* Use */}
          <div className="flex flex-col max-w-sm">
            <label className="font-medium mb-1">Use</label>
            <input
              type="text"
              list="useOptions"
              name="glassesPrescription.use"
              value={formData.glassesPrescription?.use || ""}
              onChange={(e) =>
                handleNestedChange("glassesPrescription.use", e.target.value)
              }
              placeholder="Select or enter use"
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
            />
            <datalist id="useOptions">
              <option value="Distance" />
              <option value="Near" />
              <option value="Bifocal" />
              <option value="Progressive" />
            </datalist>
          </div>

          {/* Table Layout */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-1 md:px-4 py-2 text-left">Para</th>
                  <th className="border px-1 md:px-4 py-2 text-center">
                    Right Eye
                  </th>
                  <th className="border px-1 md:px-4 py-2 text-center">
                    Left Eye
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "SPH", key: "sph" },
                  { label: "CYL", key: "cyl" },
                  { label: "Axis", key: "axis" },
                  { label: "add", key: "add" },
                  { label: "Prism", key: "prism" },
                  { label: "V_A", key: "V_A" },
                  { label: "N_V", key: "N_V" },
                ].map(({ label, key }) => (
                  <tr key={key} className="odd:bg-white even:bg-gray-50">
                    <td className="border px-4 py-2 font-medium">{label}</td>

                    {/* Right Eye */}
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        list={`${key}Options`}
                        name={`glassesPrescription.rightEye.${key}`}
                        value={
                          (formData.glassesPrescription?.rightEye as any)?.[
                            key
                          ] || ""
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            `glassesPrescription.rightEye.${key}`,
                            e.target.value
                          )
                        }
                        placeholder={`R-${label}`}
                        className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                      />
                    </td>

                    {/* Left Eye */}
                    <td className="border px-2 md:px-4 py-2">
                      <input
                        type="text"
                        list={`${key}Options`}
                        name={`glassesPrescription.leftEye.${key}`}
                        value={
                          (formData.glassesPrescription?.leftEye as any)?.[
                            key
                          ] ?? ""
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            `glassesPrescription.leftEye.${key}`,
                            e.target.value
                          )
                        }
                        placeholder={`L-${label}`}
                        className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
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
            <option value="+0.50" />
            <option value="+0.75" />
            <option value="+1.00" />
            <option value="+1.25" />
            <option value="+1.50" />
            <option value="+1.75" />
            <option value="+2.00" />
            <option value="+2.25" />
            <option value="+2.50" />
            <option value="+2.75" />
            <option value="+3.00" />
          </datalist>

          <datalist id="cylOptions">
            <option value="0.00" />
            <option value="-0.25" />
            <option value="-0.50" />
            <option value="-0.75" />
            <option value="-1.00" />
            <option value="-2.00" />
          </datalist>

          <datalist id="axisOptions">
            {Array.from({ length: 180 }, (_, i) => (
              <option key={i + 1} value={i + 1} />
            ))}
          </datalist>

          <datalist id="prismOptions">
            <option value="1Δ" />
            <option value="2Δ" />
            <option value="3Δ" />
            <option value="4Δ" />
          </datalist>

          <datalist id="vaOptions">
            {/* Standard Snellen */}
            <option value="6/6" />
            <option value="6/7.5" />
            <option value="6/9" />
            <option value="6/12" />
            <option value="6/15" />
            <option value="6/18" />
            <option value="6/24" />
            <option value="6/30" />
            <option value="6/36" />
            <option value="6/45" />
            <option value="6/60" />

            {/* Low vision */}
            <option value="5/60" />
            <option value="4/60" />
            <option value="3/60" />
            <option value="2/60" />

            {/* Special notations */}
            <option value="CFC" />
            <option value="HM" />
            <option value="PL+" />
            <option value="PL-" />
            <option value="PLPr+" />

            {/* Optional: Add more if needed */}
            <option value="NLP" />
            <option value="LP" />
          </datalist>

          <datalist id="nvOptions">
            <option value="N3" />
            <option value="N4" />
            <option value="N5" />
            <option value="N6" />
            <option value="N8" />
            <option value="N10" />
            <option value="N12" />
            <option value="N14" />
            <option value="N16" />
            <option value="N18" />
            <option value="N20" />
            <option value="N24" />
            <option value="N36" />
            <option value="N48" />
            <option value="N60" />
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
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-700">IOP Pachy CCT</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 md:px-4 py-2 text-left">Para</th>
                  <th className="border px-2 md:px-4 py-2 text-center">
                    Right
                  </th>
                  <th className="border px-2 md:px-4 py-2 text-center">Left</th>
                </tr>
              </thead>

              <tbody>
                {[
                  { label: "IOP (mmHg)", key: "iop" },
                  { label: "Corrected IOP (mmHg)", key: "correctedIop" },
                  { label: "CCT (µm)", key: "cct" },
                ].map(({ label, key }) => (
                  <tr key={key} className="odd:bg-white even:bg-gray-50">
                    <td className="border px-2 md:px-4 py-2 font-medium">
                      {label}
                    </td>

                    {/* Right Eye */}
                    <td className="border px-2 md:px-4 py-2">
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
                        placeholder={`R-${label}`}
                        className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                      />
                    </td>

                    {/* Left Eye */}
                    <td className="border px-2 md:px-4 py-2">
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
                        placeholder={`L-${label}`}
                        className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Common Datalists */}
          <datalist id="iopOptions">
            <option value="10" />
            <option value="12" />
            <option value="14" />
            <option value="16" />
            <option value="18" />
            <option value="20" />
            <option value="22" />
            <option value="24" />
            <option value="26" />
            <option value="28" />
          </datalist>

          <datalist id="cctOptions">
            <option value="480" />
            <option value="500" />
            <option value="520" />
            <option value="540" />
            <option value="560" />
            <option value="580" />
            <option value="600" />
            <option value="620" />
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
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Diagnosis</h3>
          {(formData.diagnosis || []).map((diagnosisItem, index) => (
            <div key={index} className="flex flex-col gap-2">
              <input
                type="text"
                value={diagnosisItem || ""}
                onChange={(e) => {
                  const newDiagnosis = [...(formData.diagnosis || [])];
                  newDiagnosis[index] = e.target.value;
                  handleNestedChange("diagnosis", newDiagnosis);
                }}
                placeholder={`Diagnosis ${index + 1}`}
                className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              handleNestedChange("diagnosis", [
                ...(formData.diagnosis || []),
                "",
              ])
            }
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Add Diagnosis
          </button>
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
        <div>
          {/* Billing & Dates */}
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1 flex flex-col">
              <label className="font-medium mb-1">Bill No</label>
              <input
                type="text"
                name="billNo"
                value={formData.billNo}
                onChange={handleChange}
                placeholder="Enter Bill No"
                className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium mb-5">Delivery Status</label> <br />
              <select
                name="deliveryStatus"
                value={formData.deliveryStatus}
                onChange={handleChange}
                className="border py-4 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="inProgress">In Progress</option>
                <option value="readyToDeliver">Ready to Deliver</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="font-medium mb-1">Order Date</label>
              <input
                type="date"
                name="orderDate"
                value={formData.orderDate}
                onChange={handleChange}
                className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="font-medium mb-1">Delivery Date</label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Prescription */}
          {/* <div className="flex flex-col">
            <label className="font-semibold mb-1">Prescription</label>
            <input
              type="text"
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
            />
          </div> */}

          {/* Doctor Remarks */}
          {/* <div className="flex flex-col">
            <label className="font-semibold mb-1">Doctor Remarks</label>
            <textarea
              name="doctorRemarks"
              value={formData.doctorRemarks}
              onChange={handleChange}
              rows={4}
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
            />
          </div> */}
          {/* 👓 Optical / Frame & Lens Payment */}
          <div>
            {/* <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Optical Order
          </h3> */}

            {/* Frame & Lens */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="font-medium mb-1">Frame ID</label>
                <input
                  type="text"
                  name="frameId"
                  value={formData.frameId || ""}
                  placeholder="Frame Id"
                  onChange={handleChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Frame Price</label>
                <input
                  type="number"
                  name="framePrice"
                  value={formData.framePrice}
                  onChange={handleChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Lens Type</label>
                <select
                  name="lenseType" // ✅ must match formData key
                  value={formData.lenseType || ""}
                  onChange={handleChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" disabled>
                    Select Lens Type
                  </option>
                  <option value="progressive">Progressive</option>
                  <option value="single-vision">Single Vision</option>
                  <option value="bifocal">Bifocal</option>
                  <option value="trifocal">Trifocal</option>
                  <option value="reading">Reading</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Lens Price</label>
                <input
                  type="number"
                  name="lensePrice"
                  value={formData.lensePrice}
                  onChange={handleChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Optical Payment */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div className="flex flex-col">
                <label className="font-medium mb-1">Optical Advance</label>
                <input
                  type="number"
                  name="opticalAdvance"
                  value={formData.opticalAdvance}
                  onChange={handleChange}
                  className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Optical Due</label>
                <input
                  type="number"
                  readOnly
                  value={
                    (formData.framePrice || 0) +
                    (formData.lensePrice || 0) -
                    (formData.opticalAdvance || 0)
                  }
                  className="border p-3 rounded w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col col-span-2 md:col-span-1">
                <label className="font-medium mb-1">Optical Total</label>
                <input
                  type="number"
                  readOnly
                  value={
                    (formData.framePrice || 0) + (formData.lensePrice || 0)
                  }
                  className="border p-3 rounded w-full bg-gray-100 cursor-not-allowed"
                />
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
      <div className="space-y-2 md:space-x-4">
        {/* 🧾 Visit Payment */}

        {/* <h3 className="text-lg font-semibold text-gray-700 my-2">
          <hr />
          Payment
        </h3> */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col col-span-2 md:col-span-1">
            <label className="font-medium mb-1">Visit Price</label>
            <input
              type="number"
              name="visitPrice"
              value={formData.visitPrice}
              onChange={handleChange}
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {/* </div> */}
          {/* 💊 Medicine Payment */}

          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Medicine Name</label>
            <input
              type="text"
              name="medicineName"
              value={formData.medicineName || ""}
              onChange={handleChange}
              placeholder="Enter Medicine Name"
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Medicine Price</label>
            <input
              type="number"
              name="medicinePrice"
              value={formData.medicinePrice}
              onChange={handleChange}
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-400"
            />
          </div>

        </div>

        {/* 💰 Grand Totals */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Grand Totals
          </h3>
          <div className="grid grid-cols-3  gap-4">
            <div className="flex flex-col">
              <label className="font-medium mb-1">T-Amount</label>
              <input
                type="number"
                readOnly
                value={
                  (formData.visitPrice || 0) +
                  (formData.framePrice || 0) +
                  (formData.lensePrice || 0) +
                  (formData.medicinePrice || 0)
                }
                className="border p-3 rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-medium mb-1">T-Advance</label>
              <input
                type="number"
                readOnly
                value={
                  (formData.opticalAdvance || 0) +
                  (formData.medicinePrice || 0) +
                  (formData.visitPrice || 0)
                }
                className="border p-3 rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex  flex-col">
              <label className="font-medium mb-1">Total Due</label>
              <input
                type="number"
                readOnly
                value={
                  (formData.framePrice || 0) +
                  (formData.lensePrice || 0) -
                  (formData.opticalAdvance || 0) 
                 }
                className="border p-3 rounded w-full bg-gray-100 cursor-not-allowed"
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
