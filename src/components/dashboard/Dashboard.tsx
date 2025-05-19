import React, { useState, useEffect } from 'react';
import DashboardHeader from '../layout/DashboardHeader';
import PatientCard from '../layout/PatientCard';
import SimpleLineChart from '../charts/LineChart';
import EmotionTag from '../visualizations/EmotionTag';
import EmotionHistory from '../visualizations/EmotionHistory';
import BrainWaveText from '../visualizations/BrainWaveText';
import PsychAssessment from '../visualizations/PsychAssessment';
import FacialExpression from '../visualizations/FacialExpression';
import ToneAnalysis, { SpeechEmotionEntry } from '../visualizations/ToneAnalysis';
import EegEmotionMonitor, { EegEmotionEntry } from '../visualizations/EegEmotionMonitor';
import EnhancedEegVisualization from '../visualizations/EnhancedEegVisualization';
import FacialAnalysisPage from './FacialAnalysisPage';
import { format } from 'date-fns';
import { 
  generateEcgData, 
  generateEegData,
  generateEogData,
  generateToneData, 
  getRandomEmotion, 
  getRandomBrainWaveText,
  getRandomAssessment,
  mapEmotionToType,
  getPatientData
} from '@/utils/dummyData';
import { groqService } from '@/utils/groqService';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRef } from 'react';

interface DashboardProps {
  activeSection?: string;
  sessionType?: 'normal' | 'gaming';
  patientName?: string;
  doctorName?: string;
  sessionStartTime: Date;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  activeSection = "dashboard",
  sessionType = 'normal',
  patientName = '',
  doctorName = '',
  sessionStartTime
}) => {
  const navigate = useNavigate();

  // State for our dummy data
  const [ecgData, setEcgData] = useState(generateEcgData(50));
  const [eegData, setEegData] = useState(generateEegData(50));
  const [eogData, setEogData] = useState(generateEogData(50));
  const [toneData, setToneData] = useState(generateToneData(50));
  const [ecgEmotion, setEcgEmotion] = useState(getRandomEmotion('ecg'));
  const [eegEmotion, setEegEmotion] = useState(getRandomEmotion('eeg'));
  const [facialEmotion, setFacialEmotion] = useState('neutral');
  const [facialEmotionType, setFacialEmotionType] = useState<'neutral' | 'positive' | 'negative' | 'warning'>('neutral');
  const [speechEmotion, setSpeechEmotion] = useState('neutral');
  const [speechEmotionType, setSpeechEmotionType] = useState<'neutral' | 'positive' | 'negative' | 'warning'>('neutral');
  const [speechEmotionHistory, setSpeechEmotionHistory] = useState<SpeechEmotionEntry[]>([]);
  const [brainWaveText, setBrainWaveText] = useState(getRandomBrainWaveText());
  const [assessment, setAssessment] = useState<{
    emotionalState: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
    insights: string[];
  }>({
    emotionalState: 'Initializing assessment...',
    recommendations: ['Waiting for data to generate recommendations...'],
    riskLevel: 'low',
    insights: ['Waiting for data to generate insights...']
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [textConfidence, setTextConfidence] = useState(85);
  const [cameraActive, setCameraActive] = useState(false);
  const [eegEmotionHistory, setEegEmotionHistory] = useState<EegEmotionEntry[]>([]);
  
  // Historical emotion data
  const [ecgHistory, setEcgHistory] = useState<Array<{
    time: string;
    emotion: string;
    source: string;
    type?: 'neutral' | 'positive' | 'negative' | 'warning';
  }>>([]);
  
  const [eegHistory, setEegHistory] = useState<Array<{
    time: string;
    emotion: string;
    source: string;
    type?: 'neutral' | 'positive' | 'negative' | 'warning';
  }>>([]);
  
  const [speechHistory, setSpeechHistory] = useState<Array<{
    time: string;
    emotion: string;
    source: string;
    type?: 'neutral' | 'positive' | 'negative' | 'warning';
  }>>([
    { time: format(new Date(Date.now() - 29 * 60000), 'HH:mm'), emotion: getRandomEmotion('speech'), source: 'Speech' },
    { time: format(new Date(Date.now() - 22 * 60000), 'HH:mm'), emotion: getRandomEmotion('speech'), source: 'Speech' },
    { time: format(new Date(Date.now() - 17 * 60000), 'HH:mm'), emotion: getRandomEmotion('speech'), source: 'Speech' },
    { time: format(new Date(Date.now() - 10 * 60000), 'HH:mm'), emotion: getRandomEmotion('speech'), source: 'Speech' },
    { time: format(new Date(Date.now() - 3 * 60000), 'HH:mm'), emotion: getRandomEmotion('speech'), source: 'Speech' },
  ]);
  
  const [brainWaveHistory, setBrainWaveHistory] = useState<Array<{
    time: string;
    text: string;
    confidence: number;
  }>>([
    { 
      time: format(new Date(Date.now() - 27 * 60000), 'HH:mm'), 
      text: getRandomBrainWaveText(),
      confidence: 85
    },
    { 
      time: format(new Date(Date.now() - 20 * 60000), 'HH:mm'), 
      text: getRandomBrainWaveText(),
      confidence: 78
    },
    { 
      time: format(new Date(Date.now() - 13 * 60000), 'HH:mm'), 
      text: getRandomBrainWaveText(),
      confidence: 92
    },
    { 
      time: format(new Date(Date.now() - 6 * 60000), 'HH:mm'), 
      text: getRandomBrainWaveText(),
      confidence: 81
    },
  ]);

  const [assessmentHistory, setAssessmentHistory] = useState<Array<{
    timestamp: string;
    assessment: typeof assessment;
  }>>([]);

  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false);

  // Add session start time
  const [sessionDuration, setSessionDuration] = useState('00:00:00');

  // Get patient data with the provided name if available
  const patient = patientName ? 
    { ...getPatientData(), name: patientName } : 
    getPatientData();

  // Handle facial emotion updates from FacialExpression component
  const handleFacialEmotionUpdate = (emotion: string, emotionType: 'neutral' | 'positive' | 'negative' | 'warning') => {
    setFacialEmotion(emotion);
    setFacialEmotionType(emotionType);
  };

  // Handle speech emotion updates from ToneAnalysis component
  const handleSpeechEmotionUpdate = (emotion: string, emotionType: 'neutral' | 'positive' | 'negative' | 'warning') => {
    setSpeechEmotion(emotion);
    setSpeechEmotionType(emotionType);
    console.log(`Dashboard received speech emotion update: ${emotion} (${emotionType})`);
  };

  // Handle speech history updates
  const handleSpeechHistoryUpdate = (history: SpeechEmotionEntry[]) => {
    console.log(`Speech history update received with ${history.length} entries`);
    setSpeechEmotionHistory(history);
  };

  // Handle EEG emotion updates from EegEmotionMonitor component
  const handleEegEmotionUpdate = (emotion: string, emotionType: 'neutral' | 'positive' | 'negative' | 'warning') => {
    setEegEmotion(emotion);
    console.log(`Dashboard received EEG emotion update: ${emotion} (${emotionType})`);
    
    // Add the new emotion to history
    const now = new Date();
    const formattedTime = format(now, 'HH:mm:ss');
    
    // Update eegHistory with new entry
    setEegHistory(prevHistory => {
      const newEntry = { 
        time: formattedTime, 
        emotion: emotion,
        source: 'EEG',
        type: emotionType
      };
      
      // Add to beginning of history array (newest first) and limit to 50 entries
      const updatedHistory = [newEntry, ...prevHistory].slice(0, 50);
      
      // Save to localStorage
      try {
        localStorage.setItem('eegEmotionHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Error saving EEG history to localStorage:", error);
      }
      
      return updatedHistory;
    });
  };

  // Handle EEG history updates
  const handleEegHistoryUpdate = (history: EegEmotionEntry[]) => {
    console.log(`EEG history update received with ${history.length} entries`);
    setEegEmotionHistory(history);
    
    // Update the eegHistory format for compatibility with existing components
    setEegHistory(history.map(entry => ({
      time: entry.formattedTime,
      emotion: entry.emotion,
      source: 'EEG',
      type: entry.emotionType
    })));
  };

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

      // Update EOG data with new values
      setEogData(prevData => {
        const newPoint = {
          time: `${parseInt(prevData[prevData.length - 1].time) + 5}ms`, 
          value: Math.cos(parseInt(prevData[prevData.length - 1].time) * 0.05) * 3 + (Math.random() * 1.5 - 0.75)
        };
        return [...prevData.slice(1), newPoint];
      });

      // Update Tone data with new values
      setToneData(prevData => {
        const newPoint = {
          time: `${parseInt(prevData[prevData.length - 1].time) + 10}ms`, 
          value: Math.sin(parseInt(prevData[prevData.length - 1].time) * 0.2) * 4 + (Math.random() * 3 - 1.5)
        };
        return [...prevData.slice(1), newPoint];
      });
    }, 1000);

    // Emotion updates at a slower rate - REMOVING facial, speech AND eeg emotion random updates
    const emotionInterval = setInterval(() => {
      if (Math.random() > 0.7) setEcgEmotion(getRandomEmotion('ecg'));
      // EEG emotion is now controlled by the API
      // Facial emotion is now controlled by the API
      // Speech emotion is now controlled by the API
    }, 5000);


  // Brain wave text updates from the API
  async function fetchAndDisplayPredictions() {
    setIsProcessing(true);
    setBrainWaveText("Fetching new prediction...");

    try {
      const matFilename = "t12.2022.05.05.mat";
      const fileResponse = await fetch(`/mat-files/${matFilename}`);
      if (!fileResponse.ok) throw new Error("Failed to load .mat file");
      const file = await fileResponse.blob();

      const formData = new FormData();
      formData.append("file", file, matFilename);

      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to fetch prediction");

      const result = await response.json();
      console.log("Received result from Flask:", result);

      if (Array.isArray(result.predictions) && result.predictions.length > 0) {
        for (const prediction of result.predictions) {
          setBrainWaveText(prediction);
          await new Promise(resolve => setTimeout(resolve, 7000)); // wait 7s between each
        }
      } else {
        setBrainWaveText("No predictions available");
        await new Promise(resolve => setTimeout(resolve, 7000));
      }
    } catch (error) {
      console.error("Failed to fetch from Flask API:", error);
      setBrainWaveText("Error fetching data");
      await new Promise(resolve => setTimeout(resolve, 7000));
    } finally {
      setIsProcessing(false);
      fetchAndDisplayPredictions();
    }
  }

// Start the loop once
fetchAndDisplayPredictions();



    return () => {
      clearInterval(updateInterval);
      clearInterval(emotionInterval);
    };
  }, []);

  // Clear localStorage on initial load to start with fresh history
  useEffect(() => {
    // Uncomment the next line to reset history on page refresh
    // localStorage.removeItem('speechEmotionHistory');
    // localStorage.removeItem('facialEmotionHistory');
    
    console.log("Dashboard initialized");
  }, []);

  // Update session duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - sessionStartTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setSessionDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Function to end session and clean up
  const endSession = () => {
    // Clear all localStorage data
    localStorage.removeItem('eegEmotionHistory');
    localStorage.removeItem('speechEmotionHistory');
    localStorage.removeItem('assessmentHistory');
    localStorage.removeItem('ecgHistory');
    localStorage.removeItem('eegHistory');
    localStorage.removeItem('speechHistory');
    localStorage.removeItem('brainWaveHistory');
    localStorage.removeItem('facialEmotionHistory');
    
    // Clear all state variables
    setEcgHistory([]);
    setEegHistory([]);
    setSpeechHistory([]);
    setBrainWaveHistory([]);
    setSpeechEmotionHistory([]);
    setEegEmotionHistory([]);
    setAssessmentHistory([]);
    
    // Reset current emotions to neutral
    setEcgEmotion('neutral');
    setEegEmotion('neutral');
    setFacialEmotion('neutral');
    setFacialEmotionType('neutral');
    setSpeechEmotion('neutral');
    setSpeechEmotionType('neutral');
    
    // Reset assessment to initial state
    setAssessment({
      emotionalState: 'Initializing assessment...',
      recommendations: ['Waiting for data to generate recommendations...'],
      riskLevel: 'low',
      insights: ['Waiting for data to generate insights...']
    });
    
    // Navigate to session start
    navigate('/session-start');
  };

  // Update assessment using Groq service
  const updateAssessment = async () => {
    try {
      setIsGeneratingAssessment(true);
      const assessment = await groqService.getPsychologicalAssessment(
        ecgHistory,
        eegHistory,
        speechHistory,
        brainWaveHistory
      );
      setAssessment(assessment);
      
      // Add to history
      const timestamp = new Date().toISOString();
      setAssessmentHistory(prev => [{
        timestamp,
        assessment
      }, ...prev].slice(0, 10)); // Keep last 10 assessments
      
      // Save to localStorage
      try {
        const savedHistory = localStorage.getItem('assessmentHistory');
        let historyArray = [];
        
        if (savedHistory) {
          historyArray = JSON.parse(savedHistory);
        }
        
        const updatedHistory = [{
          timestamp,
          assessment
        }, ...historyArray].slice(0, 10);
        
        localStorage.setItem('assessmentHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Error saving assessment history to localStorage:", error);
      }
    } catch (error) {
      console.error('Error updating assessment:', error);
      // Fallback to dummy data if there's an error
      setAssessment(getRandomAssessment());
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  // Load assessment history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('assessmentHistory');
      if (savedHistory) {
        setAssessmentHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Error loading assessment history from localStorage:", error);
    }
  }, []);

  // Initial assessment
  useEffect(() => {
    setAssessment(getRandomAssessment());
  }, []);

  // Render function for the main dashboard
  const renderDashboard = () => (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Column - Stacked Components */}
      <div className="col-span-12 md:col-span-5 space-y-6">
        {/* ECG Chart */}
        <PatientCard 
          title="ECG Heart Monitor" 
          description="Real-time heartbeat analysis"
        >
          <div className="h-64">
            <SimpleLineChart 
              data={ecgData} 
              dataKey="value" 
              color="#ef4444" 
              height={230}
            />
          </div>
          <div className="mt-4 flex justify-center">
            <EmotionTag 
              emotion={ecgEmotion} 
              type={mapEmotionToType(ecgEmotion)} 
              source="ECG" 
              pulsing={true}
            />
          </div>
        </PatientCard>

        {/* Facial Expression Analysis */}
        <PatientCard 
          title="Facial Expression Analysis" 
          description="Real-time facial emotion detection"
        >
          <FacialExpression 
            cameraActive={cameraActive}
            onCameraToggle={(active) => setCameraActive(active)}
            onEmotionUpdate={handleFacialEmotionUpdate}
          />
        </PatientCard>

        {/* Tone Analysis */}
        <PatientCard 
          title="Speech Tone Analysis" 
          description="Real-time voice tone detection"
        >
          <ToneAnalysis 
            emotion={speechEmotion}
            emotionType={speechEmotionType}
            onEmotionUpdate={handleSpeechEmotionUpdate}
            onHistoryUpdate={handleSpeechHistoryUpdate}
          />
        </PatientCard>
      </div>

      {/* Right Column - EEG Brain Activity */}
      <div className="col-span-12 md:col-span-7">
        {/* EEG Chart */}
        <PatientCard 
          title="EEG Brain Activity" 
          description="Real-time brain wave patterns"
          className="h-full"
        >
          <div className="h-[calc(100%-2rem)]">
            <EnhancedEegVisualization
              emotion={eegEmotion}
              emotionType={mapEmotionToType(eegEmotion)}
              showEog={true}
              onEmotionUpdate={handleEegEmotionUpdate}
              className="h-full"
            />
          </div>
          {eegHistory.length === 0 && (
            <div className="mt-4 text-center text-gray-500">
              No EEG history available yet. Start the session to begin capturing data.
            </div>
          )}
        </PatientCard>
      </div>

      {/* Middle Row - Brain Wave Text and Emotional State Analysis side by side */}
      <div className="col-span-12 md:col-span-6">
        {/* Brain Wave Text Interpretation */}
        <PatientCard 
          title="Brain Wave Speech Interpretation" 
          description="Detected thoughts from brain patterns"
        >
          <BrainWaveText 
            text={brainWaveText} 
            isProcessing={isProcessing}
            confidence={textConfidence}
          />
        </PatientCard>
      </div>

      <div className="col-span-12 md:col-span-6">
        {/* Emotional State Analysis */}
        <PatientCard 
          title="Emotional State Analysis" 
          description="Multi-source emotion detection"
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
              source="EEG" 
              pulsing={true}
            />
            <EmotionTag 
              emotion={facialEmotion} 
              type={facialEmotionType} 
              source="Facial" 
              pulsing={true}
            />
            <EmotionTag 
              emotion={speechEmotion} 
              type={speechEmotionType} 
              source="Speech" 
              pulsing={true}
            />
          </div>
        </PatientCard>
      </div>

      {/* Bottom Row - Psychological Assessment */}
      <div className="col-span-12">
        {/* Psychological Assessment */}
        <PatientCard 
          title="AI Psychological Assessment" 
          description="Analysis from combined data sources"
        >
          <div className="flex justify-end mb-4">
            <Button
              onClick={updateAssessment}
              disabled={isGeneratingAssessment}
              className="bg-mind-darkpurple hover:bg-mind-purple"
            >
              {isGeneratingAssessment ? 'Generating...' : 'Generate New Assessment'}
            </Button>
          </div>

          <PsychAssessment 
            assessment={assessment} 
            className="bg-mind-softgray border-l-4 border-mind-darkpurple shadow-md p-6" 
          />

          {assessmentHistory.length === 0 && (
            <div className="mt-4 text-center text-gray-500">
              No assessment history available. Generate an assessment to begin tracking.
            </div>
          )}
        </PatientCard>
      </div>
    </div>
  );

  // Render function for EEG (different for gaming vs normal sessions)
  const renderEeg = () => (
    <div className="grid grid-cols-1 gap-6">
      <PatientCard 
        title={`EEG Brain Activity ${sessionType === 'gaming' ? '(Gaming)' : ''}`}
        description={sessionType === 'gaming' ? 
          "Brain activity during gaming session" : 
          "Real-time brain wave patterns"}
        className="col-span-1"
      >
        <EnhancedEegVisualization
          emotion={eegEmotion}
          emotionType={mapEmotionToType(eegEmotion)}
          showEog={true}
          onEmotionUpdate={handleEegEmotionUpdate}
          className="mt-4"
        />
        
        <div className="mt-8 border-t pt-4">
          {eegHistory.length === 0 ? (
            <div className="text-center text-gray-500">
              No EEG history available yet. Start the session to begin capturing data.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <EmotionHistory
                emotions={eegHistory.map(item => ({ ...item, source: "EEG" }))}
              />
            </div>
          )}
        </div>
      </PatientCard>
    </div>
  );

  // Render function for ECG
  const renderEcg = () => (
    <div className="grid grid-cols-1 gap-6">
      <PatientCard 
        title="ECG Heart Monitor" 
        description="Real-time heartbeat analysis"
        className="col-span-1"
      >
        <div className="h-[400px]">
          <SimpleLineChart 
            data={ecgData} 
            dataKey="value" 
            color="#ef4444" 
            height={350}
          />
        </div>
        <div className="mt-6 flex justify-center">
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">Current Emotional State</h3>
            <EmotionTag 
              emotion={ecgEmotion} 
              type={mapEmotionToType(ecgEmotion)} 
              source="ECG" 
              pulsing={true}
              className="transform scale-125"
            />
          </div>
        </div>
        
        <div className="mt-8 border-t pt-4">
          {ecgHistory.length === 0 ? (
            <div className="text-center text-gray-500">
              No ECG history available yet. Start the session to begin capturing data.
            </div>
          ) : (
            <EmotionHistory
              emotions={ecgHistory.map(item => ({ ...item, source: "ECG" }))}
            />
          )}
        </div>
      </PatientCard>
    </div>
  );

  // Render function for Speech Analysis
  const renderSpeech = () => (
    <div className="grid grid-cols-1 gap-6">
      <PatientCard 
        title="Speech Tone Analysis" 
        description="In-depth analysis of speech patterns and emotional tone"
        className="col-span-1"
      >
        <div className="p-4">
          <ToneAnalysis 
            emotion={speechEmotion}
            emotionType={speechEmotionType}
            onEmotionUpdate={handleSpeechEmotionUpdate}
            onHistoryUpdate={handleSpeechHistoryUpdate}
          />
        </div>
        <div className="mt-6 flex justify-center">
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">Speech Emotional Marker</h3>
            <EmotionTag 
              emotion={speechEmotion} 
              type={speechEmotionType} 
              source="Speech" 
              pulsing={true}
              className="transform scale-125"
            />
          </div>
        </div>
        
        <div className="mt-8 border-t pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Historical Emotion Data</h3>
          {speechEmotionHistory.length === 0 ? (
            <div className="text-center text-gray-500">
              No speech emotion history available yet. Start the microphone to begin capturing emotions.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Time</th>
                    <th className="py-2 px-4 border-b text-left">Emotion</th>
                  </tr>
                </thead>
                <tbody>
                  {speechEmotionHistory.map((entry, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b">{entry.formattedTime}</td>
                      <td className="py-2 px-4 border-b">
                        <EmotionTag 
                          emotion={entry.emotion} 
                          type={
                            ['happy', 'surprise'].includes(entry.emotion) ? 'positive' :
                            ['sad', 'angry', 'fear', 'disgust'].includes(entry.emotion) ? 'negative' :
                            ['contempt'].includes(entry.emotion) ? 'warning' : 'neutral'
                          } 
                          source="Speech" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PatientCard>
    </div>
  );

  // Render function for Brain Waves
  const renderBrainWaves = () => (
    <div className="grid grid-cols-1 gap-6">
      <PatientCard 
        title="Brain Wave Speech Interpretation" 
        description="Advanced neural pattern to speech conversion"
        className="col-span-1"
      >
        <div className="p-8">
          <BrainWaveText 
            text={brainWaveText} 
            isProcessing={isProcessing}
            confidence={textConfidence}
            className="text-lg"
          />
        </div>
        <div className="mt-4 flex justify-center">
          <div className="h-[200px] w-full">
            <SimpleLineChart 
              data={eegData} 
              dataKey="value" 
              color="#9b87f5" 
              height={180}
            />
          </div>
        </div>
        
        <div className="mt-8 border-t pt-4">
          {brainWaveHistory.length === 0 ? (
            <div className="text-center text-gray-500">
              No brain wave history available yet. Start the session to begin capturing data.
            </div>
          ) : (
            <EmotionHistory
              emotions={brainWaveHistory}
              showText={true}
            />
          )}
        </div>
      </PatientCard>
    </div>
  );

  // Render function for reports
  const renderReports = () => (
    <div className="grid grid-cols-1 gap-6">
      <PatientCard 
        title="AI Psychological Assessment" 
        description="Comprehensive psychological analysis from combined data sources"
        className="col-span-1"
      >
        <div className="flex justify-end mb-4">
          <Button
            onClick={updateAssessment}
            disabled={isGeneratingAssessment}
            className="bg-mind-darkpurple hover:bg-mind-purple"
          >
            {isGeneratingAssessment ? 'Generating...' : 'Generate New Assessment'}
          </Button>
        </div>

        <PsychAssessment 
          assessment={assessment} 
          className="bg-mind-softgray border-l-4 border-mind-darkpurple shadow-md p-6" 
        />

        {assessmentHistory.length === 0 ? (
          <div className="mt-4 text-center text-gray-500">
            No assessment history available. Generate an assessment to begin tracking.
          </div>
        ) : (
          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Assessment History</h3>
            <div className="space-y-4">
              {assessmentHistory.map((entry, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">
                      {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </span>
                  </div>
                  <PsychAssessment 
                    assessment={entry.assessment} 
                    className="bg-mind-softgray border-l-4 border-mind-darkpurple shadow-md" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </PatientCard>
    </div>
  );

  // Render function for Facial Analysis
  const renderFacialAnalysis = () => (
    <FacialAnalysisPage patientName={patientName} />
  );

  const renderContent = () => {
    switch (activeSection) {
      case "ecg":
        return renderEcg();
      case "eeg":
        return renderEeg();
      case "speech":
        return renderSpeech();
      case "brain-waves":
        return renderBrainWaves();
      case "reports":
        return renderReports();
      case "facial-analysis":
        return renderFacialAnalysis();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader 
          patientName={patient.name} 
          patientId={patient.id} 
          sessionTime={sessionDuration} 
          patientStatus={patient.status}
          patientImageUrl={patient.imageUrl}
        />
        
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
