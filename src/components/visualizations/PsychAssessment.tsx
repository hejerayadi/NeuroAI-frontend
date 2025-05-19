import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

interface PsychAssessmentProps {
  assessment: {
    emotionalState: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
    insights: string[];
  };
  className?: string;
}

const PsychAssessment: React.FC<PsychAssessmentProps> = ({ assessment, className }) => {
  const { emotionalState, recommendations, riskLevel, insights } = assessment;
  
  // Determine the risk level styling
  const getRiskLevelColor = () => {
    switch (riskLevel) {
      case 'high':
        return "text-red-600";
      case 'medium':
        return "text-amber-600";
      case 'low':
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={cn(
      "rounded-lg border p-5 shadow-md bg-mind-softgray border-l-4 border-mind-darkpurple", 
      className
    )}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{emotionalState}</h3>
          <p className="text-sm text-gray-500">AI-assisted assessment</p>
        </div>
        <div className={cn("text-md font-medium", getRiskLevelColor())}>
          Risk Level: {riskLevel.toUpperCase()}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
        <ul className="list-disc list-inside space-y-1">
          {recommendations.map((rec, index) => (
            <li key={index} className="text-sm text-gray-600">{rec}</li>
          ))}
        </ul>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Key Insights</h4>
        <ul className="list-disc list-inside space-y-1">
          {insights.map((insight, index) => (
            <li key={index} className="text-sm text-gray-600">{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PsychAssessment;
