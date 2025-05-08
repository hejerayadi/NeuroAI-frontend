
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  generateEcgData, 
  generateEegData, 
  getRandomEmotion,
  getRandomBrainWaveText,
  getRandomAssessment,
  getPatientData
} from '@/utils/dummyData';
import { generatePDFReport } from '@/utils/reportGenerator';
import { format } from 'date-fns';

const Reports = () => {
  const navigate = useNavigate();
  const patient = getPatientData();
  
  const downloadReport = () => {
    // Generate dummy report data
    const reportData = {
      patientName: sessionStorage.getItem('patientName') || patient.name,
      patientId: patient.id,
      sessionDate: new Date(),
      ecgData: generateEcgData(30),
      eegData: generateEegData(30),
      emotionalStates: [
        { time: format(new Date(Date.now() - 30 * 60000), 'HH:mm:ss'), emotion: getRandomEmotion('ecg'), source: 'ECG' },
        { time: format(new Date(Date.now() - 25 * 60000), 'HH:mm:ss'), emotion: getRandomEmotion('eeg'), source: 'EEG' },
        { time: format(new Date(Date.now() - 20 * 60000), 'HH:mm:ss'), emotion: getRandomEmotion('facial'), source: 'Facial' },
        { time: format(new Date(Date.now() - 15 * 60000), 'HH:mm:ss'), emotion: getRandomEmotion('speech'), source: 'Speech' },
        { time: format(new Date(Date.now() - 10 * 60000), 'HH:mm:ss'), emotion: getRandomEmotion('ecg'), source: 'ECG' },
        { time: format(new Date(Date.now() - 5 * 60000), 'HH:mm:ss'), emotion: getRandomEmotion('eeg'), source: 'EEG' },
      ],
      brainWaveTexts: [
        { time: format(new Date(Date.now() - 28 * 60000), 'HH:mm:ss'), text: getRandomBrainWaveText(), confidence: 88 },
        { time: format(new Date(Date.now() - 21 * 60000), 'HH:mm:ss'), text: getRandomBrainWaveText(), confidence: 75 },
        { time: format(new Date(Date.now() - 14 * 60000), 'HH:mm:ss'), text: getRandomBrainWaveText(), confidence: 92 },
        { time: format(new Date(Date.now() - 7 * 60000), 'HH:mm:ss'), text: getRandomBrainWaveText(), confidence: 81 },
      ],
      psychAssessment: getRandomAssessment(),
    };
    
    // Generate PDF
    const pdfBlob = generatePDFReport(reportData);
    
    // Create a download link
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MindState_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-mind-softgray">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-mind-darkpurple p-6">
            <h1 className="text-3xl font-bold text-white">Session Report</h1>
            <p className="text-mind-softgray mt-2">Complete session analysis and recommendations</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
                <p className="text-gray-700"><span className="font-medium">Name:</span> {sessionStorage.getItem('patientName') || patient.name}</p>
                <p className="text-gray-700"><span className="font-medium">ID:</span> {patient.id}</p>
                <p className="text-gray-700"><span className="font-medium">Session Time:</span> {patient.sessionTime}</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
                <p className="text-gray-700"><span className="font-medium">Duration:</span> 45 minutes</p>
                <p className="text-gray-700"><span className="font-medium">Type:</span> {sessionStorage.getItem('sessionType') || 'Normal'} Session</p>
                <p className="text-gray-700"><span className="font-medium">Status:</span> Completed</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">What's in the report?</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-mind-purple text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                    1
                  </div>
                  <p className="text-gray-700">Complete ECG and EEG data analysis with timestamps</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-mind-purple text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                    2
                  </div>
                  <p className="text-gray-700">Emotional state patterns and transitions</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-mind-purple text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                    3
                  </div>
                  <p className="text-gray-700">Brain wave speech interpretation logs</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-mind-purple text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                    4
                  </div>
                  <p className="text-gray-700">AI-assisted psychological assessment</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
              <Button 
                className="bg-mind-darkpurple hover:bg-mind-purple"
                onClick={downloadReport}
              >
                Download PDF Report
              </Button>
              
              <Button 
                variant="outline" 
                className="border-mind-darkpurple text-mind-darkpurple hover:bg-mind-softgray"
                onClick={() => navigate('/session-start')}
              >
                Start New Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
