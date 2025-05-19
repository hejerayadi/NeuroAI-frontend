import React, { useState, useEffect } from 'react';
import { getRandomEmotion, mapEmotionToType } from '@/utils/dummyData';
import PatientCard from '../layout/PatientCard';
import FacialExpression, { FacialEmotionEntry } from '../visualizations/FacialExpression';
import EmotionTag from '../visualizations/EmotionTag';
import { format } from 'date-fns';

interface FacialAnalysisPageProps {
  patientName?: string;
}

const FacialAnalysisPage: React.FC<FacialAnalysisPageProps> = ({ patientName }) => {
  const [facialEmotion, setFacialEmotion] = useState(getRandomEmotion('facial'));
  const [facialEmotionType, setFacialEmotionType] = useState<'neutral' | 'positive' | 'negative' | 'warning'>(
    mapEmotionToType(facialEmotion)
  );
  const [cameraActive, setCameraActive] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState<FacialEmotionEntry[]>([]);
  
  // Clear localStorage on initial load if needed
  useEffect(() => {
    // Uncomment the next line to reset history on page refresh
    // localStorage.removeItem('facialEmotionHistory');
    
    console.log("Facial Analysis Page initialized");
  }, []);

  // Handle camera toggle
  const handleCameraToggle = (active: boolean) => {
    setCameraActive(active);
  };

  // Handle emotion updates from FacialExpression component
  const handleEmotionUpdate = (emotion: string, emotionType: 'neutral' | 'positive' | 'negative' | 'warning') => {
    setFacialEmotion(emotion);
    setFacialEmotionType(emotionType);
  };

  // Handle history updates from FacialExpression component
  const handleHistoryUpdate = (history: FacialEmotionEntry[]) => {
    console.log(`Facial emotion history update received with ${history.length} entries`);
    setEmotionHistory(history);
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
            cameraActive={cameraActive}
            onCameraToggle={handleCameraToggle}
            onEmotionUpdate={handleEmotionUpdate}
            onHistoryUpdate={handleHistoryUpdate}
            fullView={true}
          />
        </div>
        
        <div className="mt-6">
          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold mb-4 text-center">Emotional Analysis</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <EmotionTag 
                emotion={facialEmotion} 
                type={facialEmotionType} 
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
        description="Facial expression analysis history"
        className="col-span-1"
      >
        <div className="p-4">
          {emotionHistory.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Time</th>
                    <th className="py-2 px-4 border-b text-left">Emotion</th>
                  </tr>
                </thead>
                <tbody>
                  {emotionHistory.map((entry, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b">{entry.formattedTime}</td>
                      <td className="py-2 px-4 border-b">
                        <EmotionTag 
                          emotion={entry.emotion} 
                          type={entry.emotionType} 
                          source="Facial" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No facial emotion history available yet. Start the camera to begin capturing emotions.</p>
          )}
        </div>
      </PatientCard>
    </div>
  );
};

export default FacialAnalysisPage;
