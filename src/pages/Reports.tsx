
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, FileText } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { generatePdfReport } from '@/utils/reportGenerator';

const Reports = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadReport = () => {
    setIsGenerating(true);
    
    // Simulate processing time then generate the PDF
    setTimeout(() => {
      try {
        generatePdfReport();
        toast({
          title: "Report downloaded",
          description: "Your session report has been successfully generated and downloaded.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Download failed",
          description: "There was a problem generating your report. Please try again.",
        });
        console.error("PDF generation error:", error);
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={handleBackToHome}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to Home
        </Button>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <FileText className="text-mind-purple mr-3" size={24} />
            <h1 className="text-2xl font-bold">Session Report</h1>
          </div>
          
          <p className="text-gray-600 mb-6">
            Your session has ended. You can download a complete PDF report of this session for your records.
          </p>
          
          <div className="bg-mind-softgray p-4 rounded-md mb-6">
            <h2 className="font-medium mb-2">Session Summary</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Session Duration:</span>
                <span className="font-medium">45 minutes</span>
              </li>
              <li className="flex justify-between">
                <span>Patient ID:</span>
                <span className="font-medium">PT-12345</span>
              </li>
              <li className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </li>
              <li className="flex justify-between">
                <span>Primary Assessment:</span>
                <span className="font-medium text-amber-600">Mild Anxiety Disorder</span>
              </li>
            </ul>
          </div>
          
          <Button 
            onClick={handleDownloadReport}
            disabled={isGenerating}
            className="bg-mind-purple hover:bg-mind-purple/90 text-white w-full"
          >
            {isGenerating ? 'Generating Report...' : (
              <>
                <Download className="mr-2" size={16} />
                Download PDF Report
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="font-bold mb-4">What's in the report?</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="bg-mind-lightblue rounded-full w-5 h-5 flex items-center justify-center text-mind-purple mr-2 flex-shrink-0">1</span>
                <span>Complete ECG and EEG data analysis with timestamps</span>
              </li>
              <li className="flex items-start">
                <span className="bg-mind-lightblue rounded-full w-5 h-5 flex items-center justify-center text-mind-purple mr-2 flex-shrink-0">2</span>
                <span>Emotional state patterns and transitions</span>
              </li>
              <li className="flex items-start">
                <span className="bg-mind-lightblue rounded-full w-5 h-5 flex items-center justify-center text-mind-purple mr-2 flex-shrink-0">3</span>
                <span>Brain wave speech interpretation logs</span>
              </li>
              <li className="flex items-start">
                <span className="bg-mind-lightblue rounded-full w-5 h-5 flex items-center justify-center text-mind-purple mr-2 flex-shrink-0">4</span>
                <span>AI-assisted psychological assessment</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="font-bold mb-4">Next Steps</h2>
            <p className="text-sm text-gray-600 mb-4">
              Based on the session results, consider scheduling a follow-up session within the next two weeks.
            </p>
            <Button variant="outline" className="w-full">
              Schedule Next Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
