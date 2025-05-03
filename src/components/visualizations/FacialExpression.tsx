
import React from 'react';
import { cn } from '@/lib/utils';
import { Camera, Eye } from 'lucide-react';

interface FacialExpressionProps {
  emotion: string;
  emotionType: 'neutral' | 'positive' | 'negative' | 'warning';
  cameraActive: boolean;
  className?: string;
}

const FacialExpression: React.FC<FacialExpressionProps> = ({ 
  emotion, 
  emotionType, 
  cameraActive,
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Camera Feed Simulation */}
      <div className="relative w-full h-40 bg-gray-900 rounded-lg overflow-hidden">
        {cameraActive ? (
          <>
            {/* Simulated camera feed with a grid pattern */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-px opacity-20">
              {Array(48).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-300"></div>
              ))}
            </div>
            
            {/* Face outline simulation */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        w-24 h-32 border-2 border-green-400 rounded-full opacity-60"></div>
            
            {/* Camera active indicator */}
            <div className="absolute top-2 right-2 flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-white opacity-75">REC</span>
            </div>

            {/* Emotion overlay */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 
                        px-3 py-1 bg-black bg-opacity-60 rounded-full">
              <span className="text-sm font-medium text-white">
                {emotion}
              </span>
            </div>
          </>
        ) : (
          // Camera inactive state
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Camera className="h-10 w-10 text-gray-400" />
            <p className="text-gray-400 mt-2 text-sm">Camera inactive</p>
          </div>
        )}
      </div>
      
      {/* Emotion indicator */}
      <div className="w-full flex justify-center">
        <div className={cn(
          "px-4 py-2 rounded-full font-medium text-center", 
          emotionType === 'positive' ? "bg-mind-success text-green-800" :
          emotionType === 'negative' ? "bg-red-100 text-red-800" :
          emotionType === 'warning' ? "bg-mind-warning text-orange-800" :
          "bg-mind-lightblue text-blue-800",
          "animate-pulse-soft"
        )}>
          {emotion}
        </div>
      </div>
    </div>
  );
};

export default FacialExpression;
