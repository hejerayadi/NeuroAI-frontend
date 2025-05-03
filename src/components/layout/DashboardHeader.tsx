
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface DashboardHeaderProps {
  patientName: string;
  patientId: string;
  sessionTime: string;
  patientStatus: "active" | "inactive";
  patientImageUrl?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  patientName,
  patientId,
  sessionTime,
  patientStatus,
  patientImageUrl
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center mb-3 sm:mb-0">
        <Avatar className="h-12 w-12 mr-3">
          <AvatarImage src={patientImageUrl} />
          <AvatarFallback className="bg-mind-purple text-white">
            {patientName.split(' ').map(name => name[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{patientName}</h1>
          <p className="text-sm text-gray-500">Patient ID: {patientId}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>{sessionTime}</span>
        </div>
        <Badge variant="outline" className={`ml-0 sm:ml-2 ${patientStatus === "active" ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 text-gray-500 bg-gray-50"}`}>
          {patientStatus === "active" ? "Active Session" : "Inactive"}
        </Badge>
      </div>
    </div>
  );
};

export default DashboardHeader;
