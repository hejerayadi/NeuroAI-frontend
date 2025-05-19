import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Brain, HeartPulse, AudioWaveform, MessageSquare, ChartLine, Activity, Menu, LogOut, Camera, Loader2 } from "lucide-react";

interface MobileNavProps {
  onEndSession?: () => void;
  onSectionChange: (section: string) => void;
  activeSection: string;
  endSessionLoading?: boolean;
}

const MobileNav: React.FC<MobileNavProps> = ({ onEndSession, onSectionChange, activeSection, endSessionLoading }) => {
  const [open, setOpen] = useState(false);
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <Activity size={18} /> },
    { id: "eeg", label: "EEG Analysis", icon: <Brain size={18} /> },
    { id: "ecg", label: "Heart Rate", icon: <HeartPulse size={18} /> },
    { id: "facial-analysis", label: "Facial Analysis", icon: <Camera size={18} /> },
    { id: "speech", label: "Speech Analysis", icon: <MessageSquare size={18} /> },
    { id: "brain-waves", label: "Brain Waves", icon: <AudioWaveform size={18} /> },
    { id: "reports", label: "Reports", icon: <ChartLine size={18} /> }
  ];

  const handleNavItemClick = (id: string) => {
    onSectionChange(id);
    setOpen(false);
  };

  const handleEndSession = () => {
    setOpen(false);
    if (onEndSession) {
      onEndSession();
    }
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <div className="flex items-center gap-2 mb-6 px-2 py-4">
            <Brain className="w-6 h-6 text-mind-purple" />
            <h2 className="text-lg font-bold">NeuroAI</h2>
          </div>
          
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className="justify-start gap-2"
                onClick={() => handleNavItemClick(item.id)}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>
          
          <div className="mt-auto pt-4 border-t absolute bottom-20 left-4 right-4">
            <div className="flex items-center px-2 py-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-mind-purple text-white flex items-center justify-center mr-2">
                <span className="text-sm font-medium">DR</span>
              </div>
              <div>
                <p className="text-sm font-medium">Dr. Rebecca Chen</p>
                <p className="text-xs text-gray-500">Neuropsychologist</p>
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              className="w-full gap-2"
              onClick={handleEndSession}
              disabled={endSessionLoading}
            >
              {endSessionLoading ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
              {endSessionLoading ? 'Ending Session...' : 'End Session'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;
