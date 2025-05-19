import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const navigate = useNavigate();
  const [sessionDuration, setSessionDuration] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    // Load session data
    const duration = localStorage.getItem('sessionDuration');
    const sessionReport = localStorage.getItem('sessionReport');

    if (duration) setSessionDuration(duration);
    if (sessionReport) setReportData(JSON.parse(sessionReport));
  }, []);

  const downloadPDF = () => {
    if (!reportData) {
      toast({
        title: "Error",
        description: "No report data available to download.",
        variant: "destructive"
      });
      return;
    }

    const doc = new jsPDF();
    
    // Add header with styling
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80); // Dark blue color
    doc.text('Therapy Session Report', 20, 20);
    
    // Add session information with styling
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94); // Slightly lighter blue
    doc.text('Session Information', 20, 35);
    
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text(`Patient Name: ${reportData.patientName}`, 20, 45);
    doc.text(`Session Type: ${reportData.sessionType}`, 20, 55);
    doc.text(`Session Duration: ${sessionDuration}`, 20, 65);
    
    // Add assessment history
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Assessment History', 20, 85);
    
    if (reportData.assessmentHistory && reportData.assessmentHistory.length > 0) {
      let yPos = 95;
      reportData.assessmentHistory.forEach((assessment: any, index: number) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80);
        doc.text(`Assessment ${index + 1} - ${new Date(assessment.timestamp).toLocaleString()}`, 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.text(`Emotional State: ${assessment.assessment.emotionalState}`, 25, yPos);
        yPos += 7;
        doc.text(`Risk Level: ${assessment.assessment.riskLevel}`, 25, yPos);
        yPos += 7;
        
        doc.text('Recommendations:', 25, yPos);
        yPos += 7;
        assessment.assessment.recommendations.forEach((rec: string) => {
          doc.text(`• ${rec}`, 30, yPos);
          yPos += 7;
        });
        
        doc.text('Insights:', 25, yPos);
        yPos += 7;
        assessment.assessment.insights.forEach((insight: string) => {
          doc.text(`• ${insight}`, 30, yPos);
          yPos += 7;
        });
        
        yPos += 10;
      });
    }
    
    // Add data summaries
    doc.addPage();
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Data Summaries', 20, 20);
    
    // EEG History
    if (reportData.eegHistory && reportData.eegHistory.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80);
      doc.text('EEG History:', 20, 35);
      
      const eegData = reportData.eegHistory.map((entry: any) => [
        entry.time,
        entry.emotion,
        entry.type || 'neutral'
      ]);
      
      (doc as any).autoTable({
        startY: 40,
        head: [['Time', 'Emotion', 'Type']],
        body: eegData,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] }
      });
    }
    
    // Add timestamp
    const now = new Date();
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${now.toLocaleString()}`, 20, 280);
    
    // Save the PDF
    doc.save(`therapy-session-report-${reportData.patientName}-${now.toISOString().split('T')[0]}.pdf`);
  };

  const startNewSession = () => {
    // Clear all session data
    localStorage.removeItem('sessionDuration');
    localStorage.removeItem('sessionReport');
    localStorage.removeItem('generatedReport');
    localStorage.removeItem('assessmentHistory');
    localStorage.removeItem('eegEmotionHistory');
    localStorage.removeItem('ecgHistory');
    localStorage.removeItem('speechEmotionHistory');
    localStorage.removeItem('brainWaveHistory');
    localStorage.removeItem('facialEmotionHistory');
    
    // Navigate to session start
    navigate('/doctor');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg shadow-lg p-6 bg-Sidebar-foreground">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left: Patient Info */}
          <div className="bg-mind-softgray border-x-4 border-mind-darkpurple shadow-md p-6 rounded-lg flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {reportData?.patientName || 'N/A'}</p>
                <p><span className="font-medium">ID:</span> PT-23051</p>{/* You may want to make this dynamic if you have patient ID */}
                <p><span className="font-medium">Session Time:</span> {sessionDuration || 'N/A'}</p>
              </div>
            </div>
          </div>
          {/* Right: Session Summary */}
          <div className="bg-mind-softgray border-x-4 border-mind-darkpurple shadow-md p-6 rounded-lg flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-4">Session Summary</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Duration:</span> {sessionDuration ? sessionDuration + ' minutes' : 'N/A'}</p>
                <p><span className="font-medium">Type:</span> {reportData?.sessionType ? reportData.sessionType + ' Session' : 'N/A'}</p>
                <p><span className="font-medium">Status:</span> Completed</p>
              </div>
            </div>
          </div>
        </div>
        {/* Center: What's in the report? */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">What's in the report?</h2>
          <ol className="space-y-3 ml-2">
            <li className="flex items-center">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-mind-darkpurple text-white font-bold mr-3">1</span>
              <span>Complete ECG and EEG data analysis with timestamps</span>
            </li>
            <li className="flex items-center">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-mind-darkpurple text-white font-bold mr-3">2</span>
              <span>Emotional state patterns and transitions</span>
            </li>
            <li className="flex items-center">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-mind-darkpurple text-white font-bold mr-3">3</span>
              <span>Brain wave speech interpretation logs</span>
            </li>
            <li className="flex items-center">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-mind-darkpurple text-white font-bold mr-3">4</span>
              <span>AI-assisted psychological assessment</span>
            </li>
          </ol>
        </div>
        {/* Bottom: Buttons */}
        <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4 mt-8">
          <Button
            onClick={downloadPDF}
            className="bg-mind-darkpurple hover:bg-mind-purple px-8 py-3"
            disabled={!reportData}
          >
            Download PDF Report
          </Button>
          <Button
            onClick={startNewSession}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-8 py-3"
          >
            Start New Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
