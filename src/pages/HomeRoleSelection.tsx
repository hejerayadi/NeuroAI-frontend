
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, User, UserCog } from 'lucide-react';
import { Button } from "@/components/ui/button";

const HomeRoleSelection = () => {
  const navigate = useNavigate();
  
  const handleRoleSelection = (role: 'doctor' | 'patient') => {
    if (role === 'doctor') {
      navigate('/doctor');
    } else {
      // Redirect patients to patient dashboard instead of directly to chat
      navigate('/patient-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center mb-8">
        <Brain className="w-16 h-16 text-mind-purple mb-4" />
        <h1 className="text-3xl font-bold mb-2">Welcome to NeuroAI</h1>
        <p className="text-gray-600 text-center max-w-md">
          Choose your role to continue
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mt-4">
        <Button 
          onClick={() => handleRoleSelection('doctor')}
          size="lg"
          className="bg-mind-purple hover:bg-mind-purple/90 text-white px-8 py-6 text-lg h-auto w-64"
        >
          <UserCog className="mr-2 h-6 w-6" /> 
          Doctor
        </Button>

        <Button 
          onClick={() => handleRoleSelection('patient')}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg h-auto w-64"
        >
          <User className="mr-2 h-6 w-6" />
          Patient
        </Button>
      </div>
      
      <div className="mt-12 text-sm text-gray-500 max-w-md text-center">
        <p>
          NeuroAI helps monitor and analyze mental and emotional states using advanced AI technology.
        </p>
      </div>
    </div>
  );
};

export default HomeRoleSelection;
