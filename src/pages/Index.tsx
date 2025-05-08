
import React, { useState } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/MobileNav';

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };
  
  const handleEndSession = () => {
    // This is just a placeholder for the Index page
    console.log("Session ended");
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Sidebar 
        onEndSession={handleEndSession}
        onSectionChange={handleSectionChange}
        activeSection={activeSection}
      />
      
      <div className="flex-1 flex flex-col md:ml-56 lg:ml-64">
        <header className="bg-white border-b h-16 flex items-center px-4 md:px-6 sticky top-0 z-10">
          <MobileNav 
            onEndSession={handleEndSession}
            onSectionChange={handleSectionChange}
            activeSection={activeSection}
          />
          <h1 className="text-xl font-bold">Mind State Navigator</h1>
        </header>
        
        <main className="flex-1">
          <Dashboard activeSection={activeSection} />
        </main>
      </div>
    </div>
  );
};

export default Index;
