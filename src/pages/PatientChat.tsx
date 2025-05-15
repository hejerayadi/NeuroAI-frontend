
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Video, VideoOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

const PatientChat = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    {role: 'assistant', content: 'Hello! I am your NeuroAI assistant. How are you feeling today?'}
  ]);
  const [input, setInput] = useState('');
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Toggle webcam on/off
  const toggleWebcam = async () => {
    if (isWebcamOn) {
      // Turn off webcam
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamOn(false);
    } else {
      // Turn on webcam
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsWebcamOn(true);
      } catch (error) {
        console.error('Error accessing webcam:', error);
        toast({
          variant: "destructive",
          title: "Webcam Error",
          description: "Unable to access your webcam. Please check your permissions.",
        });
      }
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = getAIResponse(userMessage.content);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    }, 1000);
  };

  // Simple response generator (simulate AI)
  const getAIResponse = (userInput: string): string => {
    const lowercaseInput = userInput.toLowerCase();
    
    if (lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
      return 'Hello! How are you feeling today?';
    }
    else if (lowercaseInput.includes('sad') || lowercaseInput.includes('depressed')) {
      return "I'm sorry to hear that you're feeling down. Would you like to talk about what's bothering you?";
    }
    else if (lowercaseInput.includes('happy') || lowercaseInput.includes('good')) {
      return "That's great! What's been making you feel positive?";
    }
    else if (lowercaseInput.includes('anxious') || lowercaseInput.includes('nervous')) {
      return "Anxiety can be challenging. Let's focus on some deep breathing exercises. Take a deep breath in for 4 counts, hold for 2, and exhale for 6.";
    }
    else {
      return "Thank you for sharing. I'm here to listen and help. Is there anything specific you'd like to discuss about how you're feeling?";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-mind-purple mr-2" />
          <h1 className="text-xl font-semibold">NeuroAI Patient Portal</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={toggleWebcam}
          className="flex items-center gap-2"
        >
          {isWebcamOn ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          {isWebcamOn ? 'Turn Off Camera' : 'Turn On Camera'}
        </Button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 max-w-7xl mx-auto w-full">
        {/* Chat window */}
        <Card className="flex-1 flex flex-col h-[calc(100vh-8rem)]">
          <div className="p-4 border-b">
            <h2 className="font-medium">Chat with NeuroAI</h2>
            <p className="text-sm text-gray-500">Share how you're feeling and get support</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
        
        {/* Webcam view */}
        <Card className="w-full md:w-96 h-96 md:h-[calc(100vh-8rem)] flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-medium">Video Feed</h2>
            <p className="text-sm text-gray-500">Your facial expressions help us analyze your emotional state</p>
          </div>
          <div className="flex-1 bg-black flex items-center justify-center">
            {isWebcamOn ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white text-center p-4">
                <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Camera is turned off</p>
                <p className="text-sm opacity-70 mt-2">Enable the camera to allow emotion analysis</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientChat;
