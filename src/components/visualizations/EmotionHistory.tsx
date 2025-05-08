
import React from 'react';
import { Clock } from 'lucide-react';
import EmotionTag from './EmotionTag';
import { mapEmotionToType } from '@/utils/dummyData';

interface EmotionHistoryProps {
  emotions: {
    time: string;
    emotion: string;
    source?: string;
  }[];
  className?: string;
}

const EmotionHistory: React.FC<EmotionHistoryProps> = ({ emotions, className }) => {
  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Historical Data</h3>
      {emotions.map((item, index) => (
        <div key={index} className="flex justify-between items-center border-b pb-2">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>{item.time}</span>
          </div>
          <EmotionTag 
            emotion={item.emotion} 
            type={mapEmotionToType(item.emotion)} 
            source={item.source || ''} 
            pulsing={false}
          />
        </div>
      ))}
    </div>
  );
};

export default EmotionHistory;
