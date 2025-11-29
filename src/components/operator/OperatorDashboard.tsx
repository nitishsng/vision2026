"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../Header";
import { Sidebar } from "../Sidebar";
import { DashboardOverview } from "../admin/DashboardOverview";
import { AppointmentsTab } from "../admin/AppointmentsTab";
import { PatientsTab } from "../admin/PatientsTab";
import { ScheduleTab } from "./ScheduleTab";
import { ReportsTab } from "../admin/ReportsTab";
import { OrdersTab } from "../admin/OrdersTab";
import { MedicinesTab } from "../admin/MedicinesTab";
export function OperatorDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load saved activeTab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "appointments":
        return <AppointmentsTab />;
      case "patients":
        return <PatientsTab />;
      case "schedule":
        return <ScheduleTab />;
      case "reports":
        return <ReportsTab />;
      case "orders":
        return <OrdersTab />;
      case "medicines":
        return <MedicinesTab />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
