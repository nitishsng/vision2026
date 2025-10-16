// 'use client';

// import { useState } from 'react';
// import { Order } from '../contexts/type';


// Mock orders data with the example you provided
// const MOCK_ORDERS: Order[] = [
//   {
//     id: '1',
//     orderDate: '2024-12-17',
//     ptName: 'Golikanta Singha',
//     age: 60,
//     gender: 'male',
//     phone: '+91 9876543210',
//     billNo: '914',
//     rPower: '-2.25',
//     lPower: '-2.5',
//     advance: 100,
//     due: 250,
//     vendor: 'Vision Optics Ltd',
//     rate: 350,
//     frame: 'Premium Frame',
//     lens: 'Anti-glare',
//     total: 350,
//     less: 0,
//     adv: 100,
//     dueAmount: 250,
//     rcv: 0,
//     deliveryDate: '',
//     opticalTotal: 0,
//     status: 'processing',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: '2',
//     orderDate: '2024-12-16',
//     ptName: 'Priya Nair',
//     age: 45,
//     gender: 'female',
//     phone: '+91 9876543211',
//     billNo: '913',
//     rPower: '-1.75',
//     lPower: '-1.5',
//     advance: 200,
//     due: 150,
//     vendor: 'Premium Lens Co',
//     rate: 350,
//     frame: 'Designer Frame',
//     lens: 'Progressive',
//     total: 350,
//     less: 0,
//     adv: 200,
//     dueAmount: 150,
//     rcv: 0,
//     deliveryDate: '2024-12-20',
//     opticalTotal: 350,
//     status: 'processing',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
// ];

// export function useOrders() {
//   const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
//   const [loading, setLoading] = useState(false);

//   const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
//     const newOrder: Order = {
//       ...orderData,
//       id: Math.random().toString(36).substr(2, 9),
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };
    
//     setOrders(prev => [newOrder, ...prev]);
//   };

//   const updateOrder = (id: string, updates: Partial<Order>) => {
//     setOrders(prev => 
//       prev.map(order => 
//         order.id === id 
//           ? { ...order, ...updates, updatedAt: new Date().toISOString() }
//           : order
//       )
//     );
//   };

//   const deleteOrder = (id: string) => {
//     setOrders(prev => prev.filter(order => order.id !== id));
//   };

//   return {
//     orders,
//     loading,
//     addOrder,
//     updateOrder,
//     deleteOrder,
//   };
// }