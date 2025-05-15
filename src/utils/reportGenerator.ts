import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

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

  (doc as any).autoTable({
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
