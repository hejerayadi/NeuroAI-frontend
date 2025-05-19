import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/MobileNav';
import Dashboard from '@/components/dashboard/Dashboard';
import { toast } from "@/components/ui/use-toast";
import { groqService } from '@/utils/groqService';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sessionType, setSessionType] = useState<'normal' | 'gaming'>('normal');
  const [patientName, setPatientName] = useState<string>('');
  const [sessionStartTime] = useState(new Date());
  const [isEndingSession, setIsEndingSession] = useState(false);
  
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
  }, []);
  
  const handleEndSession = async () => {
    setIsEndingSession(true);
    try {
      // Get all historical data from localStorage
      const assessmentHistory = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
      const eegHistory = JSON.parse(localStorage.getItem('eegHistory') || '[]');
      const ecgHistory = JSON.parse(localStorage.getItem('ecgHistory') || '[]');
      const speechHistory = JSON.parse(localStorage.getItem('speechHistory') || '[]');
      const brainWaveHistory = JSON.parse(localStorage.getItem('brainWaveHistory') || '[]');
      const facialEmotionHistory = JSON.parse(localStorage.getItem('facialEmotionHistory') || '[]');

      // Calculate session duration
      const sessionEndTime = new Date();
      const duration = sessionEndTime.getTime() - sessionStartTime.getTime();
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((duration % (1000 * 60)) / 1000);
      const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      // Generate final report using Groq
      const reportData = {
        patientName,
        sessionType,
        sessionDuration: formattedDuration,
        assessmentHistory,
        eegHistory,
        ecgHistory,
        speechHistory,
        brainWaveHistory,
        facialEmotionHistory
      };

      // Store report data and session duration
      localStorage.setItem('sessionReport', JSON.stringify(reportData));
      localStorage.setItem('sessionDuration', formattedDuration);

      // Generate the report using Groq
      const report = await groqService.generateSessionReport(reportData);

      // Store the generated report
      localStorage.setItem('generatedReport', report);

      toast({
        title: "Session ended",
        description: "Your session has been successfully ended. You can now access the report.",
      });

      // Navigate to reports page
      navigate('/reports');
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEndingSession(false);
    }
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
          endSessionLoading={isEndingSession}
        />
      </div>
      
      <div className="flex-1 flex flex-col md:ml-56 lg:ml-64">
        <header className="bg-white border-b h-16 flex items-center px-4 md:px-6 sticky top-0 z-10">
          <MobileNav 
            onEndSession={handleEndSession}
            onSectionChange={handleSectionChange}
            activeSection={activeSection}
            endSessionLoading={isEndingSession}
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
            sessionStartTime={sessionStartTime}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
