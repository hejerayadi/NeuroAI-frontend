
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Camera, Eye, EyeOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FacialExpressionProps {
  emotion: string;
  emotionType: 'neutral' | 'positive' | 'negative' | 'warning';
  cameraActive: boolean;
  className?: string;
  onCameraToggle?: (active: boolean) => void;
  fullView?: boolean;
}

const FacialExpression: React.FC<FacialExpressionProps> = ({ 
  emotion, 
  emotionType, 
  cameraActive: initialCameraActive,
  className,
  onCameraToggle,
  fullView = false
}) => {
  const [cameraActive, setCameraActive] = useState(initialCameraActive);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Handle camera activation/deactivation
  useEffect(() => {
    if (cameraActive && !stream) {
      activateCamera();
    } else if (!cameraActive && stream) {
      deactivateCamera();
    }
    
    return () => {
      if (stream) {
        deactivateCamera();
      }
    };
  }, [cameraActive]);

  const activateCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      setCameraActive(false);
      if (onCameraToggle) onCameraToggle(false);
    }
  };

  const deactivateCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const toggleCamera = () => {
    const newState = !cameraActive;
    setCameraActive(newState);
    if (onCameraToggle) onCameraToggle(newState);
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Camera Feed */}
      <div className={cn(
        "relative bg-gray-900 rounded-lg overflow-hidden",
        fullView ? "w-full h-[400px]" : "w-full h-40"
      )}>
        {cameraActive ? (
          <>
            {/* Real camera feed */}
            <video 
              ref={videoRef}
              autoPlay 
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Face outline simulation */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        w-24 h-32 border-2 border-green-400 rounded-full opacity-60 animate-pulse"></div>
            
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
      
      {/* Camera controls */}
      <div className="w-full flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleCamera}
          className="flex items-center gap-2"
        >
          {cameraActive ? (
            <>
              <VideoOff size={16} />
              <span>Stop Camera</span>
            </>
          ) : (
            <>
              <Video size={16} />
              <span>Start Camera</span>
            </>
          )}
        </Button>
        
        {/* Emotion indicator */}
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
