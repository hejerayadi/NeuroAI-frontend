import React, { useState, useEffect, useRef } from 'react';
import SimpleLineChart from '../charts/LineChart';
import { cn } from '@/lib/utils';
import { generateAllEegWaves, generateEogData } from '@/utils/dummyData';
import EmotionTag from './EmotionTag';
import { eegEogService } from '@/utils/eegEogService';

interface EnhancedEegVisualizationProps {
  className?: string;
  emotion: string;
  emotionType: 'neutral' | 'positive' | 'negative' | 'warning';
  showEog?: boolean;
  onEmotionUpdate?: (emotion: string, emotionType: 'neutral' | 'positive' | 'negative' | 'warning') => void;
}

// Color palette for different EEG waves
const waveColors = {
  gamma: '#8A2BE2', // blueviolet
  beta: '#1E90FF',  // dodgerblue
  alpha: '#32CD32',  // limegreen
  theta: '#FFA500',  // orange
  delta: '#DC143C',  // crimson
  eog: '#4682B4'     // steelblue
};

const waveDescriptions = {
  gamma: 'Gamma (30-80 Hz): Cognitive processing, learning, memory',
  beta: 'Beta (13-30 Hz): Alert, focused, problem solving',
  alpha: 'Alpha (8-13 Hz): Relaxed, calm, creative',
  theta: 'Theta (4-8 Hz): Deep relaxation, meditation, memory',
  delta: 'Delta (0.5-4 Hz): Deep sleep, healing, regeneration',
  eog: 'EOG: Eye movement activity'
};

const EnhancedEegVisualization: React.FC<EnhancedEegVisualizationProps> = ({
  className,
  emotion,
  emotionType,
  showEog = true,
  onEmotionUpdate
}) => {
  // States for EEG wave data
  const [eegWaves, setEegWaves] = useState(generateAllEegWaves());
  const [eogData, setEogData] = useState(generateEogData(100));
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const emotionUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize monitoring
  useEffect(() => {
    if (isMonitoring) {
      startWaveMonitoring();
      startEmotionDetection();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isMonitoring]);

  const startWaveMonitoring = () => {
    if (monitoringIntervalRef.current) return;

    // Update wave forms every 200ms for smooth animation
    monitoringIntervalRef.current = setInterval(() => {
      updateWaveData();
    }, 200);
  };

  const startEmotionDetection = () => {
    if (emotionUpdateIntervalRef.current) return;
    
    // Call the API every 5 seconds
    emotionUpdateIntervalRef.current = setInterval(() => {
      fetchEegEogEmotion();
    }, 5000);
  };

  const stopMonitoring = () => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    
    if (emotionUpdateIntervalRef.current) {
      clearInterval(emotionUpdateIntervalRef.current);
      emotionUpdateIntervalRef.current = null;
    }
  };

  const updateWaveData = () => {
    // Shift all wave data by one position and add a new point
    setEegWaves(prevWaves => {
      const newWaves = { ...prevWaves };
      
      // Update each wave type
      Object.keys(newWaves).forEach(waveType => {
        const wave = newWaves[waveType as keyof typeof newWaves];
        const lastPoint = wave[wave.length - 1];
        
        // Calculate parameters based on wave type
        let baseFreq: number;
        let amplitude: number;
        let noise: number;
        
        switch (waveType) {
          case 'gamma':
            baseFreq = 0.4; amplitude = 0.5; noise = 0.2; break;
          case 'beta':
            baseFreq = 0.2; amplitude = 1; noise = 0.3; break;
          case 'alpha':
            baseFreq = 0.1; amplitude = 2; noise = 0.5; break;
          case 'theta':
            baseFreq = 0.05; amplitude = 2.5; noise = 0.7; break;
          case 'delta':
            baseFreq = 0.02; amplitude = 5; noise = 1; break;
          default:
            baseFreq = 0.1; amplitude = 1; noise = 0.5;
        }
        
        const time = parseInt(lastPoint.time) + 10;
        
        // Create a new wave point with continuous phase
        const phaseOffset = (Math.sin(time * baseFreq * 0.01) + 
                             Math.cos(time * baseFreq * 0.02 * 1.7)) * amplitude;
        const randomNoise = (Math.random() - 0.5) * noise;
        const value = phaseOffset + randomNoise;
        
        // Update the wave data with the new point
        newWaves[waveType as keyof typeof newWaves] = [
          ...wave.slice(1), 
          { time: `${time}ms`, value }
        ];
      });
      
      return newWaves;
    });
    
    // Update EOG data similarly
    setEogData(prevData => {
      const lastPoint = prevData[prevData.length - 1];
      const time = parseInt(lastPoint.time) + 5;
      
      // EOG has more sudden movements and longer steady periods
      const random = Math.random();
      let value;
      
      if (random > 0.95) {
        // Sudden large movement (blink or saccade)
        value = (Math.random() - 0.5) * 8;
      } else if (random > 0.8) {
        // Small movement
        value = lastPoint.value + (Math.random() - 0.5) * 2;
      } else {
        // Relatively stable with small drift
        value = lastPoint.value * 0.95 + (Math.random() - 0.5) * 0.5;
      }
      
      // Ensure values stay in reasonable range
      value = Math.max(-5, Math.min(5, value));
      
      return [...prevData.slice(1), { time: `${time}ms`, value }];
    });
  };

  const fetchEegEogEmotion = async () => {
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
      
      // Notify parent of emotion update
      if (onEmotionUpdate) {
        onEmotionUpdate(detectedEmotion, newEmotionType);
      }
      
      console.log(`EEG/EOG emotion detected: ${detectedEmotion} (${newEmotionType})`);
      
    } catch (error) {
      console.error("Error fetching EEG/EOG emotion:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Brain Wave Patterns</h3>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isMonitoring ? (isProcessing ? "bg-amber-500" : "bg-green-500 animate-pulse") : "bg-red-500"
          )}></div>
          <span className="text-sm text-gray-600">
            {isMonitoring ? (isProcessing ? "Processing" : "Monitoring") : "Paused"}
          </span>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={cn(
              "px-3 py-1 text-sm rounded-md",
              isMonitoring ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            )}
          >
            {isMonitoring ? "Pause" : "Start"}
          </button>
        </div>
      </div>
      
      {/* Emotion display */}
      <div className="flex justify-center mb-4">
        <EmotionTag
          emotion={emotion}
          type={emotionType}
          source="EEG/EOG"
          pulsing={true}
          className="transform scale-110"
        />
      </div>
      
      {/* Wave type charts */}
      <div className="space-y-6">
        {Object.entries(eegWaves).map(([waveType, waveData]) => (
          <div key={waveType} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{waveDescriptions[waveType as keyof typeof waveDescriptions]}</span>
            </div>
            <div className="h-16 bg-gray-50 border rounded-md">
              <SimpleLineChart
                data={waveData}
                dataKey="value"
                color={waveColors[waveType as keyof typeof waveColors]}
                height={64}
                showGrid={false}
                showAxis={false}
              />
            </div>
          </div>
        ))}
        
        {/* EOG chart */}
        {showEog && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{waveDescriptions.eog}</span>
            </div>
            <div className="h-16 bg-gray-50 border rounded-md">
              <SimpleLineChart
                data={eogData}
                dataKey="value"
                color={waveColors.eog}
                height={64}
                showGrid={false}
                showAxis={false}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="pt-2 text-xs text-center text-gray-500">
        <p>Showing real-time brain wave patterns and eye movement data</p>
        <p>Emotion analysis updated every 5 seconds</p>
      </div>
    </div>
  );
};

export default EnhancedEegVisualization; 