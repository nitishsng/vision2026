'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { AppointmentsTab } from './AppointmentsTab';
import { PatientsTab } from './PatientsTab';
import { OperatorsTab } from './OperatorsTab';
import { ServicesTab } from './ServicesTab';
import { ReportsTab } from './ReportsTab';
import { ScheduleTab } from '../operator/ScheduleTab';
import { OrdersTab } from './OrdersTab';
import { MedicinesTab } from './MedicinesTab';


export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load saved activeTab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'schedule':
        return <ScheduleTab/>;
      case 'appointments':
        return <AppointmentsTab />;
      case 'patients':
        return <PatientsTab />;
      case 'operators':
        return <OperatorsTab />;
      case 'services':
        return <ServicesTab />;
      case 'reports':
        return <ReportsTab />;
      case 'orders':
        return <OrdersTab />;
      case 'medicines':
        return <MedicinesTab />;
      case 'settings':
        return <><div>Comming soon...</div></>;
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
        
        <main className="flex-1 overflow-y-auto p-2 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
