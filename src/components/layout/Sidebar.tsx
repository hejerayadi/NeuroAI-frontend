
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Brain, HeartPulse, AudioWaveform, MessageSquare, ChartLine, Activity, LogOut } from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  onEndSession?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-2 px-3 py-2 text-left",
        active ? "bg-mind-softgray text-mind-darkpurple font-medium" : "text-gray-600 hover:bg-mind-softgray hover:text-mind-darkpurple"
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </Button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onEndSession }) => {
  const [activeItem, setActiveItem] = useState("dashboard");

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <Activity size={18} /> },
    { id: "eeg", label: "EEG Analysis", icon: <Brain size={18} /> },
    { id: "ecg", label: "Heart Rate", icon: <HeartPulse size={18} /> },
    { id: "speech", label: "Speech Analysis", icon: <MessageSquare size={18} /> },
    { id: "brain-waves", label: "Brain Waves", icon: <AudioWaveform size={18} /> },
    { id: "reports", label: "Reports", icon: <ChartLine size={18} /> }
  ];

  return (
    <aside className="hidden md:flex md:w-56 lg:w-64 flex-col h-screen bg-white border-r p-4">
      <div className="flex items-center gap-2 mb-6 px-3 py-2">
        <Brain className="w-6 h-6 text-mind-purple" />
        <h2 className="text-lg font-bold">Mind State</h2>
      </div>
      
      <div className="space-y-1">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          />
        ))}
      </div>
      
      <div className="mt-auto pt-4 border-t">
        <div className="flex items-center px-3 py-2 mb-4">
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
          onClick={onEndSession}
        >
          <LogOut size={16} />
          End Session
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
