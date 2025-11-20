import React from "react";
import { PatientFullType } from "@/src/contexts/type";

type Props = {
  open: boolean;
  onClose: () => void;
  data: PatientFullType | null;
};

// Helper to format dates as dd-mm-yyyy
const formatDate = (date?: string | Date | null) => {
  if (!date) return "N/A";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function PatientDetailsModal({ open, onClose, data }: Props) {
  if (!open || !data) return null;

  const sendToWhatsApp = () => {
    const lines: string[] = [];

    // Patient Info
    lines.push(`👤 Patient Details:`);
    lines.push(`Name: ${data.ptName}`);
    lines.push(`Phone: ${data.phoneNo}`);
    lines.push(`Age: ${data.age}`);
    lines.push(`Gender: ${data.gender || "N/A"}`);
    lines.push(`Status: ${data.status}`);
    lines.push(`Purpose: ${data.purpose}`);
    if (data.address) lines.push(`Address: ${data.address}`);
    lines.push("");

    // Visit Info
    if (data.visitDate || data.visitPrice) {
      lines.push(`🏥 Visit Details:`);
      if (data.visitDate) lines.push(`Date: ${formatDate(data.visitDate)}`);
      if (data.visitPrice) lines.push(`Price: ₹${data.visitPrice}`);
      lines.push("");
    }

    // Order Info
    lines.push(`🛍️ Order Details:`);
    lines.push(`Frame: ${data.frameId || "N/A"} - ₹${data.framePrice || 0}`);
    lines.push(`Lens: ${data.lenseType || "N/A"} - ₹${data.lensePrice || 0}`);
    lines.push(`Order Date: ${formatDate(data.orderDate)}`);
    lines.push(`Delivery Date: ${formatDate(data.deliveryDate)}`);
    lines.push("");

    // Glasses Prescription
    lines.push(`👓 Glasses Prescription (Use: ${data.glassesPrescription.use}):`);
    lines.push(
      `Right Eye: SPH ${data.glassesPrescription.rightEye.sph} | CYL ${data.glassesPrescription.rightEye.cyl || "N/A"} | AXIS ${data.glassesPrescription.rightEye.axis || "N/A"} | ADD ${data.glassesPrescription.rightEye.add || "N/A"}`
    );
    lines.push(
      `Left Eye: SPH ${data.glassesPrescription.leftEye.sph} | CYL ${data.glassesPrescription.leftEye.cyl || "N/A"} | AXIS ${data.glassesPrescription.leftEye.axis || "N/A"} | ADD ${data.glassesPrescription.leftEye.add || "N/A"}`
    );
    lines.push("");

    // Medicines
    if (data.medicines?.length) {
      lines.push(`💊 Medicines:`);
      data.medicines.forEach((m) => {
        lines.push(`${formatDate(m.date)} - ${m.medicinename} - ₹${m.price}`);
      });
      lines.push("");
    }

    // Optical Payments
    if (data.opticalPayDetails?.length) {
      lines.push(`💳 Optical Payments:`);
      data.opticalPayDetails.forEach((p) => {
        lines.push(`${formatDate(p.date)} - ₹${p.amount} - Txn: ${p.transectionId}`);
      });
      lines.push("");
    }

    // Payment Summary
    if (data.totalAmount || data.totalAdvance) {
      lines.push(`💰 Payment Details:`);
      if (data.totalAmount) lines.push(`Total Amount: ₹${data.totalAmount}`);
      if (data.totalAdvance) lines.push(`Total Advance Paid: ₹${data.totalAdvance}`);
      const due = (data.totalAmount || 0) - (data.totalAdvance || 0);
      if (due > 0) lines.push(`Amount Due: ₹${due} ⚠️ Please pay the remaining amount.`);
      else lines.push("✅ Payment Complete. Thank you!");
    }

    lines.push("\n🙏 Thank you for choosing us!");

    const message = lines.join("\n");
    const whatsappURL = `https://wa.me/${data.phoneNo}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10 md:pt-16">
      <div className="relative p-6 md:p-8 border w-[95%] md:max-w-3xl lg:max-w-4xl shadow-lg rounded-md bg-white mt-10">

        {/* TITLE */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 mt-2">
          Patient Details (Bill No: {data.billNo})
        </h3>

        {/* RESPONSIVE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">

          {/* PATIENT INFO */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-1 border-b pb-1">Patient Information</h4>
            <p><strong>Name:</strong> {data.ptName}</p>
            <p>
              <strong>Phone:</strong>{" "}
              {data.phoneNo ? (
                <a href={`tel:${data.phoneNo}`} className="text-blue-600 hover:underline">
                  {data.phoneNo}
                </a>
              ) : "N/A"}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {data.email ? (
                <a href={`mailto:${data.email}`} className="text-blue-600 hover:underline">
                  {data.email}
                </a>
              ) : "N/A"}
            </p>
            <p><strong>Age:</strong> {data.age}</p>
            <p><strong>Gender:</strong> {data.gender || "N/A"}</p>
            <p><strong>Status:</strong> {data.status}</p>
            <p><strong>Purpose:</strong> {data.purpose}</p>
            <p><strong>Address:</strong> {data.address || "N/A"}</p>
          </div>

          {/* GLASSES PRESCRIPTION */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-1 border-b pb-1">Glasses Prescription</h4>
            <p><strong>Use:</strong> {data.glassesPrescription.use}</p>

            <h5 className="font-semibold mt-2">Right Eye</h5>
            <p><strong>SPH:</strong> {data.glassesPrescription.rightEye.sph}</p>
            <p><strong>CYL:</strong> {data.glassesPrescription.rightEye.cyl || "N/A"}</p>
            <p><strong>AXIS:</strong> {data.glassesPrescription.rightEye.axis || "N/A"}</p>
            <p><strong>ADD:</strong> {data.glassesPrescription.rightEye.add || "N/A"}</p>

            <h5 className="font-semibold mt-3">Left Eye</h5>
            <p><strong>SPH:</strong> {data.glassesPrescription.leftEye.sph}</p>
            <p><strong>CYL:</strong> {data.glassesPrescription.leftEye.cyl || "N/A"}</p>
            <p><strong>AXIS:</strong> {data.glassesPrescription.leftEye.axis || "N/A"}</p>
            <p><strong>ADD:</strong> {data.glassesPrescription.leftEye.add || "N/A"}</p>
          </div>

          {/* ORDER & VISIT INFO */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mt-3 text-gray-800 border-b pb-1">Order & Visit Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <p><strong>Order Date:</strong> {formatDate(data.orderDate)}</p>
              <p><strong>Delivery Date:</strong> {formatDate(data.deliveryDate)}</p>
            </div>

            <h5 className="font-semibold text-blue-700 mt-3">Visit</h5>
            <p><strong>Visit Date:</strong> {formatDate(data.visitDate)}</p>
            <p><strong>Visit Price:</strong> ₹{data.visitPrice}</p>

            <h5 className="font-semibold text-blue-700 mt-3">Frame</h5>
            <p><strong>ID:</strong> {data.frameId}</p>
            <p><strong>Price:</strong> ₹{data.framePrice}</p>

            <h5 className="font-semibold text-blue-700 mt-3">Lens</h5>
            <p><strong>Type:</strong> {data.lenseType}</p>
            <p><strong>Price:</strong> ₹{data.lensePrice}</p>
          </div>

          {/* MEDICINES */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mt-3 text-gray-800 border-b pb-1">Medicine Details</h4>
            {data.medicines?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {data.medicines.map((m, i) => (
                  <div key={i} className="border rounded p-2">
                    <p><strong>Date:</strong> {formatDate(m.date)}</p>
                    <p><strong>Name:</strong> {m.medicinename}</p>
                    <p><strong>Price:</strong> ₹{m.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2">No medicines added.</p>
            )}
          </div>

          {/* OPTICAL PAYMENTS */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mt-3 text-gray-800 border-b pb-1">Optical Payment Details</h4>
            {data.opticalPayDetails?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {data.opticalPayDetails.map((p, i) => (
                  <div key={i} className="border rounded p-2">
                    <p><strong>Date:</strong> {formatDate(p.date)}</p>
                    <p><strong>Amount:</strong> ₹{p.amount}</p>
                    <p><strong>Transaction ID:</strong> {p.transectionId}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2">No optical payments recorded.</p>
            )}
          </div>

          {/* FINANCIAL SUMMARY */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mt-3">Financial Summary</h4>
            <p><strong>Total Amount:</strong> ₹{data.totalAmount}</p>
            <p><strong>Total Advance:</strong> ₹{data.totalAdvance}</p>
            <p><strong>Total Due:</strong> ₹{data.totalDue}</p>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white font-medium rounded-md shadow-sm hover:bg-gray-600"
          >
            Close
          </button>
          <button
            onClick={sendToWhatsApp}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
