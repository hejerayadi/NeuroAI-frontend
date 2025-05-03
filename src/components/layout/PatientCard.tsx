
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface PatientCardProps {
  className?: string;
  children: React.ReactNode;
  title: string;
  description?: string;
}

const PatientCard = ({ className, children, title, description }: PatientCardProps) => {
  return (
    <Card className={cn("shadow-sm animate-fade-in", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default PatientCard;
