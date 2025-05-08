
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getPatientData } from './dummyData';

export const generatePdfReport = (patientName: string, sessionType: 'normal' | 'gaming') => {
  const doc = new jsPDF();
  const patient = getPatientData();
  const currentDate = new Date().toLocaleDateString();

  // Title
  doc.setFontSize(22);
  doc.setTextColor(44, 62, 80);
  doc.text("Mind State Navigator Report", 20, 20);

  // Patient info
  doc.setFontSize(12);
  doc.text(`Patient: ${patientName || patient.name}`, 20, 30);
  doc.text(`ID: ${patient.id}`, 20, 36);
  doc.text(`Session Type: ${sessionType === 'gaming' ? 'Gaming Analysis' : 'Standard Analysis'}`, 20, 42);
  doc.text(`Date: ${currentDate}`, 20, 48);
  doc.text(`Session Duration: ${patient.sessionTime}`, 20, 54);

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 60, 190, 60);

  // Report Summary
  doc.setFontSize(16);
  doc.text("Summary", 20, 70);
  doc.setFontSize(11);
  doc.text("This report provides a comprehensive analysis of the patient's neurological", 20, 80);
  doc.text("and emotional state during the recorded session.", 20, 86);

  // ECG Data Analysis
  doc.setFontSize(16);
  doc.text("1. ECG Data Analysis", 20, 100);
  doc.setFontSize(11);
  
  // Create sample ECG data for the report
  const ecgTable = [];
  for (let i = 0; i < 5; i++) {
    ecgTable.push([
      new Date(Date.now() - i * 60000).toLocaleTimeString(),
      (70 + Math.floor(Math.random() * 20)).toString(),
      ['Normal', 'Elevated', 'Normal', 'Calm', 'Normal'][i],
      ['Neutral', 'Anxious', 'Relaxed', 'Content', 'Focused'][i]
    ]);
  }

  autoTable(doc, {
    head: [['Timestamp', 'Heart Rate (BPM)', 'Status', 'Emotional Indicator']],
    body: ecgTable,
    startY: 105,
    theme: 'grid',
    styles: { fontSize: 9 }
  });

  // EEG Brain Wave Analysis
  doc.setFontSize(16);
  doc.text("2. EEG Brain Wave Analysis", 20, doc.lastAutoTable.finalY + 15);
  doc.setFontSize(11);
  
  // Create sample EEG data
  const eegTable = [];
  const waveTypes = ['Alpha', 'Beta', 'Theta', 'Delta', 'Gamma'];
  for (let i = 0; i < 5; i++) {
    eegTable.push([
      waveTypes[i],
      (10 + Math.floor(Math.random() * 20)).toString() + ' Hz',
      ['High', 'Normal', 'Low', 'Normal', 'Elevated'][i],
      ['Relaxation', 'Focus', 'Creativity', 'Deep Sleep', 'Information Processing'][i]
    ]);
  }

  autoTable(doc, {
    head: [['Wave Type', 'Frequency', 'Amplitude', 'Association']],
    body: eegTable,
    startY: doc.lastAutoTable.finalY + 20,
    theme: 'grid',
    styles: { fontSize: 9 }
  });

  // Brain Wave Speech Interpretation
  doc.setFontSize(16);
  doc.text("3. Brain Wave Speech Interpretation", 20, doc.lastAutoTable.finalY + 15);
  doc.setFontSize(11);
  doc.text("The following patterns were detected and interpreted:", 20, doc.lastAutoTable.finalY + 25);
  
  const brainWaveInterp = [
    "• \"I feel calm and relaxed during this session.\" (85% confidence)",
    "• \"The exercises are helping me focus better.\" (78% confidence)",
    "• \"I'm starting to understand the connection between thoughts and emotions.\" (80% confidence)"
  ];
  
  let y = doc.lastAutoTable.finalY + 30;
  brainWaveInterp.forEach(item => {
    doc.text(item, 25, y);
    y += 6;
  });

  // Psychological Assessment
  doc.setFontSize(16);
  doc.text("4. AI Psychological Assessment", 20, y + 10);
  doc.setFontSize(11);

  const assessment = {
    state: "The patient shows signs of mild anxiety with periods of calm and focus. The emotional patterns suggest an overall stable condition with brief fluctuations during specific stimuli.",
    confidence: 85,
    tags: ["Mild Anxiety", "Good Focus", "Emotional Stability", "Responsive"],
    recommendation: "Continue with the current therapy plan. Consider introducing more relaxation exercises during periods of elevated stress."
  };

  doc.text("Assessment:", 20, y + 20);
  
  // Word wrap for assessment text (simple implementation)
  const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let testWidth = 0;
    let currentY = y;

    for(let i = 0; i < words.length; i++) {
      testLine = line + words[i] + ' ';
      testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth && i > 0) {
        doc.text(line, x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    doc.text(line, x, currentY);
    return currentY;
  };

  let currentY = wrapText(assessment.state, 20, y + 25, 170, 6);
  
  doc.text(`Confidence: ${assessment.confidence}%`, 20, currentY + 10);
  
  doc.text("Tags:", 20, currentY + 20);
  doc.setFontSize(9);
  let tagX = 20;
  assessment.tags.forEach(tag => {
    const tagWidth = doc.getTextWidth(tag) + 10;
    if (tagX + tagWidth > 190) {
      tagX = 20;
      currentY += 8;
    }
    doc.text(tag, tagX, currentY + 26);
    tagX += tagWidth + 10;
  });
  
  doc.setFontSize(11);
  doc.text("Recommendation:", 20, currentY + 40);
  wrapText(assessment.recommendation, 20, currentY + 46, 170, 6);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Mind State Navigator - Generated on ${currentDate} - Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
  }

  return doc;
};
