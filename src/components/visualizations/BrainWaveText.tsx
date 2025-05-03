
import React from 'react';
import { cn } from '@/lib/utils';

interface BrainWaveTextProps {
  text: string;
  isProcessing?: boolean;
  confidence?: number;
  className?: string;
}

const BrainWaveText: React.FC<BrainWaveTextProps> = ({ 
  text, 
  isProcessing = false,
  confidence = 100,
  className 
}) => {
  // Determine text styling based on confidence
  const getConfidenceStyle = () => {
    if (confidence >= 80) return "text-gray-900";
    if (confidence >= 60) return "text-gray-700";
    return "text-gray-500 italic";
  };

  return (
    <div className={cn("relative", className)}>
      {isProcessing && (
        <div className="absolute top-0 right-0 flex items-center space-x-1">
          <span className="text-xs text-mind-purple">Processing</span>
          <span className="flex space-x-1">
            <span className="w-1 h-1 bg-mind-purple rounded-full animate-pulse"></span>
            <span className="w-1 h-1 bg-mind-purple rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 h-1 bg-mind-purple rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
          </span>
        </div>
      )}
      <div className="bg-white border rounded-md p-4 shadow-sm">
        <p className={cn("font-medium mb-2", getConfidenceStyle())}>{text}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Confidence: {confidence}%</span>
          <span className="text-xs text-gray-400">Interpreted from EEG waves</span>
        </div>
      </div>
    </div>
  );
};

export default BrainWaveText;
