import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Video, VideoOff, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

const PatientChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{role: 'user' | 'assistant' | 'system', content: string}[]>([
    {role: 'assistant', content: 'Hello! I am your NeuroAI assistant. How are you feeling today?'}
  ]);
  const [input, setInput] = useState('');
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inSession, setInSession] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  // Check initial session state
  useEffect(() => {
    const checkSessionState = async () => {
      try {
        const response = await fetch('http://localhost:1234/api/session');
        const data = await response.json();
        setInSession(data.in_session);
      } catch (error) {
        console.error('Error fetching session state:', error);
        toast({
          variant: "destructive",
          title: "API Error",
          description: "Could not connect to the psychology agent API. Is the server running?",
        });
      }
    };
    
    checkSessionState();
  }, []);

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
      setWebcamError(null);
      console.log('Webcam turned off');
    } else {
      // Turn on webcam
      try {
        console.log('Attempting to access webcam...');
        const constraints = { 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Webcam access granted:', stream);
        
        // Set webcam on first, then let useEffect handle connecting the stream
        setIsWebcamOn(true);
        setWebcamError(null);
      } catch (error) {
        console.error('Error accessing webcam:', error);
        let errorMessage = 'Unable to access your webcam. Please check your permissions.';
        
        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError') {
            errorMessage = 'Camera access denied. Please allow camera access in your browser settings.';
          } else if (error.name === 'NotFoundError') {
            errorMessage = 'No camera detected. Please connect a camera and try again.';
          } else if (error.name === 'NotReadableError') {
            errorMessage = 'Camera is in use by another application. Please close other apps using the camera.';
          }
        }
        
        setWebcamError(errorMessage);
        setIsWebcamOn(false);
        
        toast({
          variant: "destructive",
          title: "Webcam Error",
          description: errorMessage,
        });
      }
    }
  };

  // Handle webcam stream connection when isWebcamOn changes
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const setupWebcam = async () => {
      if (isWebcamOn) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 640 },
              height: { ideal: 480 }
            } 
          });
          
          console.log('Setting up webcam in useEffect', videoRef.current);
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              console.log('Video metadata loaded, playing video');
              videoRef.current?.play().catch(e => {
                console.error('Error playing video:', e);
                setWebcamError(`Error playing video: ${e.message}`);
              });
            };
          } else {
            console.error('Video ref is still not available in useEffect');
            setWebcamError('Video element not available. Please try again.');
            setIsWebcamOn(false);
          }
        } catch (error) {
          console.error('Error in webcam useEffect:', error);
          setWebcamError('Error connecting to webcam in initialization phase');
          setIsWebcamOn(false);
        }
      }
    };
    
    setupWebcam();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWebcamOn]);

  // Additional useEffect to handle cleanup of webcam on component unmount
  useEffect(() => {
    return () => {
      // Cleanup function to stop all tracks when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle therapy session
  const toggleSession = async () => {
    setIsLoading(true);
    
    try {
      const action = inSession ? 'end' : 'start';
      const response = await fetch('http://localhost:1234/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setInSession(data.in_session);
        
        // Add system message to chat
        const message = data.in_session 
          ? 'Therapy session started. You can speak freely in this safe space.'
          : 'Therapy session ended. Thank you for sharing today.';
          
        setMessages(prev => [...prev, { role: 'system', content: message }]);
        
        toast({
          title: data.in_session ? "Session Started" : "Session Ended",
          description: message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Session Error",
          description: data.message || "Unable to change session state",
        });
      }
    } catch (error) {
      console.error('Error toggling session:', error);
      toast({
        variant: "destructive",
        title: "API Error",
        description: "Could not connect to the psychology agent API",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send request to Flask API
      const response = await fetch('http://localhost:1234/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add agent response to chat
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.response },
        ]);
        
        // Update session state if it changed
        if (data.in_session !== inSession) {
          setInSession(data.in_session);
        }
      } else {
        // Handle error
        toast({
          variant: "destructive",
          title: "API Error",
          description: data.error || "An error occurred processing your message",
        });
        
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Sorry, an error occurred processing your message.' },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the psychology agent API. Is the server running?",
      });
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I cannot connect to the backend server. Please check if it is running.' },
      ]);
    } finally {
      setIsLoading(false);
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
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={toggleWebcam}
            className="flex items-center gap-2"
          >
            {isWebcamOn ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            {isWebcamOn ? 'Turn Off Camera' : 'Turn On Camera'}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 max-w-7xl mx-auto w-full">
        {/* Chat window */}
        <Card className="flex-1 flex flex-col h-[calc(100vh-8rem)]">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="font-medium">Chat with NeuroAI</h2>
              <p className="text-sm text-gray-500">Share how you're feeling and get support</p>
            </div>
            <Button
              onClick={toggleSession}
              disabled={isLoading}
              className={`${
                inSession
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {isLoading ? 'Processing...' : inSession ? 'End Session' : 'Start Session'}
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${
                  message.role === 'user' 
                    ? 'justify-end' 
                    : message.role === 'system'
                    ? 'justify-center'
                    : 'justify-start'
                }`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.role === 'system'
                      ? 'bg-yellow-100 text-gray-800 text-center'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          
          {/* Session indicator */}
          <div className="px-4 pb-2 text-center text-sm">
            {inSession ? (
              <span className="text-green-600 font-semibold">
                ● Therapy Session Active
              </span>
            ) : (
              <span className="text-gray-600">
                General Assistant Mode
              </span>
            )}
          </div>
        </Card>
        
        {/* Webcam view */}
        <Card className="w-full md:w-96 h-96 md:h-[calc(100vh-32rem)] flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-medium">Video Feed</h2>
            <p className="text-sm text-gray-500">Your facial expressions help us analyze your emotional state</p>
          </div>
          <div className="flex-1 bg-black flex items-center justify-center relative">
            {isWebcamOn ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                {webcamError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="text-white text-center p-4">
                      <p className="font-bold">Camera Error</p>
                      <p>{webcamError}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-white text-center p-4">
                <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Camera is turned off</p>
                <p className="text-sm opacity-70 mt-2">Enable the camera to allow emotion analysis</p>
                {webcamError && <p className="text-red-400 mt-2">{webcamError}</p>}
              </div>
            )}
          </div>
          <div className="p-2 text-center">
            <Button
              variant="outline"
              onClick={toggleWebcam}
              className="w-full flex items-center justify-center gap-2"
            >
              {isWebcamOn ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              {isWebcamOn ? 'Turn Off Camera' : 'Turn On Camera'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientChat;
