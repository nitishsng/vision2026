import React, { useState, useEffect } from "react";
import { Eye, Edit, Search, Plus, Delete } from "lucide-react";
import { PatientFullTypeWithObjectId } from "@/src/contexts/type";
import { useDashboardData } from "@/src/contexts/dataCollection";
import toast from "react-hot-toast";
import NewOrder from "../NewOrderMedicine";
import OpticalPayment from "../OpticalPayment";

export function OrdersTab() {
  const { patients, fetchData } = useDashboardData();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState<PatientFullTypeWithObjectId | null>(
    null
  );
  const [newOrderForm, setNewOrderForm] = useState(false);
  const [OrderSuccess, setorderSuccess] = useState(false);
  useEffect(() => {
    fetchData();
  }, [newOrderForm]);

  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

  const handleViewClick = (order: PatientFullTypeWithObjectId) => {
    setFormData(order);
    setIsPopupOpen(true);
  };

  const handleEditClick = (order: PatientFullTypeWithObjectId) => {
    setFormData({ ...order }); // Create a copy for editing
    setIsEditPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setFormData(null);
  };

  const handleCloseEditPopup = () => {
    setIsEditPopupOpen(false);
    setFormData(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (setFormData) {
      if (name.startsWith("glassesPrescription.")) {
        const [_, eye, field] = name.split(".");
        setFormData((prev) => ({
          ...prev!,
          glassesPrescription: {
            ...prev!.glassesPrescription,
            [eye]: {
              ...(prev!.glassesPrescription[
                eye as "leftEye" | "rightEye"
              ] as Record<string, any>),
              [field]: value,
            },
          },
        }));
      } else if (
        name.includes("total") ||
        name.includes("Price") ||
        name.includes("Advance") ||
        name.includes("Due")
      ) {
        setFormData((prev) => ({ ...prev!, [name]: parseFloat(value) }));
      } else {
        setFormData((prev) => ({ ...prev!, [name]: value }));
      }
    }
  };

  const [saving, setSaving] = useState(false);
  const handleSaveEdit = async () => {
    const id = formData?._id;
    try {
      setSaving(true);
      const updatedFormData = {
        ...formData,
        orderOnly: formData?.orderOnly || true,
        updatedAt: new Date().toISOString(),

        // Optical Price
        opticalaPrice:
          (formData?.framePrice ?? 0) + (formData?.lensePrice ?? 0),
        opticalDue:
          (formData?.framePrice ?? 0) +
          (formData?.lensePrice ?? 0) -
          (formData?.opticalAdvance ?? 0),

        // Total Amount
        totalAmount:
          (formData?.visitPrice ?? 0) +
          (formData?.medicinePrice ?? 0) +
          (formData?.framePrice ?? 0) +
          (formData?.lensePrice ?? 0),

        // Total Advance
        totalAdvance:
          (formData?.visitPrice ?? 0) +
          (formData?.medicinePrice ?? 0) +
          (formData?.opticalAdvance ?? 0),

        // Total Due
        totalDue:
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
      localStorage.setItem("activeTab", "orders");
      toast.success("Saved successfully!");
      fetchData();
      setIsEditPopupOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
      handleCloseEditPopup();
    }
  };

  // Placeholder for orders data - will be fetched from API later
  // const orders: PatientFullTypeWithObjectId[] = patients;

  const formatDateDisplay = (date: Date | string) => {
    const d = new Date(date); // handle string or Date object
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()); // last 2 digits
    return `${year}-${month}-${day}`;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState(""); // ✅ new filter

  const orders = patients.filter((patient) => {
    const matchStatus =
      patient.ptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const filterByDeliveryStatus =
      deliveryStatusFilter === ""
        ? true
        : deliveryStatusFilter === patient.deliveryStatus;

    const matchesDate =
      !dateFilter || formatDateDisplay(patient.orderDate) === dateFilter;
return (
  matchStatus &&
  filterByDeliveryStatus &&
  matchesDate &&
  patient.billNo &&
  (
    (patient.opticalPayDetails?.length > 0) ||
    (patient.opticalAdvance > 0)
  )
);

  });

  const sendToWhatsApp = (formData: PatientFullTypeWithObjectId) => {
    if (!formData.phoneNo) {
      alert("Phone number not available.");
      return;
    }

    const phone = formData.phoneNo.replace(/\D/g, ""); // Clean phone number
    const lines: string[] = [];

    // Greeting
    lines.push(`👋 Hello ${formData.ptName || "Patient"},`);
    lines.push(
      `Here are the details of your order (Bill No: ${formData.billNo}):\n`
    );

    // Delivery Status
    let statusText = "";
    switch (formData.deliveryStatus) {
      case "pending":
        statusText =
          "🕒 Pending – Your order has been received and is waiting to be processed.";
        break;
      case "inProgress":
        statusText = "🔄 In Progress – Your order is currently being prepared.";
        break;
      case "readyToDeliver":
        statusText =
          "✅ Ready to Deliver – Your order is packed and ready for delivery!";
        break;
      case "delivered":
        statusText =
          "📦 Delivered – Your order has been successfully delivered. We hope you enjoy it!";
        break;
      default:
        statusText =
          "❔ Unknown – Please contact us for more details about your order.";
    }
    lines.push(`📌 Status: ${statusText}\n`);

    // Patient Info
    lines.push("🧑 Patient Info:");
    if (formData.ptName) lines.push(`Name: ${formData.ptName}`);
    if (formData.phoneNo) lines.push(`Phone: ${formData.phoneNo}`);
    if (formData.email) lines.push(`Email: ${formData.email}`);
    lines.push("");

    // Glasses Prescription
    const { glassesPrescription } = formData;
    if (glassesPrescription) {
      lines.push("👓 Glasses Prescription:");
      if (glassesPrescription.use)
        lines.push(`Use: ${glassesPrescription.use}`);

      const { rightEye, leftEye } = glassesPrescription;

      if (rightEye) {
        const rightParts = [
          rightEye.sph ? `SPH ${rightEye.sph}` : null,
          rightEye.cyl ? `CYL ${rightEye.cyl}` : null,
          rightEye.axis ? `AXIS ${rightEye.axis}` : null,
          rightEye.add ? `ADD ${rightEye.add}` : null,
          rightEye.prism ? `PRISM ${rightEye.prism}` : null,
          rightEye.V_A ? `V.A ${rightEye.V_A}` : null,
          rightEye.N_V ? `N.V ${rightEye.N_V}` : null,
        ].filter(Boolean);
        if (rightParts.length)
          lines.push(`Right Eye: ${rightParts.join(", ")}`);
      }

      if (leftEye) {
        const leftParts = [
          leftEye.sph ? `SPH ${leftEye.sph}` : null,
          leftEye.cyl ? `CYL ${leftEye.cyl}` : null,
          leftEye.axis ? `AXIS ${leftEye.axis}` : null,
          leftEye.add ? `ADD ${leftEye.add}` : null,
          leftEye.prism ? `PRISM ${leftEye.prism}` : null,
          leftEye.V_A ? `V.A ${leftEye.V_A}` : null,
          leftEye.N_V ? `N.V ${leftEye.N_V}` : null,
        ].filter(Boolean);
        if (leftParts.length) lines.push(`Left Eye: ${leftParts.join(", ")}`);
      }
      lines.push("");
    }

    // Frame & Lens
    if (formData.frameId || formData.framePrice) {
      lines.push("🖼️ Frame Details:");
      if (formData.frameId) lines.push(`ID: ${formData.frameId}`);
      if (formData.framePrice) lines.push(`Price: ₹${formData.framePrice}`);
      lines.push("");
    }

    if (formData.lenseType || formData.lensePrice) {
      lines.push("🔍 Lens Details:");
      if (formData.lenseType) lines.push(`ID: ${formData.lenseType}`);
      if (formData.lensePrice) lines.push(`Price: ₹${formData.lensePrice}`);
      lines.push("");
    }

    // Financials
    if (formData.totalAmount || formData.totalAdvance) {
      lines.push("💰 Payment Details:");
      if (formData.totalAmount)
        lines.push(`Total Amount: ₹${formData.totalAmount}`);
      if (formData.totalAdvance)
        lines.push(`Total Advance Paid: ₹${formData.totalAdvance}`);

      const due = (formData.totalAmount || 0) - (formData.totalAdvance || 0);
      if (due > 0)
        lines.push(`Amount Due: ₹${due} ⚠️ Please pay the remaining amount.`);
      else lines.push("✅ Payment Complete. Thank you!");
    }

    lines.push("\nThank you for choosing us! 🙏");

    const message = lines.join("\n");
    const url = `https://wa.me/+91${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[20px] md:text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600 hidden lg:flex ">
            View and manage all Orders
          </p>
        </div>
        <button
          onClick={() => setNewOrderForm(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 md:px-4 d:py-4 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Order</span>
        </button>
      </div>

      {newOrderForm && (
        <NewOrder
          setNewOrderForm={setNewOrderForm}
          setorderSuccess={setorderSuccess}
          catagory={"order"}
        />
      )}

      <div className="bg-white rounded-lg p-2 md:p-5 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <div>
            <label className="hidden md:block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, phone, bill number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            <div>
              <label className="hidden md:block text-sm font-medium text-gray-700 mb-1">
                Delivery Status
              </label>
              <select
                name="deliveryStatus"
                value={deliveryStatusFilter}
                onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="inProgress">In Progress</option>
                <option value="readyToDeliver">Ready to Deliver</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div>
              <label className="hidden md:block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="hidden md:flex items-end ">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDeliveryStatusFilter("");
                  setDateFilter("");
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Responsive Wrapper */}
        <div className="overflow-x-auto">
          <table className="min-w-[560px] md:min-w-full leading-normal w-full">
            <thead>
              <tr>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bill No
                </th>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pt-Name
                </th>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone No
                </th>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {/* Delivary-Date */}
                  Order-Date
                </th>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Due
                </th>
                <th className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-2 md:px-4 text-gray-500 py-4"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.billNo}
                    className={`transition-colors ${
                      order.totalDue > 0
                        ? "bg-red-50"
                        : "bg-white text-gray-800"
                    } hover:bg-gray-50`}
                  >
<td className="px-2 gap-1 flex items-center md:px-4 py-2 border-b border-gray-200 text-sm font-medium">

  {/* Dot column (vertically centered) */}
  <div className="flex flex-col justify-center items-center">

    {/* REPEATED */}
    {order.repeated && (
      <span className="w-2 h-2 mb-[2px] rounded-full bg-green-600"></span>
    )}

    {/* OPTICAL PRICE */}
    {order.opticalaPrice > 0 && (
      <span className="w-2 h-2 mb-[2px] rounded-full bg-orange-500"></span>
    )}

    {/* MEDICINES */}
    {order.medicines.length > 0 && (
      <span className="w-2 h-2 mb-[2px] rounded-full bg-blue-800"></span>
    )}

    {/* NONE TRUE */}
    {!(
      order.repeated ||
      order.opticalaPrice > 0 ||
      order.medicines.length > 0
    ) && (
      <span className="w-2 h-2 mb-[2px] rounded-full bg-transparent"></span>
    )}

  </div>

  {/* Text */}
  {order.billNo}
</td>


                    <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm">
                      {order.ptName}
                    </td>
                    <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm">
                      {order.phoneNo ? (
                        <a
                          href={`tel:${order.phoneNo}`}
                          className="hover:underline"
                        >
                          {order.phoneNo}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
<td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm font-semibold">
  {order.orderDate
    ? `${String(new Date(order.orderDate).getDate()).padStart(2, "0")}-${String(
        new Date(order.orderDate).getMonth() + 1
      ).padStart(2, "0")}-${new Date(order.orderDate).getFullYear()}`
    : "N/A"}
</td>

                    <td
                      className={`px-2 md:px-4 py-2 border-b border-gray-200 text-sm font-semibold ${
                        order.totalDue > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      ₹{order.totalDue}
                    </td>
                    <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm text-center">
                      <div className="flex justify-center items-center space-x-3">
                        <button
                          onClick={() => handleViewClick(order)}
                          className="text-teal-600 hover:text-teal-900 focus:outline-none"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditClick(order)}
                          className="text-blue-600 hover:text-blue-900 focus:outline-none"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Popup/Modal for Order Details */}
      {isPopupOpen && formData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-8 border w-full max-w-2xl md:max-w-3xl lg:max-w-4xl shadow-lg rounded-md bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Order Details (Bill No: {formData.billNo})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              {/* Patient Info */}
              <div>
                <p>
                  <strong>Patient Name:</strong> {formData.ptName}
                </p>
                <p>
                  <strong>Phone No:</strong>{" "}
                  {formData.phoneNo ? (
                    <a
                      href={`tel:${formData.phoneNo}`}
                      className="text-blue-600 hover:underline"
                    >
                      {formData.phoneNo}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>

                <p>
                  <strong>Email Id:</strong>{" "}
                  {formData.email ? (
                    <a
                      href={`mailto:${formData.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {formData.email}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>

                <p>
                  <strong>Age:</strong> {formData.age || "N/A"}
                </p>
                <p>
                  <strong>Gender:</strong> {formData.gender || "N/A"}
                </p>
              </div>

              {/* Glasses Prescription */}
              <div>
                <h4 className="font-semibold mt-2">Glasses Prescription:</h4>
                <p>
                  <strong>Use:</strong> {formData.glassesPrescription.use}
                </p>

                <p>
                  <strong>Right Eye SPH:</strong>{" "}
                  {formData.glassesPrescription.rightEye.sph}
                </p>
                <p>
                  <strong>Right Eye CYL:</strong>{" "}
                  {formData.glassesPrescription.rightEye.cyl || "N/A"}
                </p>
                <p>
                  <strong>Right Eye AXIS:</strong>{" "}
                  {formData.glassesPrescription.rightEye.axis || "N/A"}
                </p>
                <p>
                  <strong>Right Eye Addition:</strong>{" "}
                  {formData.glassesPrescription.rightEye.add || "N/A"}
                </p>
                <p>
                  <strong>Right Eye Prism:</strong>{" "}
                  {formData.glassesPrescription.rightEye.prism || "N/A"}
                </p>
                <p>
                  <strong>Right Eye V.A:</strong>{" "}
                  {formData.glassesPrescription.rightEye.V_A || "N/A"}
                </p>
                <p>
                  <strong>Right Eye N.V:</strong>{" "}
                  {formData.glassesPrescription.rightEye.N_V || "N/A"}
                </p>

                <p>
                  <strong>Left Eye SPH:</strong>{" "}
                  {formData.glassesPrescription.leftEye.sph}
                </p>
                <p>
                  <strong>Left Eye CYL:</strong>{" "}
                  {formData.glassesPrescription.leftEye.cyl || "N/A"}
                </p>
                <p>
                  <strong>Left Eye AXIS:</strong>{" "}
                  {formData.glassesPrescription.leftEye.axis || "N/A"}
                </p>
                <p>
                  <strong>Left Eye Addition:</strong>{" "}
                  {formData.glassesPrescription.leftEye.add || "N/A"}
                </p>
                <p>
                  <strong>Left Eye Prism:</strong>{" "}
                  {formData.glassesPrescription.leftEye.prism || "N/A"}
                </p>
                <p>
                  <strong>Left Eye V.A:</strong>{" "}
                  {formData.glassesPrescription.leftEye.V_A || "N/A"}
                </p>
                <p>
                  <strong>Left Eye N.V:</strong>{" "}
                  {formData.glassesPrescription.leftEye.N_V || "N/A"}
                </p>
              </div>

              {/* Order Details */}
              <div>
                <h4 className="font-semibold mt-3 text-gray-800 border-b pb-1">
                  Order Information
                </h4>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-700">
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {formData.orderDate
                      ? new Date(formData.orderDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          }
                        )
                      : "N/A"}
                  </p>

                  <p>
                    <strong>Delivery Date:</strong>{" "}
                    {formData.deliveryDate
                      ? new Date(formData.deliveryDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>

                {/* Frame Details */}
                <div className="mt-3">
                  <h5 className="font-semibold text-blue-700">
                    Frame Details:
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
                    <p>
                      <strong>Frame ID:</strong> {formData.frameId || "N/A"}
                    </p>
                    <p>
                      <strong>Frame Price:</strong> ₹{formData.framePrice || 0}
                    </p>
                  </div>
                </div>

                {/* Lens Details */}
                <div className="mt-3">
                  <h5 className="font-semibold text-blue-700">Lens Details:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
                    <p>
                      <strong>Lens ID:</strong> {formData.lenseType || "N/A"}
                    </p>
                    <p>
                      <strong>Lens Price:</strong> ₹{formData.lensePrice || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div>
                <h4 className="font-semibold mt-2">Financial Summary:</h4>
                <p>
                  <strong>Total Amount:</strong> ₹{formData.totalAmount}
                </p>
                <p>
                  <strong>Total Advance:</strong> ₹{formData.totalAdvance}
                </p>
                <p>
                  <strong>Total Due:</strong> ₹
                  {formData.totalAmount - formData.totalAdvance}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 bg-teal-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Close
              </button>
              <button
                onClick={() => sendToWhatsApp(formData)}
                className="ml-2 pformDatax-4 px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Popup/Modal for Order Details */}
      {isEditPopupOpen && formData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-2 md:p-4 border w-full max-w-2xl md:max-w-3xl lg:max-w-4xl shadow-lg rounded-xl bg-white overflow-y-auto max-h-[95vh]">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Edit Order (Bill No: {formData.billNo})
            </h3>

            <div className="space-y-2">
              {/* 🛒 Order Information */}
              <section className="space-y-2">
                <h3 className="flex justify-between border-b pb-2 items-center">
                  <span className="text-lg md:text-xl font-semibold text-gray-700">
                    Order Information
                  </span>
                  <select
                    name="deliveryStatus"
                    value={formData.deliveryStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryStatus: e.target.value,
                      })
                    }
                    className="text-sm px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="inProgress">In Progress</option>
                    <option value="readyToDeliver">Ready to Deliver</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="font-medium mb-1 block text-sm md:text-base">
                      Order Date
                    </label>
                    <input
                      type="date"
                      name="orderDate"
                      value={formData.orderDate.split("T")[0]}
                      onChange={handleInputChange}
                      className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="font-medium mb-1 block text-sm md:text-base">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate?.split("T")[0] || ""}
                      onChange={handleInputChange}
                      className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="font-medium mb-1 block text-sm md:text-base">
                      Frame ID
                    </label>
                    <input
                      type="text"
                      name="frameId"
                      value={formData.frameId}
                      onChange={handleInputChange}
                      className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="font-medium mb-1 block text-sm md:text-base">
                      Frame Price
                    </label>
                    <input
                      type="number"
                      name="framePrice"
                      value={formData.framePrice || 0}
                      onChange={handleInputChange}
                      className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="font-medium mb-1 block text-sm md:text-base">
                      Lens Type
                    </label>
                    <input
                      type="text"
                      list="lensTypeOptions"
                      name="lenseType"
                      value={formData.lenseType || ""}
                      onChange={handleInputChange}
                      placeholder="Select or enter lens type"
                      className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                    />
                    <datalist id="lensTypeOptions">
                      <option value="Progressive" />
                      <option value="Single Vision" />
                      <option value="Bifocal" />
                      <option value="Trifocal" />
                      <option value="Reading" />
                    </datalist>
                  </div>

                  <div>
                    <label className="font-medium mb-1 block text-sm md:text-base">
                      Lens Price
                    </label>
                    <input
                      type="number"
                      name="lensePrice"
                      value={formData.lensePrice || 0}
                      onChange={handleInputChange}
                      className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="font-medium mb-1 block text-sm md:text-base">
                      Optical Price
                    </label>
                    <input
                      type="number"
                      name="opticalaPrice"
                      value={formData.lensePrice + formData.framePrice || 0}
                      readOnly
                      className="border p-2 md:p-3 rounded w-full bg-gray-100 cursor-not-allowed text-sm md:text-base"
                    />
                  </div>
                </div>

                {/* Payment Details */}

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
              </section>

              {/* 💰 Grand Totals Section */}
              <div className="bg-white shadow-md rounded-2xl p-3 md:p-4 border border-gray-100">
                <div className="grid grid-cols-3 gap-1 md:gap-6">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1 text-sm md:text-base">
                      T-Amount
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={
                        (formData.visitPrice || 0) +
                        (formData.framePrice || 0) +
                        (formData.lensePrice || 0) +
                        (formData.medicinePrice || 0)
                      }
                      className="border p-2 md:p-3 rounded-lg bg-gray-100 cursor-not-allowed text-sm md:text-base"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1 text-sm md:text-base">
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
                      className="border p-2 md:p-3 rounded-lg bg-gray-100 cursor-not-allowed text-sm md:text-base"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1 text-sm md:text-base">
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
                      className="border p-2 md:p-3 rounded-lg bg-gray-100 cursor-not-allowed text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end mt-8 space-x-4">
              <button
                onClick={handleCloseEditPopup}
                className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <span className="spin"></span>
                    <span>saveing...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
