
import React, { useState } from 'react';
import { getRandomEmotion, mapEmotionToType } from '@/utils/dummyData';
import PatientCard from '../layout/PatientCard';
import FacialExpression from '../visualizations/FacialExpression';
import EmotionTag from '../visualizations/EmotionTag';

interface FacialAnalysisPageProps {
  patientName?: string;
}

const FacialAnalysisPage: React.FC<FacialAnalysisPageProps> = ({ patientName }) => {
  const [facialEmotion, setFacialEmotion] = useState(getRandomEmotion('facial'));
  const [cameraActive, setCameraActive] = useState(true);
  
  // Update emotion every 5 seconds
  React.useEffect(() => {
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
          <div className="flex flex-col space-y-3">
            {['Happy', 'Neutral', 'Sad', 'Angry', 'Surprised', 'Neutral', 'Happy'].map((emotion, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-600">
                  {new Date(Date.now() - (index * 5 * 60000)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <EmotionTag 
                  emotion={emotion} 
                  type={mapEmotionToType(emotion as string)} 
                  source="Facial" 
                  pulsing={false}
                />
              </div>
            ))}
          </div>
        </div>
      </PatientCard>
    </div>
  );
};

export default FacialAnalysisPage;
