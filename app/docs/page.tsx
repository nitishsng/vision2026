'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, ShieldCheck, Cog } from 'lucide-react';

export default function DocsPage() {
  const [tab, setTab] = useState<'patient' | 'operator' | 'admin'>('patient');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <h1 className="text-3xl md:text-5xl font-bold">Documentation</h1>
          <p className="mt-3 text-teal-100 max-w-2xl">Role-based instructions for patients, subusers (operators), and administrators.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setTab('patient')} className={`px-4 py-2 rounded-lg font-semibold ${tab==='patient' ? 'bg-white text-teal-700' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              <span className="inline-flex items-center gap-2"><User className="h-4 w-4" /> Patient</span>
            </button>
            <button onClick={() => setTab('operator')} className={`px-4 py-2 rounded-lg font-semibold ${tab==='operator' ? 'bg-white text-teal-700' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Subuser</span>
            </button>
            <button onClick={() => setTab('admin')} className={`px-4 py-2 rounded-lg font-semibold ${tab==='admin' ? 'bg-white text-teal-700' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              <span className="inline-flex items-center gap-2"><Cog className="h-4 w-4" /> Admin</span>
            </button>
          </div>
        </div>
      </div>

     <div className="max-w-6xl mx-auto px-6 mt-10">
        {tab === "patient" && (
          <section className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
            <h2 className="text-3xl font-bold mb-5 text-teal-700">Patient Guide</h2>
            <ul className="space-y-3 text-gray-700 text-lg">
              <li>Open the home page and click <span className="font-semibold">Book Appointment</span>.</li>
              <li>Fill in name, gender, age, phone, address, preferred date and time.</li>
              <li>Choose a purpose such as eye test or consultation.</li>
              <li>Submit the form and wait for staff confirmation.</li>
              <li>Browse optical products on the <Link href="/products" className="text-teal-600 underline">Glasses</Link> page.</li>
              <li>For inquiries, use the contact section on the home page.</li>
            </ul>
          </section>
        )}

        {tab === "operator" && (
          <section className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
            <h2 className="text-3xl font-bold mb-5 text-blue-700">Subuser (Operator)</h2>
            <ul className="space-y-3 text-gray-700 text-lg">
              <li>Login using <Link href="/login" className="text-blue-600 underline">Subuser Login</Link>.</li>
              <li>Manage schedules and appointments in the dashboard.</li>
              <li>Create optical orders and update delivery progress.</li>
              <li>Record payments and send WhatsApp summaries to patients.</li>
              <li>Add medicine entries with price and date (totals update automatically).</li>
              <li>Use search and filters to navigate patient records quickly.</li>
            </ul>
          </section>
        )}

        {tab === "admin" && (
          <section className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
            <h2 className="text-3xl font-bold mb-5 text-purple-700">Admin Guide</h2>
            <ul className="space-y-3 text-gray-700 text-lg">
              <li>Login using an admin account via the <Link href="/login" className="text-purple-600 underline">Admin Login</Link>.</li>
              <li>Manage staff and services in the respective tabs.</li>
              <li>Analyze visits, medicines, optical payments in the analytics section.</li>
              <li>Oversee patient and order records; export patient data if needed.</li>
              <li>Review financial summaries including dues and payments.</li>
              <li>Ensure accurate record‑keeping and delivery status updates.</li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
