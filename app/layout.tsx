import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kachakali Vision Care - Eye Center Management',
  description: 'Professional eye care management system for Kachakali Vision Care',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body >
        <AuthProvider>
            <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}