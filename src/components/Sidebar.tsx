'use client';

import React from 'react';
import { 
  Calendar, Users, UserPlus, Settings, BarChart3, 
  Eye, FileText, Clock, Shield, ShoppingCart, Pill, TrendingUp 
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';

interface SidebarProps {
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ onTabChange, isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<string>('');

  React.useEffect(() => {
    try {
      const savedTab = localStorage.getItem('activeTab');
      if (savedTab) {
        setActiveTab(savedTab);
        onTabChange(savedTab);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  React.useEffect(() => {
    try {
      if (activeTab) {
        localStorage.setItem('activeTab', activeTab);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [activeTab]);

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'analysis', label: 'Analysis', icon: TrendingUp },
    // { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'operators', label: 'Operators', icon: UserPlus },
    { id: 'services', label: 'Services', icon: Eye },
    // { id: 'settings', label: 'Settings', icon: Settings },
  ];
  
  const operatorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'analysis', label: 'Analysis', icon: TrendingUp },
    // { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : operatorMenuItems;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Kachakali</h2>
              <p className="text-sm text-gray-500">Vision Care</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${activeTab === item.id 
                      ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-500' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {user?.role === 'admin' && (
          <div className="absolute hidden md:block  md:bottom-4 left-4 right-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-800">Admin Access</span>
              </div>
              <p className="text-xs text-teal-600">Full system management privileges</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
