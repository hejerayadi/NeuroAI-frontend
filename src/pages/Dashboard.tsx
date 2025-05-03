
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/MobileNav';
import Dashboard from '@/components/dashboard/Dashboard';

const DashboardPage = () => {
  const navigate = useNavigate();
  
  const handleEndSession = () => {
    // In a real app, we would clean up the session here
    navigate('/reports');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onEndSession={handleEndSession} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b h-16 flex items-center px-4 md:px-6">
          <MobileNav onEndSession={handleEndSession} />
          <h1 className="text-xl font-bold">Mind State Navigator</h1>
        </header>
        
        <main className="flex-1">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
