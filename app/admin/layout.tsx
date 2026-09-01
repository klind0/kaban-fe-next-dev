'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // or your auth store

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.replace('/dashboard'); // Kick out non-admin users
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return <div className="p-8 text-center">Checking admin authorization...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Kaban Admin Console</h1>
        <span>{user.email}</span>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}