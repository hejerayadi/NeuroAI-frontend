
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/MobileNav';
import Dashboard from '@/components/dashboard/Dashboard';
import { toast } from "@/components/ui/use-toast";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sessionType, setSessionType] = useState<'normal' | 'gaming'>('normal');
  const [patientName, setPatientName] = useState<string>('');
  
  useEffect(() => {
    // Retrieve session data from storage
    const storedPatientName = sessionStorage.getItem('patientName');
    const storedSessionType = sessionStorage.getItem('sessionType') as 'normal' | 'gaming';
    
    if (storedPatientName) {
      setPatientName(storedPatientName);
    }
    
    if (storedSessionType) {
      setSessionType(storedSessionType);
    }
    
    // Clear session storage to avoid data persistence between sessions
    // sessionStorage.clear(); - commented out so you can refresh the page without losing data
  }, []);
  
  const handleEndSession = () => {
    toast({
      title: "Session ended",
      description: "Your session has been successfully ended. You can now access the report.",
    });
    navigate('/reports');
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <div className="fixed top-0 left-0 h-full z-20">
        <Sidebar 
          onEndSession={handleEndSession}
          onSectionChange={handleSectionChange}
          activeSection={activeSection}
        />
      </div>
      
      <div className="flex-1 flex flex-col md:ml-56 lg:ml-64">
        <header className="bg-white border-b h-16 flex items-center px-4 md:px-6 sticky top-0 z-10">
          <MobileNav 
            onEndSession={handleEndSession}
            onSectionChange={handleSectionChange}
            activeSection={activeSection}
          />
          <h1 className="text-xl font-bold">
            Mind State Navigator 
            {sessionType === 'gaming' && <span className="ml-2 text-blue-600">(Gaming Session)</span>}
          </h1>
        </header>
        
        <main className="flex-1">
          <Dashboard 
            activeSection={activeSection} 
            sessionType={sessionType}
            patientName={patientName}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
