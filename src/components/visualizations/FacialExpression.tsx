import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Camera, Eye, EyeOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FacialExpressionProps {
  emotion?: string;
  emotionType?: 'neutral' | 'positive' | 'negative' | 'warning';
  cameraActive: boolean;
  className?: string;
  onCameraToggle?: (active: boolean) => void;
  onEmotionUpdate?: (emotion: string, emotionType: 'neutral' | 'positive' | 'negative' | 'warning') => void;
  fullView?: boolean;
}

const FacialExpression: React.FC<FacialExpressionProps> = ({ 
  emotion: initialEmotion = 'neutral', 
  emotionType: initialEmotionType = 'neutral', 
  cameraActive: initialCameraActive,
  className,
  onCameraToggle,
  onEmotionUpdate,
  fullView = false
}) => {
  const [cameraActive, setCameraActive] = useState(initialCameraActive);
  const [emotion, setEmotion] = useState(initialEmotion);
  const [emotionType, setEmotionType] = useState(initialEmotionType);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
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
        
        // Start capturing frames every 5 seconds
        captureIntervalRef.current = setInterval(() => {
          captureAndSendFrame();
        }, 5000);
        
        console.log("Camera activated and frame capture started");
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

      // Clear the capture interval
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
        console.log("Frame capture stopped");
      }
    }
  };

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Failed to capture frame");
        return;
      }
      
      console.log("Frame captured, sending to API...");
      
      try {
        // Create form data and append the blob
        const formData = new FormData();
        formData.append('image', blob, 'frame.jpg');
        
        // Send to API
        const response = await fetch('http://localhost:7500/api/facial/predict', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API response received:", data);
        
        if (data.status === 'success' && data.emotion) {
          setEmotion(data.emotion);
          
          // Set emotion type based on the detected emotion
          let newEmotionType: 'neutral' | 'positive' | 'negative' | 'warning' = 'neutral';
          if (['happy', 'surprise'].includes(data.emotion)) {
            newEmotionType = 'positive';
          } else if (['sad', 'angry', 'fear', 'disgust'].includes(data.emotion)) {
            newEmotionType = 'negative';
          } else if (['contempt'].includes(data.emotion)) {
            newEmotionType = 'warning';
          }
          setEmotionType(newEmotionType);
          
          // Notify parent component of the emotion update
          if (onEmotionUpdate) {
            onEmotionUpdate(data.emotion, newEmotionType);
          }
          
          console.log(`Emotion updated to: ${data.emotion} (${newEmotionType})`);
        }
      } catch (error) {
        console.error("Error sending frame to API:", error);
      }
    }, 'image/jpeg', 0.95);
  };

  const toggleCamera = () => {
    const newState = !cameraActive;
    setCameraActive(newState);
    if (onCameraToggle) onCameraToggle(newState);
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
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
