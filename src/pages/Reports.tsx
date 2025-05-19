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
    const reportData = {
      patientData: {
        name: "John Doe",
        age: 35,
        gender: "Male",
        lastVisit: new Date().toISOString()
      },
      emotionalStates: [
        {
          timestamp: new Date().toISOString(),
          source: "ECG",
          emotion: "Anxiety",
          confidence: 0.85
        },
        {
          timestamp: new Date().toISOString(),
          source: "EEG",
          emotion: "Stress",
          confidence: 0.78
        }
      ],
      brainWaveTexts: [
        {
          timestamp: new Date().toISOString(),
          text: "Patient expressing concerns about work stress",
          confidence: 0.92
        }
      ],
      psychAssessment: {
        emotionalState: "Moderate anxiety with stress responses",
        recommendations: [
          "Practice stress management techniques",
          "Consider therapy sessions",
          "Maintain regular exercise routine"
        ],
        riskLevel: "medium",
        insights: [
          "Elevated stress levels during work hours",
          "Normal sleep patterns",
          "Positive response to relaxation techniques"
        ]
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
