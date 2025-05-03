
import React from 'react';
import { cn } from '@/lib/utils';

type EmotionType = 'neutral' | 'positive' | 'negative' | 'warning';

interface EmotionTagProps {
  emotion: string;
  type?: EmotionType;
  source: string;
  pulsing?: boolean;
  className?: string;
}

const getEmotionStyles = (type: EmotionType) => {
  switch (type) {
    case 'positive':
      return 'bg-mind-success text-green-800';
    case 'negative':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-mind-warning text-orange-800';
    case 'neutral':
    default:
      return 'bg-mind-lightblue text-blue-800';
  }
};

const EmotionTag: React.FC<EmotionTagProps> = ({ 
  emotion, 
  type = 'neutral', 
  source,
  pulsing = false,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn(
        "px-4 py-2 rounded-full font-medium text-center mb-1",
        getEmotionStyles(type),
        pulsing && "animate-pulse-soft"
      )}>
        {emotion}
      </div>
      <span className="text-xs text-gray-500">{source}</span>
    </div>
  );
};

export default EmotionTag;
