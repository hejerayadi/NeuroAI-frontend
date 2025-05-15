
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Adding types for jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export const generatePatientReport = (patientData: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.text('Patient Report', pageWidth / 2, 15, { align: 'center' });

  // Patient Information
  doc.setFontSize(14);
  let startY = 30;
  doc.text(`Patient Name: ${patientData.patientName}`, 20, startY);
  doc.text(`Session Type: ${patientData.sessionType}`, 20, startY + 10);
  doc.text(`Report Date: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 20, startY + 20);

  // Emotion History Table
  doc.setFontSize(16);
  startY += 30;
  doc.text('Emotion History', pageWidth / 2, startY, { align: 'center' });

  const emotionHistoryData = patientData.emotionHistory.map((item: any) => [
    item.time,
    item.emotion,
    item.source,
    item.text,
  ]);

  doc.autoTable({
    head: [['Time', 'Emotion', 'Source', 'Text']],
    body: emotionHistoryData,
    startY: startY + 10,
    margin: { horizontal: 20 },
    columnStyles: { 3: { cellWidth: 'auto' } },
  });
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
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
  
  return doc.output('blob');
};

// Adding the function that is referenced in Reports.tsx
export const generatePDFReport = (reportData: any) => {
  // Create a report based on the provided data
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.text('NeuroAI Session Report', pageWidth / 2, 15, { align: 'center' });

  // Patient Information
  doc.setFontSize(14);
  let startY = 30;
  doc.text(`Patient Name: ${reportData.patientName}`, 20, startY);
  doc.text(`Patient ID: ${reportData.patientId}`, 20, startY + 10);
  doc.text(`Session Date: ${format(reportData.sessionDate, 'MMMM dd, yyyy HH:mm')}`, 20, startY + 20);

  // Emotional States Table
  doc.setFontSize(16);
  startY += 40;
  doc.text('Emotional States History', pageWidth / 2, startY, { align: 'center' });

  const emotionalStatesData = reportData.emotionalStates.map((item: any) => [
    item.time,
    item.emotion,
    item.source
  ]);

  doc.autoTable({
    head: [['Time', 'Emotional State', 'Source']],
    body: emotionalStatesData,
    startY: startY + 10,
    margin: { horizontal: 20 },
  });

  // Brain Wave Text Table
  startY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(16);
  doc.text('Brain Wave Text Interpretations', pageWidth / 2, startY, { align: 'center' });

  const brainWaveData = reportData.brainWaveTexts.map((item: any) => [
    item.time,
    item.text,
    `${item.confidence}%`
  ]);

  doc.autoTable({
    head: [['Time', 'Interpreted Text', 'Confidence']],
    body: brainWaveData,
    startY: startY + 10,
    margin: { horizontal: 20 },
    columnStyles: { 1: { cellWidth: 'auto' } },
  });

  // Psychological Assessment
  startY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(16);
  doc.text('Psychological Assessment', pageWidth / 2, startY, { align: 'center' });
  
  doc.setFontSize(12);
  const splitText = doc.splitTextToSize(reportData.psychAssessment, pageWidth - 40);
  doc.text(splitText, 20, startY + 10);

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `NeuroAI - Session Report - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
};
