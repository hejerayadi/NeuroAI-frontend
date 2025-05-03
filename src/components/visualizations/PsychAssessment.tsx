
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

interface PsychAssessmentProps {
  assessment: {
    state: string;
    confidence: number;
    tags: string[];
    recommendation?: string;
  };
  className?: string;
}

const PsychAssessment: React.FC<PsychAssessmentProps> = ({ assessment, className }) => {
  const { state, confidence, tags, recommendation } = assessment;
  
  // Determine the confidence level styling
  const getConfidenceColor = () => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className={cn("bg-white rounded-lg border p-4", className)}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{state}</h3>
          <p className="text-sm text-gray-500">AI-assisted assessment</p>
        </div>
        <div className={cn("text-sm font-medium", getConfidenceColor())}>
          {confidence}% confidence
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="bg-mind-softgray text-gray-700">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      {recommendation && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Recommendation</h4>
          <p className="text-sm text-gray-600">{recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default PsychAssessment;
