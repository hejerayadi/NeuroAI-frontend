import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import SimpleLineChart from '../charts/LineChart';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { log } from 'console';
import { format } from 'date-fns';

// Define interface for emotion history entries
export interface SpeechEmotionEntry {
  emotion: string;
  timestamp: Date;
  formattedTime: string;
}

interface ToneAnalysisProps {
  emotion: string;
  emotionType: 'neutral' | 'positive' | 'negative' | 'warning';
  className?: string;
  onEmotionUpdate?: (emotion: string, emotionType: 'neutral' | 'positive' | 'negative' | 'warning') => void;
  onHistoryUpdate?: (history: SpeechEmotionEntry[]) => void;
}

// Function to convert an audio buffer to WAV format
const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numOfChannels * 2; // 2 bytes per sample
  const sampleRate = buffer.sampleRate;
  const output = new ArrayBuffer(44 + length);
  const view = new DataView(output);

  // RIFF chunk descriptor
  writeUTFBytes(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeUTFBytes(view, 8, 'WAVE');

  // FMT sub-chunk
  writeUTFBytes(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // 16 for PCM format
  view.setUint16(20, 1, true); // Type of format (1 is PCM)
  view.setUint16(22, numOfChannels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, sampleRate * 2 * numOfChannels, true); // Byte rate (sample rate * block align)
  view.setUint16(32, numOfChannels * 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample

  // Data sub-chunk
  writeUTFBytes(view, 36, 'data');
  view.setUint32(40, length, true); // Size of sub-chunk

  // Write the PCM samples
  let offset = 44;
  let channelData = null;
  let result;
  
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channelData = buffer.getChannelData(i);
    for (let j = 0; j < channelData.length; j++) {
      // Clamp between -1 and 1
      result = Math.max(-1, Math.min(1, channelData[j]));
      // Convert to 16-bit PCM
      result = result < 0 ? result * 0x8000 : result * 0x7FFF;
      view.setInt16(offset, result, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
};

// Helper function for writing strings to data view
const writeUTFBytes = (view: DataView, offset: number, string: string): void => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Convert Blob to AudioBuffer
const blobToAudioBuffer = async (blob: Blob, audioContext: AudioContext): Promise<AudioBuffer> => {
  const arrayBuffer = await blob.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
};

const ToneAnalysis: React.FC<ToneAnalysisProps> = ({ 
  emotion: initialEmotion = 'neutral',
  emotionType: initialEmotionType = 'neutral',
  className,
  onEmotionUpdate,
  onHistoryUpdate
}) => {
  // Microphone state
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [emotion, setEmotion] = useState(initialEmotion);
  const [emotionType, setEmotionType] = useState(initialEmotionType);
  const [isConverting, setIsConverting] = useState(false);
  // Add state for emotion history
  const [emotionHistory, setEmotionHistory] = useState<SpeechEmotionEntry[]>([]);

  // Audio visualization state
  const [audioData, setAudioData] = useState<number[]>(Array(25).fill(0));
  const [waveformData, setWaveformData] = useState<{time: string; value: number}[]>(
    Array.from({ length: 100 }, (_, i) => ({ time: `${i}`, value: 0 }))
  );

  // Refs for audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const processingRef = useRef<boolean>(false);
  const dataIndexRef = useRef<number>(0);

  // Load history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('speechEmotionHistory');
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
      console.error("Error loading speech emotion history:", error);
      // Initialize with empty array if error
      setEmotionHistory([]);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (emotionHistory.length > 0) {
      try {
        localStorage.setItem('speechEmotionHistory', JSON.stringify(emotionHistory));
        
        // Notify parent component of updated history
        if (onHistoryUpdate) {
          onHistoryUpdate(emotionHistory);
        }
      } catch (error) {
        console.error("Error saving speech emotion history:", error);
      }
    }
  }, [emotionHistory]);

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

  // Handle microphone setup, start/stop 
  useEffect(() => {
    if (microphoneActive && !micStreamRef.current) {
      activateMicrophone();
    } else if (!microphoneActive && micStreamRef.current) {
      deactivateMicrophone();
    }

    return () => {
      if (micStreamRef.current) {
        deactivateMicrophone();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [microphoneActive]);

  const activateMicrophone = async () => {
    try {
      // Request microphone access
      const micStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      micStreamRef.current = micStream;
      setHasPermission(true);
      console.log("Microphone activated");
      
      // Setup audio context
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Increased for better resolution
      
      const bufferLength = analyser.frequencyBinCount;
      
      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(micStream);
      source.connect(analyser);
      
      // Store references
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Setup MediaRecorder with WAV format if supported
      let options: MediaRecorderOptions | undefined;
      
      // Check if audio/wav is supported, otherwise fall back to default
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        options = { mimeType: 'audio/wav' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        console.log("audio/wav not supported, using audio/webm");
        options = { mimeType: 'audio/webm' };
      } else {
        console.log("No standard audio formats supported, using default codec");
        options = undefined;
      }
      
      console.log(`Using mime type: ${options?.mimeType || 'default'}`);
      const mediaRecorder = new MediaRecorder(micStream, options);
      mediaRecorderRef.current = mediaRecorder;

      // Handle recording data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (!processingRef.current && audioChunksRef.current.length > 0) {
          processingRef.current = true;
          processAudioForEmotion();
        }
      };

      // Reset the waveform data to all zeros before starting visualization
      setWaveformData(Array.from({ length: 100 }, (_, i) => ({ time: `${i}`, value: 0 })));
      dataIndexRef.current = 0;
      
      // Start visualization
      updateVisualization();

      // Start recording interval - record 2.5 seconds every 5 seconds
      startRecordingInterval();
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setHasPermission(false);
      setMicrophoneActive(false);
    }
  };

  const deactivateMicrophone = () => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop recording interval
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop microphone stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    // Reset audio chunks
    audioChunksRef.current = [];

    // Reset the waveform data
    setWaveformData(Array.from({ length: 100 }, (_, i) => ({ time: `${i}`, value: 0 })));

    console.log("Microphone deactivated");
  };

  const toggleMicrophone = () => {
    setMicrophoneActive(!microphoneActive);
  };

  const updateVisualization = () => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    
    // For frequency visualization (bar graph)
    const frequencyData = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(frequencyData);
    
    // For waveform visualization
    const timeData = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(timeData);

    // Update bar visualization with frequency data
    const normalizedFreqData = Array.from(frequencyData.slice(0, 25)).map(value => value / 255);
    setAudioData(normalizedFreqData);

    // Update waveform data for scrolling chart
    // Create a new array with the same length as the current waveformData
    const newWaveformData = [...waveformData];
    
    // Get a sample from the time domain data
    const sampleSize = Math.floor(timeData.length / 10); // Take fewer samples for smoother line
    
    // Add a new data point and shift everything left
    for (let i = 0; i < newWaveformData.length - 1; i++) {
      newWaveformData[i] = { 
        time: `${i}`,
        value: newWaveformData[i + 1].value
      };
    }
    
    // Calculate the new value for the rightmost position
    // Use the average of a small section of the time domain data
    let sum = 0;
    for (let i = 0; i < sampleSize; i++) {
      // Normalize the value to be between -1 and 1
      sum += ((timeData[i] / 128.0) - 1.0);
    }
    const avgValue = sum / sampleSize;
    
    // Set the rightmost value
    newWaveformData[newWaveformData.length - 1] = {
      time: `${dataIndexRef.current++}`,
      value: avgValue * 3 // Scale up for better visibility
    };
    
    setWaveformData(newWaveformData);

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(updateVisualization);
  };

  const startRecordingInterval = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    recordingIntervalRef.current = setInterval(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        audioChunksRef.current = []; // Clear any previous chunks
        console.log("Starting 3.0 second recording");
        mediaRecorderRef.current.start();
        
        // Stop recording after 2.5 seconds
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            console.log("Recording stopped, processing...");
          }
        }, 3000);
      }
    }, 1000);
  };

  const processAudioForEmotion = async () => {
    if (audioChunksRef.current.length === 0) {
      processingRef.current = false;
      return;
    }

    try {
      // Create blob from recorded chunks - this will likely be audio/webm on most browsers
      const originalBlob = new Blob(audioChunksRef.current);
      console.log(`Original audio format: ${originalBlob.type}`); 
      
      // Create an AudioContext for conversion if we need to convert from webm to wav
      let audioBlob = originalBlob;
      
      if (originalBlob.type !== 'audio/wav') {
        setIsConverting(true);
        console.log("Converting from webm to wav format...");
        try {
          // Create new audio context for conversion
          const tempAudioContext = new AudioContext();
          
          // Convert blob to audio buffer
          const audioBuffer = await blobToAudioBuffer(originalBlob, tempAudioContext);
          
          // Convert audio buffer to WAV blob
          audioBlob = audioBufferToWav(audioBuffer);
          
          console.log(`Conversion complete. New format: ${audioBlob.type}`);
        } catch (conversionError) {
          console.error("Error converting audio format:", conversionError);
          // Fall back to original format if conversion fails
          audioBlob = originalBlob;
        } finally {
          setIsConverting(false);
        }
      }

      console.log("Sending audio to API for emotion detection");
      
      // Create form data and add the audio
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      
      // Log form data (won't show contents in console)
      console.log("FormData created with audio blob");
      console.log(`Audio blob size: ${(audioBlob.size / 1024).toFixed(2)} KB`);
      
      // Check if file was actually appended by trying to get it back
      const formFile = formData.get('file');
      console.log("FormData contains file:", formFile instanceof Blob);
      if (formFile instanceof Blob) {
        console.log(`FormData file type: ${(formFile as Blob).type}`);
        console.log(`FormData file size: ${((formFile as Blob).size / 1024).toFixed(2)} KB`);
      }
      
      // Send to API
      const response = await fetch('http://localhost:7500/predict/speech', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Speech emotion API response:", data);
      
      if (data && data.prediction) {
        // Update emotion
        setEmotion(data.prediction);
        
        // Map emotion to type
        let newEmotionType: 'neutral' | 'positive' | 'negative' | 'warning' = 'neutral';
        if (['happy', 'surprise'].includes(data.prediction)) {
          newEmotionType = 'positive';
        } else if (['sad', 'angry', 'fear', 'disgust'].includes(data.prediction)) {
          newEmotionType = 'negative';
        } else if (['contempt'].includes(data.prediction)) {
          newEmotionType = 'warning';
        }
        
        setEmotionType(newEmotionType);
        
        // Create a new emotion history entry
        const now = new Date();
        const newEntry: SpeechEmotionEntry = {
          emotion: data.prediction,
          timestamp: now,
          formattedTime: format(now, 'HH:mm:ss')
        };
        
        // Add to history (prepend to show newest first)
        // Use functional update to avoid closure issues with stale state
        setEmotionHistory(prevHistory => {
          const updatedHistory = [newEntry, ...prevHistory];
          // Limit history to 50 entries
          const trimmedHistory = updatedHistory.slice(0, 50);
          
          // Save to localStorage
          try {
            localStorage.setItem('speechEmotionHistory', JSON.stringify(trimmedHistory));
          } catch (error) {
            console.error("Error saving to localStorage:", error);
          }
          
          // Notify parent if callback exists
          if (onHistoryUpdate) {
            setTimeout(() => onHistoryUpdate(trimmedHistory), 0);
          }
          
          return trimmedHistory;
        });
        
        console.log(`Speech emotion updated to: ${data.prediction} (${newEmotionType})`);
        
        // Notify parent if callback exists
        if (onEmotionUpdate) {
          onEmotionUpdate(data.prediction, newEmotionType);
        }
      }
    } catch (error) {
      console.error("Error processing audio for emotion detection:", error);
    } finally {
      audioChunksRef.current = [];
      processingRef.current = false;
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Waveform visualization */}
      {/* <div className="h-36 mb-4">
        <SimpleLineChart 
          data={waveformData} 
          dataKey="value" 
          color="#22c55e" 
          height={130}
          animated={true}
        />
      </div> */}
      
      {/* Audio visualization (real data) */}
      <div className="h-12 w-full bg-gray-100 rounded-lg mb-4 overflow-hidden">
        <div className="h-full flex items-center justify-around">
          {audioData.map((value, i) => (
            <div 
              key={i} 
              className="bg-green-400 w-1" 
              style={{ 
                height: `${Math.max(5, value * 100)}%`,
                opacity: Math.max(0.5, value)
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Controls and emotion display */}
      <div className="flex items-center justify-between mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleMicrophone}
          className="flex items-center gap-2"
          disabled={isConverting}
        >
          {microphoneActive ? (
            <>
              <MicOff size={16} />
              <span>Stop Mic</span>
            </>
          ) : (
            <>
              <Mic size={16} />
              <span>Start Mic</span>
            </>
          )}
        </Button>

        <div className={cn(
          "px-4 py-2 rounded-full font-medium text-center",
          getEmotionTypeStyle(emotionType),
          "animate-pulse-soft"
        )}>
          {isConverting ? 'Converting...' : emotion}
        </div>
      </div>
    </div>
  );
};

export default ToneAnalysis;
