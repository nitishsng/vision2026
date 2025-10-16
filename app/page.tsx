'use client';

import React, { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { FPatientPortal as PatientPortal } from '@/src/components/PatientPortal';
import { AdminDashboard } from '@/src/components/admin/AdminDashboard';
import { OperatorDashboard } from '@/src/components/operator/OperatorDashboard';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function Home() {
  const { user, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter(); 


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );

  }

  // If user is logged in, show appropriate dashboard
  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard />;
    } else if (user.role === 'operator') {
      return <OperatorDashboard />;
    }
  }

  // Show login form if requested
  if (showLogin) {
    router.push('/loginpage'); // Redirect to the unified login page
    return null; // Or a loading spinner, as the redirect will handle the view
  }

  // Default: show patient portal (landing page)
  return <PatientPortal onGoToAdmin={() => setShowLogin(true)} />;
}