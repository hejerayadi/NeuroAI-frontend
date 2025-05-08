
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Gamepad, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const SessionStart = () => {
  const navigate = useNavigate();
  const [showPatientInput, setShowPatientInput] = useState(false);
  const [sessionType, setSessionType] = useState<'normal' | 'gaming'>('normal');
  const [patientName, setPatientName] = useState('');
  
  const handleSessionTypeSelection = (type: 'normal' | 'gaming') => {
    setSessionType(type);
    setShowPatientInput(true);
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName.trim()) {
      toast({
        variant: "destructive",
        title: "Patient name required",
        description: "Please enter the patient's name before starting the session.",
      });
      return;
    }

    // Store patient name in session storage to retrieve it in the dashboard
    sessionStorage.setItem('patientName', patientName);
    sessionStorage.setItem('sessionType', sessionType);
    
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
      
      {!showPatientInput ? (
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            onClick={() => handleSessionTypeSelection('normal')}
            size="lg"
            className="bg-mind-purple hover:bg-mind-purple/90 text-white px-8 py-6 text-lg h-auto"
          >
            <Play className="mr-2" /> 
            Start Normal Session
          </Button>

          <Button 
            onClick={() => handleSessionTypeSelection('gaming')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg h-auto"
          >
            <Gamepad className="mr-2" />
            Start Gaming Session
          </Button>
        </div>
      ) : (
        <form onSubmit={handleStartSession} className="flex flex-col items-center gap-4 w-full max-w-md">
          <div className="w-full">
            <label htmlFor="patientName" className="block mb-2 text-sm font-medium text-gray-700">
              Patient Name
            </label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              className="w-full"
              autoFocus
            />
          </div>
          
          <Button 
            type="submit"
            size="lg"
            className={`${
              sessionType === 'normal' 
                ? 'bg-mind-purple hover:bg-mind-purple/90' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white px-8 py-6 text-lg h-auto w-full`}
          >
            {sessionType === 'normal' ? <Play className="mr-2" /> : <Gamepad className="mr-2" />}
            Start {sessionType === 'normal' ? 'Normal' : 'Gaming'} Session
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            onClick={() => setShowPatientInput(false)}
            className="mt-2"
          >
            Back to Session Type Selection
          </Button>
        </form>
      )}
      
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
