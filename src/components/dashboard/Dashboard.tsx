
import React, { useState, useEffect } from 'react';
import DashboardHeader from '../layout/DashboardHeader';
import PatientCard from '../layout/PatientCard';
import SimpleLineChart from '../charts/LineChart';
import EmotionTag from '../visualizations/EmotionTag';
import BrainWaveText from '../visualizations/BrainWaveText';
import PsychAssessment from '../visualizations/PsychAssessment';
import { 
  generateEcgData, 
  generateEegData, 
  getRandomEmotion, 
  getRandomBrainWaveText,
  getRandomAssessment,
  mapEmotionToType,
  getPatientData
} from '@/utils/dummyData';

const Dashboard = () => {
  // State for our dummy data
  const [ecgData, setEcgData] = useState(generateEcgData(50));
  const [eegData, setEegData] = useState(generateEegData(50));
  const [ecgEmotion, setEcgEmotion] = useState(getRandomEmotion('ecg'));
  const [eegEmotion, setEegEmotion] = useState(getRandomEmotion('eeg'));
  const [facialEmotion, setFacialEmotion] = useState(getRandomEmotion('facial'));
  const [speechEmotion, setSpeechEmotion] = useState(getRandomEmotion('speech'));
  const [brainWaveText, setBrainWaveText] = useState(getRandomBrainWaveText());
  const [assessment, setAssessment] = useState(getRandomAssessment());
  const [isProcessing, setIsProcessing] = useState(false);
  const [textConfidence, setTextConfidence] = useState(85);
  const patient = getPatientData();

  // Simulate real-time data updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Update ECG data with new values
      setEcgData(prevData => {
        const newPoint = {
          time: `${parseInt(prevData[prevData.length - 1].time) + 1}s`, 
          value: prevData[prevData.length - 1].value + (Math.random() * 4 - 2)
        };
        return [...prevData.slice(1), newPoint];
      });
      
      // Update EEG data with new values
      setEegData(prevData => {
        const newPoint = {
          time: `${parseInt(prevData[prevData.length - 1].time) + 10}ms`, 
          value: Math.sin(parseInt(prevData[prevData.length - 1].time) * 0.1) * 5 + (Math.random() * 2 - 1)
        };
        return [...prevData.slice(1), newPoint];
      });
    }, 1000);

    // Emotion updates at a slower rate
    const emotionInterval = setInterval(() => {
      if (Math.random() > 0.7) setEcgEmotion(getRandomEmotion('ecg'));
      if (Math.random() > 0.7) setEegEmotion(getRandomEmotion('eeg'));
      if (Math.random() > 0.7) setFacialEmotion(getRandomEmotion('facial'));
      if (Math.random() > 0.7) setSpeechEmotion(getRandomEmotion('speech'));
    }, 5000);

    // Simulate brain wave text processing
    const textInterval = setInterval(() => {
      setIsProcessing(true);
      setTimeout(() => {
        setBrainWaveText(getRandomBrainWaveText());
        setTextConfidence(Math.round(60 + Math.random() * 35));
        setIsProcessing(false);
      }, 2000);
    }, 10000);

    // Simulate assessment updates
    const assessmentInterval = setInterval(() => {
      setAssessment(getRandomAssessment());
    }, 15000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(emotionInterval);
      clearInterval(textInterval);
      clearInterval(assessmentInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader 
          patientName={patient.name} 
          patientId={patient.id} 
          sessionTime={patient.sessionTime} 
          patientStatus={patient.status}
          patientImageUrl={patient.imageUrl}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ECG Chart */}
          <PatientCard 
            title="ECG Heart Monitor" 
            description="Real-time heartbeat analysis"
            className="lg:col-span-2"
          >
            <div className="h-64">
              <SimpleLineChart 
                data={ecgData} 
                dataKey="value" 
                color="#ef4444" 
                height={230}
              />
            </div>
          </PatientCard>

          {/* EEG Chart */}
          <PatientCard 
            title="EEG Brain Activity" 
            description="Real-time brain wave patterns"
            className="lg:col-span-1"
          >
            <div className="h-64">
              <SimpleLineChart 
                data={eegData} 
                dataKey="value" 
                color="#9b87f5" 
                height={230}
              />
            </div>
          </PatientCard>

          {/* Emotional State Analysis */}
          <PatientCard 
            title="Emotional State Analysis" 
            description="Multi-source emotion detection"
            className="md:col-span-1"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <EmotionTag 
                emotion={ecgEmotion} 
                type={mapEmotionToType(ecgEmotion)} 
                source="ECG" 
                pulsing={true}
              />
              <EmotionTag 
                emotion={eegEmotion} 
                type={mapEmotionToType(eegEmotion)} 
                source="EEG/EOG" 
                pulsing={true}
              />
              <EmotionTag 
                emotion={facialEmotion} 
                type={mapEmotionToType(facialEmotion)} 
                source="Facial" 
                pulsing={true}
              />
              <EmotionTag 
                emotion={speechEmotion} 
                type={mapEmotionToType(speechEmotion)} 
                source="Speech" 
                pulsing={true}
              />
            </div>
          </PatientCard>

          {/* Brain Wave Text Interpretation */}
          <PatientCard 
            title="Brain Wave Speech Interpretation" 
            description="Detected thoughts from brain patterns"
            className="md:col-span-1"
          >
            <BrainWaveText 
              text={brainWaveText} 
              isProcessing={isProcessing}
              confidence={textConfidence}
            />
          </PatientCard>

          {/* Psychological Assessment */}
          <PatientCard 
            title="AI Psychological Assessment" 
            description="Analysis from combined data sources"
            className="md:col-span-2 lg:col-span-1"
          >
            <PsychAssessment assessment={assessment} />
          </PatientCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
