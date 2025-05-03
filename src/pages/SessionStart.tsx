
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";

const SessionStart = () => {
  const navigate = useNavigate();
  
  const handleStartSession = () => {
    // In a real app, we would initialize session data here
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center mb-8">
        <Brain className="w-16 h-16 text-mind-purple mb-4" />
        <h1 className="text-3xl font-bold mb-2">Mind State Navigator</h1>
        <p className="text-gray-600 text-center max-w-md">
          Start a new session to monitor patient's mental and emotional state in real-time
        </p>
      </div>
      
      <Button 
        onClick={handleStartSession}
        size="lg"
        className="bg-mind-purple hover:bg-mind-purple/90 text-white px-8 py-6 text-lg h-auto"
      >
        Start New Session
      </Button>
      
      <div className="mt-12 text-sm text-gray-500 max-w-md text-center">
        <p>
          Starting a new session will initialize recording from all connected monitoring devices. 
          Make sure the patient is properly connected to ECG, EEG, and other monitoring equipment.
        </p>
      </div>
    </div>
  );
};

export default SessionStart;
