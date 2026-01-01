import React, { useState, useEffect } from "react";
import { Eye, Edit, Search, Plus, Delete } from "lucide-react";
import { PatientFullTypeWithObjectId ,todayDate } from "@/src/contexts/type";
import { useDashboardData } from "@/src/contexts/dataCollection";
import { DateInput } from "../ui/DateInput";
import toast from "react-hot-toast";
import NewOrder from "../NewOrderMedicine";
import OpticalPayment from "../editPageComponents/OpticalPayment";
import useEligibility from "../elegibleForfeatures";
import GlassesPrescription from "../editPageComponents/GlassesPrescription";
export function OrdersTab() {
  const eligibleForFeatures = useEligibility();

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

  const { patients, fetchData, isLoading } = useDashboardData();
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

  const handleDeleteClick = async (order: PatientFullTypeWithObjectId) => {
    try {
      if (!order?._id) {
        toast.error("Missing order ID");
        return;
      }
      const confirmed = window.confirm("Delete this order record?");
      if (!confirmed) return;

      const res = await fetch(`/api/patient?id=${order._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete");
        return;
      }
      localStorage.setItem("activeTab", "orders");
      toast.success("Deleted successfully");
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete");
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setFormData(null);
  };

  const handleCloseEditPopup = () => {
    setIsEditPopupOpen(false);
    setFormData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev!, [name]: value }));
  };

  const [saving, setSaving] = useState(false);
  const handleSaveEdit = async () => {
    const id = formData?._id;
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
      patient.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      ((patient.opticalPayDetails?.length || 0) > 0 ||
        (patient.framePrice || 0) + (patient.lensePrice || 0) > 0)
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
    lines.push(`Hello ${formData.ptName || "Patient"},`);
    lines.push(
      `Here are the details of your order (Bill No: ${formData.billNo}):\n`
    );

    // Delivery Status
    let statusText = "";
    switch (formData.deliveryStatus) {
      case "pending":
        statusText =
          "Pending – Your order has been received and is waiting to be processed.";
        break;
      case "inProgress":
        statusText = "In Progress – Your order is currently being prepared.";
        break;
      case "readyToDeliver":
        statusText =
          "Ready to Deliver – Your order is packed and ready for delivery!";
        break;
      case "delivered":
        statusText =
          "Delivered – Your order has been successfully delivered. We hope you enjoy it!";
        break;
      default:
        statusText =
          "❔ Unknown – Please contact us for more details about your order.";
    }
    lines.push(`Status: ${statusText}\n`);

    // Patient Info
    lines.push("Patient Info:");
    if (formData.ptName) lines.push(`Name: ${formData.ptName}`);
    if (formData.phoneNo) lines.push(`Phone: ${formData.phoneNo}`);
    if (formData.email) lines.push(`Email: ${formData.email}`);
    lines.push("");

    // Glasses Prescription
    const gp = Array.isArray(formData.glassesPrescription)
      ? formData.glassesPrescription[0]
      : undefined;
    if (gp) {
      lines.push("👓 Glasses Prescription:");
      if (gp.use) lines.push(`Use: ${gp.use}`);

      const { rightEye, leftEye } = gp;

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
      lines.push("Frame Details:");
      if (formData.frameId) lines.push(`ID: ${formData.frameId}`);
      if (formData.framePrice) lines.push(`Price: ₹${formData.framePrice}`);
      lines.push("");
    }

    if (formData.lenseType || formData.lensePrice) {
      lines.push("Lens Details:");
      if (formData.lenseType) lines.push(`ID: ${formData.lenseType}`);
      if (formData.lensePrice) lines.push(`Price: ₹${formData.lensePrice}`);
      lines.push("");
    }

    // Financials (derived)
    const visitSum = Array.isArray(formData.visitDetails)
      ? formData.visitDetails.reduce(
          (sum, v) => sum + (Number(v.visitPrice) || 0),
          0
        )
      : 0;
    const totalAmount =
      visitSum +
      (Number(formData.framePrice) || 0) +
      (Number(formData.lensePrice) || 0) +
      (Array.isArray(formData.medicines)
        ? formData.medicines.reduce((sum, m) => sum + (Number(m.price) || 0), 0)
        : 0);
    const advance =
      (Array.isArray(formData.opticalPayDetails)
        ? formData.opticalPayDetails.reduce(
            (sum, d) => sum + (Number(d.amount) || 0),
            0
          )
        : 0) +
      visitSum +
      (Array.isArray(formData.medicines)
        ? formData.medicines.reduce((sum, m) => sum + (Number(m.price) || 0), 0)
        : 0);
    const due =
      (Number(formData.framePrice) || 0) +
      (Number(formData.lensePrice) || 0) -
      (Array.isArray(formData.opticalPayDetails)
        ? formData.opticalPayDetails.reduce(
            (sum, d) => sum + (Number(d.amount) || 0),
            0
          )
        : 0);
    lines.push("Payment Details:");
    lines.push(`Total Amount: ₹${totalAmount}`);
    lines.push(`Total Advance Paid: ₹${advance}`);
    if (due > 0)
      lines.push(`Amount Due: ₹${due} Please pay the remaining amount.`);
    else lines.push("Payment Complete. Thank you!");

    lines.push("\nThank you for choosing us! ");

    const message = lines.join("\n");
    const url = `https://wa.me/+91${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="p-2">
          <div className="flex mb-2 justify-between items-center">
            <div>
              <h1 className="text-[20px] md:text-2xl font-bold text-gray-900">
                Orders Management
              </h1>
              <p className="text-gray-600 hidden lg:flex ">
                View and manage all Orders
              </p>
            </div>

            {eligibleForFeatures(3) && (
              <div className="relative inline-block">
                <button
                  onClick={() => setNewOrderForm(true)}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1 md:px-4 md:py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <span>+ Order</span>
                </button>
              </div>
            )}
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
                  <div className="flex bg-white rounded-lg shadow-sm border items-center gap-2 w-full md:w-auto">
                    <DateInput
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full md:w-40 border-none focus:ring-0 text-sm md:text-base"
                    />
                  </div>
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
            <div className="overflow-x-auto">
              <table className="min-w-[560px] md:min-w-full leading-normal w-full">
                <thead>
                  <tr>
                    <th
                      className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 
                         text-left text-xs font-semibold text-gray-600 uppercase tracking-wider 
                         whitespace-nowrap"
                    >
                      Bill No
                    </th>

                    <th
                      className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 
                         text-left text-xs font-semibold text-gray-600 uppercase tracking-wider 
                         whitespace-nowrap"
                    >
                      Pt-Name
                    </th>

                    <th
                      className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 
                         text-left text-xs font-semibold text-gray-600 uppercase tracking-wider 
                         whitespace-nowrap"
                    >
                      Phone No
                    </th>

                    <th
                      className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 
                         text-left text-xs font-semibold text-gray-600 uppercase tracking-wider 
                         whitespace-nowrap"
                    >
                      Order-Date
                    </th>

                    <th
                      className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 
                         text-left text-xs font-semibold text-gray-600 uppercase tracking-wider 
                         whitespace-nowrap"
                    >
                      Due
                    </th>

                    <th
                      className="px-2 md:px-4 py-2 border-b-2 border-gray-200 bg-gray-100 
                         text-center text-xs font-semibold text-gray-600 uppercase tracking-wider 
                         whitespace-nowrap"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center px-2 md:px-4 text-gray-500 py-4 whitespace-nowrap"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, index) => (
                      <tr
                        key={index}
                        className={`transition-colors ${
                          (order.framePrice || 0) +
                            (order.lensePrice || 0) -
                            (order.opticalPayDetails || []).reduce(
                              (sum, d) => sum + (Number(d.amount) || 0),
                              0
                            ) >
                          0
                            ? "bg-red-50"
                            : "bg-white text-gray-800"
                        } hover:bg-gray-50`}
                      >
                        {/* Bill No */}
                        <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm whitespace-nowrap">
                          <div className="flex gap-1">
                            <div className="flex flex-col justify-center items-center">
                              {order.repeated && (
                                <span className="w-1.5 h-1.5 mb-[2px] rounded-full bg-green-600" />
                              )}
                              {(order?.framePrice || 0) +
                                (order?.lensePrice || 0) >
                                0 && (
                                <span className="w-1.5 h-1.5 mb-[2px] rounded-full bg-orange-500" />
                              )}
                              {order.medicines.length > 0 && (
                                <span className="w-1.5 h-1.5 mb-[2px] rounded-full bg-blue-800" />
                              )}
                              {!(
                                order.repeated ||
                                (order?.framePrice || 0) +
                                  (order?.lensePrice || 0) >
                                  0 ||
                                order.medicines.length > 0
                              ) && (
                                <span className="w-1.5 h-1.5 mb-[2px] rounded-full bg-transparent" />
                              )}
                            </div>
                            {order.billNo}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm whitespace-nowrap">
                          {order.ptName}
                        </td>

                        {/* Phone */}
                        <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm whitespace-nowrap">
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

                        {/* Date → full DD-MM-YYYY */}
                        <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm font-semibold whitespace-nowrap">
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleDateString(
                                "en-GB"
                              ) // DD/MM/YYYY
                            : "N/A"}
                        </td>

                        {/* Due */}
                        <td
                          className={`px-2 md:px-4 py-2 border-b border-gray-200 text-sm font-semibold whitespace-nowrap ${
                            (order.framePrice || 0) +
                              (order.lensePrice || 0) -
                              (order.opticalPayDetails || []).reduce(
                                (sum, d) => sum + (Number(d.amount) || 0),
                                0
                              ) >
                            0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          ₹
                          {(order.framePrice || 0) +
                            (order.lensePrice || 0) -
                            (order.opticalPayDetails || []).reduce(
                              (sum, d) => sum + (Number(d.amount) || 0),
                              0
                            )}
                        </td>

                        {/* Actions */}
                        <td className="px-2 md:px-4 py-2 border-b border-gray-200 text-sm text-center whitespace-nowrap">
                          <div className="flex justify-center items-center space-x-3">
                            <button
                              onClick={() => handleViewClick(order)}
                              className="text-teal-600 hover:text-teal-900"
                            >
                              <Eye className="h-5 w-5" />
                            </button>

                            <div className="flex items-center space-x-2">
                              {/* Edit Button */}
                              {eligibleForFeatures(3) && (
                                <button
                                  onClick={() => handleEditClick(order)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                              )}

                              {/* Delete Button */}
                              {eligibleForFeatures(4) && (
                                <button
                                  onClick={() => handleDeleteClick(order)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Delete className="h-5 w-5" />
                                </button>
                              )}
                            </div>
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
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10 md:pt-16">
              <div className="relative p-6 md:p-8 border w-[95%] md:max-w-3xl lg:max-w-4xl shadow-lg rounded-md bg-white mt-4">
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

                  <div>
                    <h4 className="font-semibold mt-2 text-gray-800 border-b pb-1">
                      Diagnosis
                    </h4>
                    <div className="mt-2 text-sm text-gray-700">
                      {formData.diagnosis && formData.diagnosis.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {formData.diagnosis.map((diag, index) => {
                             const date = typeof diag === 'string' ? 'N/A' : diag.date;
                             const value = typeof diag === 'string' ? diag : diag.value;
                             return (
                              <li key={index}>
                                <span className="font-medium text-gray-900">{date}:</span> {value}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No diagnosis recorded.</p>
                      )}
                    </div>
                  </div>

                  {/* Glasses Prescription */}
                  <div>
                    <h4 className="font-semibold mt-2">
                      Glasses Prescription:
                    </h4>
                    <p>
                      <strong>Use:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.use) ||
                        "N/A"}
                    </p>

                    <p>
                      <strong>Right Eye SPH:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.rightEye.sph) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Right Eye CYL:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.rightEye.cyl) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Right Eye AXIS:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.rightEye.axis) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Right Eye Addition:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.rightEye.add) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Right Eye Prism:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.rightEye.prism) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Right Eye V.A:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.rightEye.V_A) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Right Eye N.V:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.rightEye.N_V) ||
                        "N/A"}
                    </p>

                    <p>
                      <strong>Left Eye SPH:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.leftEye.sph) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Left Eye CYL:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.leftEye.cyl) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Left Eye AXIS:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.leftEye.axis) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Left Eye Addition:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.leftEye.add) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Left Eye Prism:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.leftEye.prism) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Left Eye V.A:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.leftEye.V_A) ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Left Eye N.V:</strong>{" "}
                      {(Array.isArray(formData.glassesPrescription) &&
                        formData.glassesPrescription[0]?.leftEye.N_V) ||
                        "N/A"}
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
                          <strong>Frame Price:</strong> ₹
                          {formData.framePrice || 0}
                        </p>
                      </div>
                    </div>

                    {/* Lens Details */}
                    <div className="mt-3">
                      <h5 className="font-semibold text-blue-700">
                        Lens Details:
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
                        <p>
                          <strong>Lens ID:</strong>{" "}
                          {formData.lenseType || "N/A"}
                        </p>
                        <p>
                          <strong>Lens Price:</strong> ₹
                          {formData.lensePrice || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financials */}
                  <div>
                    <h4 className="font-semibold mt-2">Financial Summary:</h4>
                    <p>
                      <strong>Total Amount:</strong> ₹
                      {(Array.isArray(formData.visitDetails)
                        ? formData.visitDetails.reduce(
                            (sum, v) => sum + (Number(v.visitPrice) || 0),
                            0
                          )
                        : 0) +
                        (Number(formData.framePrice) || 0) +
                        (Number(formData.lensePrice) || 0) +
                        (Array.isArray(formData.medicines)
                          ? formData.medicines.reduce(
                              (sum, m) => sum + (Number(m.price) || 0),
                              0
                            )
                          : 0)}
                    </p>
                    <p>
                      <strong>Total Advance:</strong> ₹
                      {(Array.isArray(formData.opticalPayDetails)
                        ? formData.opticalPayDetails.reduce(
                            (sum, d) => sum + (Number(d.amount) || 0),
                            0
                          )
                        : 0) +
                        (Array.isArray(formData.visitDetails)
                          ? formData.visitDetails.reduce(
                              (sum, v) => sum + (Number(v.visitPrice) || 0),
                              0
                            )
                          : 0) +
                        (Array.isArray(formData.medicines)
                          ? formData.medicines.reduce(
                              (sum, m) => sum + (Number(m.price) || 0),
                              0
                            )
                          : 0)}
                    </p>
                    <p>
                      <strong>Total Due:</strong> ₹
                      {(Number(formData.framePrice) || 0) +
                        (Number(formData.lensePrice) || 0) -
                        (Array.isArray(formData.opticalPayDetails)
                          ? formData.opticalPayDetails.reduce(
                              (sum, d) => sum + (Number(d.amount) || 0),
                              0
                            )
                          : 0)}
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
                <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                  <div>{formData.ptName}</div>
                  <div>{formData.billNo}</div>
                </h3>
                {eligibleForFeatures(4) && (
                  <section className="space-y-2">
                    {/*  Customer Details */}
                    <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
                      Customer Details
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {/* Name */}
                      <div>
                        <label className="font-medium block text-sm md:text-base mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="ptName"
                          value={formData.ptName}
                          onChange={handleInputChange}
                          required
                          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="font-medium block text-sm md:text-base mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNo"
                          value={formData.phoneNo}
                          onChange={handleInputChange}
                          required
                          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="font-medium block text-sm md:text-base mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                        />
                      </div>

                      {/* Bill No */}
                      <div>
                        <label className="font-medium block text-sm md:text-base mb-1">
                          Bill No
                        </label>
                        <input
                          type="text"
                          name="billNo"
                          value={formData.billNo || ""}
                          onChange={handleInputChange}
                          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                        />
                      </div>

                      {/* Email */}
                      <div className="col-span-2">
                        <label className="font-medium block text-sm md:text-base mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                        />
                      </div>
                    </div>
                  </section>
                )}            
                <div className="space-y-2">
                  {/* Order Information */} 
                             <section className="space-y-2">
                    <h3 className="flex justify-between border-b pb-2 items-center">
                      <span className="text-lg md:text-xl font-semibold text-gray-700">
                        Order Information
                      </span>
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      <div>
                        <label className="font-medium block text-sm md:text-base">
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
                        <label className="font-medium block text-sm md:text-base">
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
                        <label className="font-medium block text-sm md:text-base">
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
                        <label className="font-medium  block text-sm md:text-base">
                          Frame Price
                        </label>
                        <input
                          type="number"
                          name="framePrice"
                          disabled={!eligibleForFeatures(4)}
                          value={formData.framePrice || 0}
                          onChange={handleInputChange}
                          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                        />
                      </div>

                      <div>
                        <label className="font-medium block text-sm md:text-base">
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
                        <label className="font-medium block text-sm md:text-base">
                          Lens Price
                        </label>
                        <input
                          type="number"
                          name="lensePrice"
                          disabled={!eligibleForFeatures(4)}
                          value={formData.lensePrice || 0}
                          onChange={handleInputChange}
                          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                        />
                      </div>

                      <div>
                        <label className="font-medium block text-sm md:text-base">
                          Optical Price
                        </label>
                        <input
                          type="number"
                          value={
                            (formData?.framePrice || 0) +
                              (formData?.lensePrice || 0) || 0
                          }
                          readOnly
                          className="border p-2 md:p-3 rounded w-full bg-gray-100 cursor-not-allowed text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="font-medium block text-sm md:text-base">
                          Status
                        </label>
                        <select
                          name="deliveryStatus"
                          value={formData.deliveryStatus}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              deliveryStatus: e.target.value,
                            })
                          }
                          className="border p-2 md:p-3 rounded w-full focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                        >
                          <option value="pending">Pending</option>
                          <option value="inProgress">In Progress</option>
                          <option value="readyToDeliver">
                            Ready to Deliver
                          </option>
                          {/* Show Delivered only if due is 0 */}
                          {((formData.framePrice || 0) +
                            (formData.lensePrice || 0) -
                            (formData.opticalPayDetails || []).reduce(
                              (sum, d) => sum + (Number(d.amount) || 0),
                              0
                            )) <= 0 && (
                            <option value="delivered">Delivered</option>
                          )}
                        </select>
                      </div>
                    </div>


                                  {formData && (
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

                  {/* Grand Totals Section */}
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
                            (formData.opticalPayDetails || []).reduce(
                              (sum, d) => sum + (Number(d.amount) || 0),
                              0
                            )
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
      )}
    </div>
  );
}
