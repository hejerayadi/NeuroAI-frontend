
import React from 'react';
import { cn } from '@/lib/utils';
import SimpleLineChart from '../charts/LineChart';

interface ToneAnalysisProps {
  data: { time: string; value: number }[];
  emotion: string;
  emotionType: 'neutral' | 'positive' | 'negative' | 'warning';
  className?: string;
}

const ToneAnalysis: React.FC<ToneAnalysisProps> = ({ 
  data, 
  emotion,
  emotionType,
  className 
}) => {
  // Get the appropriate styling based on emotion type
  const getEmotionTypeStyle = (type: 'neutral' | 'positive' | 'negative' | 'warning') => {
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

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Waveform visualization */}
      <div className="h-36 mb-4">
        <SimpleLineChart 
          data={data} 
          dataKey="value" 
          color="#22c55e" 
          height={130}
          animated={true}
        />
      </div>
      
      {/* Audio visualization (simulated) */}
      <div className="h-5 w-full bg-gray-100 rounded-lg mb-4 overflow-hidden">
        <div className="h-full flex items-center justify-around">
          {Array(25).fill(0).map((_, i) => {
            const height = 30 + Math.random() * 70;
            return (
              <div 
                key={i} 
                className="bg-green-400 w-1" 
                style={{ 
                  height: `${height}%`,
                  opacity: Math.random() * 0.5 + 0.5
                }}
              ></div>
            );
          })}
        </div>
      </div>
      
      {/* Emotion display */}
      <div className="flex items-center justify-center mt-2">
        <div className={cn(
          "px-4 py-2 rounded-full font-medium text-center",
          getEmotionTypeStyle(emotionType),
          "animate-pulse-soft"
        )}>
          {emotion}
        </div>
      </div>
    </div>
  );
};

export default ToneAnalysis;
