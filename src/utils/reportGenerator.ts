import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface ReportData {
  patientName: string;
  patientId: string;
  sessionDate: Date;
  ecgData?: { time: string; value: number }[];
  eegData?: { time: string; value: number }[];
  emotionalStates?: { time: string; emotion: string; source: string }[];
  brainWaveTexts?: { time: string; text: string; confidence: number }[];
  psychAssessment?: {
    state: string;
    confidence: number;
    tags: string[];
    recommendation?: string;
  };
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    previousAutoTableEndY: number;
  }
}

export const generatePDFReport = (data: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header
  doc.setFontSize(20);
  doc.text('Mind State Navigator Report', pageWidth / 2, 20, { align: 'center' });
  
  // Patient info
  doc.setFontSize(12);
  doc.text(`Patient: ${data.patientName}`, 20, 35);
  doc.text(`ID: ${data.patientId}`, 20, 42);
  doc.text(`Session Date: ${format(data.sessionDate, 'PPP')}`, 20, 49);
  doc.text(`Report Generated: ${format(new Date(), 'PPP pp')}`, 20, 56);
  
  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 60, pageWidth - 20, 60);
  
  // Section 1: ECG and EEG Data
  doc.setFontSize(16);
  doc.text('1. Physiological Data Analysis', 20, 70);
  
  // ECG Data Table
  doc.setFontSize(14);
  doc.text('ECG Data (Sample)', 20, 80);
  
  if (data.ecgData && data.ecgData.length > 0) {
    doc.autoTable({
      startY: 85,
      head: [['Time', 'Value']],
      body: data.ecgData.slice(0, 5).map(item => [item.time, item.value.toFixed(2)]),
      theme: 'striped',
      headStyles: { fillColor: [155, 135, 245] }
    });
    
    // EEG Data Table
    doc.text('EEG Data (Sample)', 20, doc.previousAutoTableEndY + 15);
    
    if (data.eegData && data.eegData.length > 0) {
      doc.autoTable({
        startY: doc.previousAutoTableEndY + 20,
        head: [['Time', 'Value']],
        body: data.eegData.slice(0, 5).map(item => [item.time, item.value.toFixed(2)]),
        theme: 'striped',
        headStyles: { fillColor: [155, 135, 245] }
      });
    }
  }
  
  // Section 2: Emotional States
  doc.text('2. Emotional State Analysis', 20, doc.previousAutoTableEndY + 20);
  
  if (data.emotionalStates && data.emotionalStates.length > 0) {
    doc.autoTable({
      startY: doc.previousAutoTableEndY + 25,
      head: [['Time', 'Emotion', 'Source']],
      body: data.emotionalStates.slice(0, 10).map(item => [item.time, item.emotion, item.source]),
      theme: 'striped',
      headStyles: { fillColor: [155, 135, 245] }
    });
  }
  
  // Add a new page if needed
  if (doc.previousAutoTableEndY > 220) {
    doc.addPage();
  }
  
  // Section 3: Brain Wave Interpretation
  doc.text('3. Brain Wave Interpretation', 20, doc.previousAutoTableEndY + 20);
  
  if (data.brainWaveTexts && data.brainWaveTexts.length > 0) {
    doc.autoTable({
      startY: doc.previousAutoTableEndY + 25,
      head: [['Time', 'Interpreted Text', 'Confidence']],
      body: data.brainWaveTexts.slice(0, 5).map(item => [
        item.time, 
        item.text, 
        `${item.confidence}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [155, 135, 245] }
    });
  }
  
  // Section 4: Psychological Assessment
  doc.text('4. AI Psychological Assessment', 20, doc.previousAutoTableEndY + 20);
  
  if (data.psychAssessment) {
    doc.setFontSize(12);
    doc.text(`Assessment: ${data.psychAssessment.state}`, 25, doc.previousAutoTableEndY + 30);
    doc.text(`Confidence: ${data.psychAssessment.confidence}%`, 25, doc.previousAutoTableEndY + 37);
    doc.text(`Tags: ${data.psychAssessment.tags.join(', ')}`, 25, doc.previousAutoTableEndY + 44);
    
    if (data.psychAssessment.recommendation) {
      doc.text('Recommendation:', 25, doc.previousAutoTableEndY + 51);
      doc.setFontSize(10);
      
      const splitText = doc.splitTextToSize(
        data.psychAssessment.recommendation, 
        pageWidth - 50
      );
      
      doc.text(splitText, 30, doc.previousAutoTableEndY + 58);
    }
  }
  
  // Footer
  const getHeight = () => {
    const pageCount = doc.pages.length;
    const totalPages = pageCount;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Mind State Navigator - Page ${i} of ${totalPages}`, 
        pageWidth / 2, 
        doc.internal.pageSize.height - 10, 
        { align: 'center' }
      );
    }
  }
  
  getHeight();
  
  return doc.output('blob');
};
