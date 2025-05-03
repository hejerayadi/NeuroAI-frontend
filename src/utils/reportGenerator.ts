
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getPatientData } from './dummyData';

// Define the report data structure
interface ReportData {
  ecgData: Array<{time: string, value: number}>;
  eegData: Array<{time: string, value: number}>;
  emotionalStates: Array<{source: string, emotion: string, timestamp: string}>;
  brainWaveTexts: Array<{text: string, confidence: number, timestamp: string}>;
  assessment: {
    state: string;
    confidence: number;
    tags: string[];
    recommendation?: string;
  };
}

// Generate dummy report data
const generateReportData = (): ReportData => {
  const timestamps = Array.from({ length: 10 }, (_, i) => 
    new Date(Date.now() - (10 - i) * 5 * 60000).toLocaleTimeString()
  );
  
  // Sample emotions for the report
  const emotions = ['Calm', 'Anxious', 'Focused', 'Distracted', 'Stressed', 'Relaxed', 'Worried', 'Content'];
  const sources = ['ECG', 'EEG', 'Facial', 'Speech'];
  
  // Sample brain wave texts
  const brainWaveTexamples = [
    "I need to focus on my breathing",
    "Why am I feeling this way?",
    "I should try to relax more",
    "I'm worried about tomorrow",
    "This session is helping me",
    "Maybe I should talk about my week",
    "I'm starting to feel better"
  ];
  
  return {
    ecgData: Array.from({ length: 5 }, (_, i) => ({
      time: timestamps[i * 2],
      value: Math.round((Math.sin(i * 0.5) * 5 + 70 + Math.random() * 5) * 10) / 10
    })),
    eegData: Array.from({ length: 5 }, (_, i) => ({
      time: timestamps[i * 2],
      value: Math.round((Math.cos(i * 0.3) * 3 + Math.random() * 2) * 10) / 10
    })),
    emotionalStates: Array.from({ length: 8 }, (_, i) => ({
      source: sources[i % sources.length],
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
      timestamp: timestamps[i]
    })),
    brainWaveTexts: Array.from({ length: 5 }, (_, i) => ({
      text: brainWaveTexamples[Math.floor(Math.random() * brainWaveTexamples.length)],
      confidence: Math.round(60 + Math.random() * 35),
      timestamp: timestamps[i * 2]
    })),
    assessment: {
      state: 'Mild Anxiety Disorder',
      confidence: 87,
      tags: ['Anxious', 'Stressed', 'Worried', 'Responsive'],
      recommendation: 'Consider scheduling weekly sessions focusing on stress management techniques. Patient shows signs of mild anxiety that could benefit from cognitive behavioral therapy approaches.'
    }
  };
};

// Generate PDF report
export const generatePdfReport = () => {
  const pdf = new jsPDF();
  const patientData = getPatientData();
  const reportData = generateReportData();
  const currentDate = new Date().toLocaleDateString();
  
  // Title and header
  pdf.setFontSize(22);
  pdf.setTextColor(85, 51, 139); // Purple color
  pdf.text('Mind State Navigator', 105, 15, { align: 'center' });
  
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Session Report', 105, 25, { align: 'center' });
  
  // Patient information
  pdf.setFontSize(12);
  pdf.text(`Patient: ${patientData.name}`, 20, 40);
  pdf.text(`Patient ID: ${patientData.id}`, 20, 48);
  pdf.text(`Session Date: ${currentDate}`, 20, 56);
  pdf.text(`Session Duration: 45 minutes`, 20, 64);
  
  // 1. ECG and EEG Data Analysis
  pdf.setFontSize(14);
  pdf.setTextColor(85, 51, 139);
  pdf.text('1. ECG and EEG Data Analysis', 20, 80);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  // ECG Data Table
  pdf.text('ECG Data (Heart Rate):', 20, 90);
  autoTable(pdf, {
    startY: 95,
    head: [['Timestamp', 'BPM']],
    body: reportData.ecgData.map(data => [data.time, data.value.toString()]),
    theme: 'striped',
    headStyles: { fillColor: [155, 135, 245] }
  });
  
  // EEG Data Table
  pdf.text('EEG Data (Brain Activity):', 20, pdf.lastAutoTable.finalY + 15);
  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 20,
    head: [['Timestamp', 'Value']],
    body: reportData.eegData.map(data => [data.time, data.value.toString()]),
    theme: 'striped',
    headStyles: { fillColor: [155, 135, 245] }
  });
  
  // 2. Emotional State Patterns
  pdf.setFontSize(14);
  pdf.setTextColor(85, 51, 139);
  pdf.text('2. Emotional State Patterns and Transitions', 20, pdf.lastAutoTable.finalY + 20);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 25,
    head: [['Time', 'Source', 'Detected Emotion']],
    body: reportData.emotionalStates.map(item => [item.timestamp, item.source, item.emotion]),
    theme: 'striped',
    headStyles: { fillColor: [155, 135, 245] }
  });
  
  // Add a new page for the rest of the content
  pdf.addPage();
  
  // 3. Brain Wave Speech Interpretation
  pdf.setFontSize(14);
  pdf.setTextColor(85, 51, 139);
  pdf.text('3. Brain Wave Speech Interpretation Logs', 20, 20);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  autoTable(pdf, {
    startY: 25,
    head: [['Time', 'Interpreted Text', 'Confidence']],
    body: reportData.brainWaveTexts.map(item => [
      item.timestamp, 
      item.text, 
      `${item.confidence}%`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [155, 135, 245] }
  });
  
  // 4. AI Psychological Assessment
  pdf.setFontSize(14);
  pdf.setTextColor(85, 51, 139);
  pdf.text('4. AI-assisted Psychological Assessment', 20, pdf.lastAutoTable.finalY + 20);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Assessment: ${reportData.assessment.state}`, 20, pdf.lastAutoTable.finalY + 30);
  pdf.text(`Confidence: ${reportData.assessment.confidence}%`, 20, pdf.lastAutoTable.finalY + 38);
  
  // Tags
  pdf.text('Tags:', 20, pdf.lastAutoTable.finalY + 46);
  let tagsText = reportData.assessment.tags.join(', ');
  pdf.text(tagsText, 40, pdf.lastAutoTable.finalY + 46);
  
  // Recommendation
  if (reportData.assessment.recommendation) {
    pdf.text('Recommendation:', 20, pdf.lastAutoTable.finalY + 54);
    
    // Handle multi-line recommendation text
    const splitText = pdf.splitTextToSize(
      reportData.assessment.recommendation, 
      170 // max width
    );
    
    pdf.text(splitText, 20, pdf.lastAutoTable.finalY + 62);
  }
  
  // Summary and signature
  pdf.text('Generated by Mind State Navigator AI System', 105, 250, { align: 'center' });
  pdf.text(`Report Date: ${currentDate}`, 105, 258, { align: 'center' });
  
  // Save the PDF
  pdf.save(`Patient_Report_${patientData.id}_${currentDate.replace(/\//g, '-')}.pdf`);
};
