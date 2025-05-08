
import React from 'react';
import { Clock } from 'lucide-react';
import EmotionTag from './EmotionTag';
import { mapEmotionToType } from '@/utils/dummyData';

interface EmotionHistoryProps {
  emotions: {
    time: string;
    emotion?: string;
    source?: string;
    text?: string;
  }[];
  className?: string;
  showText?: boolean;
}

const EmotionHistory: React.FC<EmotionHistoryProps> = ({ emotions, className, showText = false }) => {
  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Historical Data</h3>
      {emotions.map((item, index) => (
        <div key={index} className="flex flex-col border-b pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>{item.time}</span>
            </div>
            {item.emotion && !showText && (
              <EmotionTag 
                emotion={item.emotion} 
                type={mapEmotionToType(item.emotion)} 
                source={item.source || ''} 
                pulsing={false}
              />
            )}
          </div>
          
          {showText && item.text && (
            <div className="mt-1 text-sm text-gray-700 italic pl-5">
              "{item.text}"
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EmotionHistory;
