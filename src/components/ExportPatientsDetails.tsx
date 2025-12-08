import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useDashboardData } from "../contexts/dataCollection";
import { Download } from "lucide-react";

function flattenObject(obj: any, parentKey = "", result: any = {}): any {
  for (let key in obj) {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], newKey, result);
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}

function filterFields(obj: any, fields: string[]): Record<string, any> {
  const filtered: Record<string, any> = {};
  for (let field of fields) {
    if (obj.hasOwnProperty(field)) filtered[field] = obj[field];
  }
  return filtered;
}

const ExportPatientsDetails: React.FC = () => {
  const { patients } = useDashboardData();

  const fieldsToExport = [
    "ptName",
    "age",
    "email",
    "phoneNo",
    "gender",
    "repeated",
    "billNo",
    "visitTotal",
    "frameId",
    "framePrice",
    "lenseType",
    "lensePrice",
    "deliveryDate",
    
    "glassesPrescription.rightEye.sph",
    "glassesPrescription.rightEye.add",
    "glassesPrescription.leftEye.sph",
    "glassesPrescription.leftEye.add",
    "glassesPrescription.use",
  ];

  const exportExcel = () => {
    if (!patients || patients.length === 0) {
      alert("No patient data found!");
      return;
    }

    // Flatten and filter each patient
    const processedData = patients.map((patient: any) => {
      const normalized = { ...patient };
      normalized.visitTotal = Array.isArray(normalized.visitDetails)
        ? normalized.visitDetails.reduce((sum: number, v: any) => sum + (Number(v.visitPrice) || 0), 0)
        : 0;
      if (Array.isArray(normalized.glassesPrescription)) {
        normalized.glassesPrescription = normalized.glassesPrescription[0] || {};
      }
      const flat = flattenObject(normalized);
      return filterFields(flat, fieldsToExport);
    });

    // Convert to Excel
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Patient_Details.xlsx");
  };

  return (
    <button
      onClick={exportExcel}
      className="bg-green-600 text-white px-2 md:px-4 py-1 rounded-lg hover:bg-green-700"
    >
        <span className="flex items-center">
         <Download className="h-4 w-4 mr-1" />
      Export 
        </span>
    </button>
  );
};

export default ExportPatientsDetails;
