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
import { AnalysisTab } from "../admin/AnalysisTab";
import { useAuth } from "@/src/contexts/AuthContext";
import useEligibility from "../elegibleForfeatures";
export function OperatorDashboard() {
  const { user } = useAuth();
   const eligibleForFeatures = useEligibility();
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
        return (eligibleForFeatures(4)) ? <DashboardOverview />: "You are not eligible to see this";
      case "appointments":
        return <AppointmentsTab />;
      case "patients":
        return <PatientsTab />;
      case "schedule":
        return <ScheduleTab />;
      case "reports":
        return  (eligibleForFeatures(4)) ? <ReportsTab />: "You are not eligible to see this";
      case "orders":
        return <OrdersTab />;
      case "medicines":
        return <MedicinesTab />;
      case 'analysis':
        return  (eligibleForFeatures(4)) ? <AnalysisTab />: "You are not eligible to see this";
      default:
        return <AppointmentsTab />;
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

        <main className="flex-1 overflow-y-auto p-1">{renderContent()}</main>
      </div>
    </div>
  );
}
