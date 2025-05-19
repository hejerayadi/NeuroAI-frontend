import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { eegEogService } from '@/utils/eegEogService';
import { format } from 'date-fns';

export interface EegEmotionEntry {
  emotion: string;
  emotionType: 'neutral' | 'positive' | 'negative' | 'warning';
  timestamp: Date;
  formattedTime: string;
}

interface EegEmotionMonitorProps {
  className?: string;
  onEmotionUpdate?: (emotion: string, emotionType: 'neutral' | 'positive' | 'negative' | 'warning') => void;
  onHistoryUpdate?: (history: EegEmotionEntry[]) => void;
}

const EegEmotionMonitor: React.FC<EegEmotionMonitorProps> = ({
  className,
  onEmotionUpdate,
  onHistoryUpdate
}) => {
  const [active, setActive] = useState(false);
  const [emotion, setEmotion] = useState('neutral');
  const [emotionType, setEmotionType] = useState<'neutral' | 'positive' | 'negative' | 'warning'>('neutral');
  const [emotionHistory, setEmotionHistory] = useState<EegEmotionEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('eegEmotionHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert string dates back to Date objects
        const processedHistory = parsedHistory.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setEmotionHistory(processedHistory);
        
        // Notify parent component if callback exists
        if (onHistoryUpdate) {
          onHistoryUpdate(processedHistory);
        }
      }
    } catch (error) {
      console.error("Error loading EEG emotion history:", error);
      // Initialize with empty array if error
      setEmotionHistory([]);
    }
  }, []);

  // Handle starting and stopping the emotion monitoring
  useEffect(() => {
    if (active && !intervalRef.current) {
      // Start monitoring
      startMonitoring();
    } else if (!active && intervalRef.current) {
      // Stop monitoring
      stopMonitoring();
    }

    return () => {
      // Clean up on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active]);

  const startMonitoring = () => {
    // Initial prediction
    fetchEmotion();
    
    // Set up interval (every 5 seconds)
    intervalRef.current = setInterval(fetchEmotion, 5000);
    console.log("EEG emotion monitoring started");
  };

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log("EEG emotion monitoring stopped");
    }
  };

  const fetchEmotion = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const detectedEmotion = await eegEogService.sendEegEogData();
      
      // Map emotion to type
      let newEmotionType: 'neutral' | 'positive' | 'negative' | 'warning' = 'neutral';
      if (['happy', 'surprise'].includes(detectedEmotion.toLowerCase())) {
        newEmotionType = 'positive';
      } else if (['sad', 'angry', 'fear', 'disgust'].includes(detectedEmotion.toLowerCase())) {
        newEmotionType = 'negative';
      } else if (['contempt'].includes(detectedEmotion.toLowerCase())) {
        newEmotionType = 'warning';
      }
      
      // Update state
      setEmotion(detectedEmotion);
      setEmotionType(newEmotionType);
      
      // Create a new emotion history entry
      const now = new Date();
      const newEntry: EegEmotionEntry = {
        emotion: detectedEmotion,
        emotionType: newEmotionType,
        timestamp: now,
        formattedTime: format(now, 'HH:mm:ss')
      };
      
      // Update history with functional update
      setEmotionHistory(prevHistory => {
        const updatedHistory = [newEntry, ...prevHistory];
        // Limit history to 50 entries
        const trimmedHistory = updatedHistory.slice(0, 50);
        
        // Save to localStorage
        try {
          localStorage.setItem('eegEmotionHistory', JSON.stringify(trimmedHistory));
        } catch (error) {
          console.error("Error saving EEG emotion history:", error);
        }
        
        // Notify parent if callback exists
        if (onHistoryUpdate) {
          setTimeout(() => onHistoryUpdate(trimmedHistory), 0);
        }
        
        return trimmedHistory;
      });
      
      // Notify parent of emotion update
      if (onEmotionUpdate) {
        onEmotionUpdate(detectedEmotion, newEmotionType);
      }
      
    } catch (error) {
      console.error("Error fetching EEG emotion:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get styling for different emotion types
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
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* EEG Monitor Visualization */}
      <div className="relative h-32 bg-black rounded-lg overflow-hidden">
        {/* Brain wave animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "h-1/2 w-full",
            "bg-gradient-to-r from-purple-500 to-blue-500",
            "animate-pulse-slow",
            isProcessing ? "opacity-80" : "opacity-40"
          )}
          style={{
            maskImage: 'url("/eeg-wave.svg")',
            maskSize: 'cover',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: 'url("/eeg-wave.svg")',
            WebkitMaskSize: 'cover',
            WebkitMaskRepeat: 'no-repeat',
          }}
          />
        </div>
        
        {/* Status indicator */}
        <div className="absolute top-2 right-2 flex items-center space-x-1">
          <div className={cn(
            "w-2 h-2 rounded-full",
            active ? "bg-green-500 animate-pulse" : "bg-red-500"
          )}></div>
          <span className="text-xs text-white opacity-75">
            {active ? (isProcessing ? "Processing" : "Active") : "Inactive"}
          </span>
        </div>
        
        {/* Emotion display */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 
                    px-3 py-1 bg-black bg-opacity-60 rounded-full">
          <span className="text-sm font-medium text-white">
            {emotion}
          </span>
        </div>
      </div>
      
      {/* Controls and emotion indicator */}
      <div className="flex items-center justify-between">
        <button 
          className={cn(
            "px-3 py-1 rounded-md text-sm font-medium",
            active ? "bg-red-500 text-white" : "bg-green-500 text-white"
          )}
          onClick={() => setActive(!active)}
        >
          {active ? "Stop Monitoring" : "Start Monitoring"}
        </button>
        
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

export default EegEmotionMonitor; 