
import React, { useState, useEffect } from 'react';
import { getRandomEmotion, mapEmotionToType } from '@/utils/dummyData';
import PatientCard from '../layout/PatientCard';
import FacialExpression from '../visualizations/FacialExpression';
import EmotionTag from '../visualizations/EmotionTag';
import EmotionHistory from '../visualizations/EmotionHistory';
import { format } from 'date-fns';

interface FacialAnalysisPageProps {
  patientName?: string;
}

const FacialAnalysisPage: React.FC<FacialAnalysisPageProps> = ({ patientName }) => {
  const [facialEmotion, setFacialEmotion] = useState(getRandomEmotion('facial'));
  const [cameraActive, setCameraActive] = useState(true);
  const [emotionHistory, setEmotionHistory] = useState([
    { time: format(new Date(Date.now() - 30 * 60000), 'HH:mm'), emotion: 'Happy' },
    { time: format(new Date(Date.now() - 25 * 60000), 'HH:mm'), emotion: 'Neutral' },
    { time: format(new Date(Date.now() - 20 * 60000), 'HH:mm'), emotion: 'Sad' },
    { time: format(new Date(Date.now() - 15 * 60000), 'HH:mm'), emotion: 'Angry' },
    { time: format(new Date(Date.now() - 10 * 60000), 'HH:mm'), emotion: 'Surprised' },
    { time: format(new Date(Date.now() - 5 * 60000), 'HH:mm'), emotion: 'Neutral' },
    { time: format(new Date(Date.now() - 1 * 60000), 'HH:mm'), emotion: 'Happy' },
  ]);
  
  // Update emotion every 5 seconds
  useEffect(() => {
    const emotionInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        setFacialEmotion(getRandomEmotion('facial'));
      }
    }, 5000);
    
    return () => clearInterval(emotionInterval);
  }, []);
  
  const handleCameraToggle = (active: boolean) => {
    setCameraActive(active);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <PatientCard 
        title="Advanced Facial Expression Analysis" 
        description="Real-time facial emotion detection and tracking"
        className="col-span-1"
      >
        <div className="p-4">
          <FacialExpression 
            emotion={facialEmotion}
            emotionType={mapEmotionToType(facialEmotion)}
            cameraActive={cameraActive}
            onCameraToggle={handleCameraToggle}
            fullView={true}
          />
        </div>
        
        <div className="mt-6">
          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold mb-4 text-center">Emotional Analysis</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <EmotionTag 
                emotion="Happy" 
                type="positive" 
                source="Eyes" 
                pulsing={facialEmotion === 'Happy'}
              />
              <EmotionTag 
                emotion="Sad" 
                type="negative" 
                source="Mouth" 
                pulsing={facialEmotion === 'Sad'}
              />
              <EmotionTag 
                emotion="Angry" 
                type="negative" 
                source="Eyebrows" 
                pulsing={facialEmotion === 'Angry'}
              />
              <EmotionTag 
                emotion="Surprised" 
                type="warning" 
                source="Eyes" 
                pulsing={facialEmotion === 'Surprised'}
              />
              <EmotionTag 
                emotion={facialEmotion} 
                type={mapEmotionToType(facialEmotion)} 
                source="Overall" 
                pulsing={true}
                className="scale-110"
              />
            </div>
          </div>
        </div>
      </PatientCard>
      
      <PatientCard 
        title="Historical Emotion Data" 
        description="Past 30 minutes of facial expression analysis"
        className="col-span-1"
      >
        <div className="p-4">
          <EmotionHistory 
            emotions={emotionHistory.map(item => ({ ...item, source: 'Facial' }))}
          />
        </div>
      </PatientCard>
    </div>
  );
};

export default FacialAnalysisPage;
