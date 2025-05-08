
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { addImage } from "jspdf"; // This is a mock import, in real life we would import appropriate data
import { 
  generateEcgData, 
  generateEegData, 
  getRandomAssessment, 
  getRandomBrainWaveText, 
  getRandomEmotion,
  getPatientData
} from './dummyData';

// Extend the jsPDF type to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    previousAutoTableEndY?: number;
  }
}

interface ReportData {
  patientName: string;
  sessionDate: string;
  sessionDuration: string;
  patientId: string;
  ecgData: { time: string; value: number }[];
  eegData: { time: string; value: number }[];
  ecgEmotion: string;
  eegEmotion: string;
  facialEmotion: string;
  speechEmotion: string;
  brainWaveTexts: string[];
  assessment: string;
}

// Function to generate dummy report data
const generateReportData = (): ReportData => {
  const patient = getPatientData();
  
  return {
    patientName: patient.name,
    sessionDate: new Date().toLocaleDateString(),
    sessionDuration: '45 minutes',
    patientId: patient.id,
    ecgData: generateEcgData(10),
    eegData: generateEegData(10),
    ecgEmotion: getRandomEmotion('ecg'),
    eegEmotion: getRandomEmotion('eeg'),
    facialEmotion: getRandomEmotion('facial'),
    speechEmotion: getRandomEmotion('speech'),
    brainWaveTexts: [
      getRandomBrainWaveText(),
      getRandomBrainWaveText(),
      getRandomBrainWaveText()
    ],
    assessment: getRandomAssessment()
  };
};

export const generatePdfReport = () => {
  // Create a new PDF document
  const doc = new jsPDF();
  const data = generateReportData();
  
  // Add a header with the Mind State Navigator logo and title
  doc.setFillColor(75, 85, 99);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('Mind State Navigator - Session Report', 105, 10, { align: 'center' });

  // Add report summary section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Session Summary', 14, 30);
  
  doc.setFontSize(10);
  doc.setLineWidth(0.1);
  doc.line(14, 32, 196, 32);
  
  // Patient information
  doc.setFontSize(11);
  doc.text(`Patient Name: ${data.patientName}`, 14, 40);
  doc.text(`Patient ID: ${data.patientId}`, 14, 46);
  doc.text(`Session Date: ${data.sessionDate}`, 14, 52);
  doc.text(`Session Duration: ${data.sessionDuration}`, 14, 58);

  // ECG Data Section
  doc.setFontSize(14);
  doc.text('1. ECG Data Analysis', 14, 70);
  doc.setFontSize(10);
  doc.line(14, 72, 196, 72);
  
  // Add ECG data table
  doc.autoTable({
    startY: 75,
    head: [['Time', 'Value']],
    body: data.ecgData.map(item => [item.time, item.value.toFixed(2)]),
    theme: 'striped',
    headStyles: { fillColor: [117, 107, 177] },
    margin: { left: 14, right: 14 },
  });
  
  // Add ECG emotion data
  let currentY = doc.previousAutoTableEndY || 90;
  doc.setFontSize(11);
  doc.text(`Emotional State from ECG: ${data.ecgEmotion}`, 14, currentY + 10);
  
  // EEG Data Section
  doc.setFontSize(14);
  doc.text('2. EEG Data Analysis', 14, currentY + 20);
  doc.setFontSize(10);
  doc.line(14, currentY + 22, 196, currentY + 22);
  
  // Add EEG data table
  doc.autoTable({
    startY: currentY + 25,
    head: [['Time', 'Value']],
    body: data.eegData.map(item => [item.time, item.value.toFixed(2)]),
    theme: 'striped',
    headStyles: { fillColor: [117, 107, 177] },
    margin: { left: 14, right: 14 },
  });

  // Add EEG emotion data
  currentY = doc.previousAutoTableEndY || (currentY + 40);
  doc.setFontSize(11);
  doc.text(`Emotional State from EEG: ${data.eegEmotion}`, 14, currentY + 10);
  
  // Check if we need a new page for the emotional patterns section
  if (currentY > 180) {
    doc.addPage();
    currentY = 20;
  }
  
  // Emotional Patterns Section
  doc.setFontSize(14);
  doc.text('3. Emotional State Patterns', 14, currentY + 20);
  doc.setFontSize(10);
  doc.line(14, currentY + 22, 196, currentY + 22);
  
  // Add emotion data table
  doc.autoTable({
    startY: currentY + 25,
    head: [['Source', 'Detected Emotion']],
    body: [
      ['ECG', data.ecgEmotion],
      ['EEG', data.eegEmotion],
      ['Facial Expression', data.facialEmotion],
      ['Speech', data.speechEmotion]
    ],
    theme: 'striped',
    headStyles: { fillColor: [117, 107, 177] },
    margin: { left: 14, right: 14 },
  });
  
  // Brain Wave Text Interpretation Section
  currentY = doc.previousAutoTableEndY || (currentY + 50);
  
  // Check if we need a new page
  if (currentY > 180) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY += 10;
  }
  
  doc.setFontSize(14);
  doc.text('4. Brain Wave Speech Interpretation Logs', 14, currentY + 10);
  doc.setFontSize(10);
  doc.line(14, currentY + 12, 196, currentY + 12);
  
  // Add brain wave text data
  doc.setFontSize(11);
  data.brainWaveTexts.forEach((text, index) => {
    doc.text(`${index + 1}. "${text}"`, 14, currentY + 20 + (index * 8));
  });
  
  // AI Psychological Assessment
  currentY += 45;
  
  // Check if we need a new page
  if (currentY > 180) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(14);
  doc.text('5. AI-Assisted Psychological Assessment', 14, currentY);
  doc.setFontSize(10);
  doc.line(14, currentY + 2, 196, currentY + 2);
  
  doc.setFontSize(11);
  
  // Word wrap the assessment text to fit in the page
  const splitText = doc.splitTextToSize(data.assessment, 170);
  doc.text(splitText, 14, currentY + 10);
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Mind State Navigator - Confidential Medical Report - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
  }
  
  // Save the PDF
  doc.save(`mind_state_report_${data.patientId}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
