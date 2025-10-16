// 'use client';

// import { useState } from 'react';
// import { Vendor } from '../contexts/type';

// // Enhanced mock vendors data
// const MOCK_VENDORS: Vendor[] = [
//   {
//     id: '1',
//     name: 'Vision Optics Ltd',
//     contactPerson: 'Rajesh Kumar',
//     phone: '+91 9876543220',
//     email: 'rajesh@visionoptics.com',
//     address: 'Industrial Area, Kochi, Kerala',
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: '2',
//     name: 'Premium Lens Co',
//     contactPerson: 'Priya Sharma',
//     phone: '+91 9876543221',
//     email: 'priya@premiumlens.com',
//     address: 'Tech Park, Bangalore, Karnataka',
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: '3',
//     name: 'Crystal Clear Optics',
//     contactPerson: 'Amit Patel',
//     phone: '+91 9876543222',
//     email: 'amit@crystalclear.com',
//     address: 'Commercial Complex, Mumbai, Maharashtra',
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
// ];

// export function useVendors() {
//   const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
//   const [loading, setLoading] = useState(false);

//   const addVendor = (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => {
//     const newVendor: Vendor = {
//       ...vendorData,
//       id: Math.random().toString(36).substr(2, 9),
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };
    
//     setVendors(prev => [newVendor, ...prev]);
//   };

//   const updateVendor = (id: string, updates: Partial<Vendor>) => {
//     setVendors(prev => 
//       prev.map(vendor => 
//         vendor.id === id 
//           ? { ...vendor, ...updates, updatedAt: new Date().toISOString() }
//           : vendor
//       )
//     );
//   };

//   const deleteVendor = (id: string) => {
//     setVendors(prev => prev.filter(vendor => vendor.id !== id));
//   };

//   return {
//     vendors,
//     loading,
//     addVendor,
//     updateVendor,
//     deleteVendor,
//   };
// }