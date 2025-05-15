
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, MessageCircle, User, Settings, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const patientName = sessionStorage.getItem('patientName') || 'Patient';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-mind-purple mr-2" />
          <h1 className="text-xl font-semibold">NeuroAI Patient Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            size="sm"
          >
            <Home className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {patientName}</h2>
            <p className="text-gray-600">Manage your mental wellness journey</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-mind-purple" />
                Chat with NeuroAI
              </CardTitle>
              <CardDescription>Share your thoughts and get support</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                Our AI assistant is trained to provide mental health support and track your emotional state.
              </p>
              <Button 
                className="w-full"
                onClick={() => navigate('/patient')}
              >
                Start Chat
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-mind-purple" />
                Session History
              </CardTitle>
              <CardDescription>View your past sessions and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                Access historical data from your previous sessions with our NeuroAI system.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => toast({
                  title: "Coming Soon",
                  description: "Session history feature will be available in a future update.",
                })}
              >
                View History
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-mind-purple" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                Update your profile, notification preferences, and privacy settings.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => toast({
                  title: "Coming Soon",
                  description: "Account settings will be available in a future update.",
                })}
              >
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
