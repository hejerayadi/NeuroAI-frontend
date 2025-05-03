
import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/MobileNav';

const Index = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b h-16 flex items-center px-4 md:px-6">
          <MobileNav />
          <h1 className="text-xl font-bold">Mind State Navigator</h1>
        </header>
        
        <main className="flex-1">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default Index;
