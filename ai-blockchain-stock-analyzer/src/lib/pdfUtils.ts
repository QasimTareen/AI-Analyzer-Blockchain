import { jsPDF } from 'jspdf';
import { LedgerRecord } from '../types';

export const generateAnalysisPDF = (record: LedgerRecord) => {
  console.log('Generating PDF for record:', record.id, record.stockName);
  try {
    const doc = new jsPDF();
    const margin = 20;
    let cursorY = margin;

    const stockTitle = record.stockName || 'Stock Analysis';
    const analysisDate = record.analysisDate ? new Date(record.analysisDate).toLocaleString() : 'N/A';

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('AI Blockchain Stock Analysis', margin, cursorY);
    cursorY += 15;

    // Record Info
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Stock Identifier: ${stockTitle}`, margin, cursorY);
    cursorY += 7;
    doc.text(`Timestamp: ${analysisDate}`, margin, cursorY);
    cursorY += 15;

    // Signal
    doc.setFontSize(16);
    const signal = (record.predictionResult || 'NEUTRAL').toUpperCase();
    if (signal === 'BUY') {
      doc.setTextColor(16, 185, 129); // emerald-500
    } else if (signal === 'SELL') {
      doc.setTextColor(239, 68, 68); // rose-500
    } else {
      doc.setTextColor(107, 114, 128); // slate-500
    }
    doc.text(`Recommendation: ${signal}`, margin, cursorY);
    cursorY += 10;

    // Metrics
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const displayPrice = typeof record.price === 'number' ? record.price.toLocaleString() : '0.00';
    doc.text(`Execution Price: $${displayPrice}`, margin, cursorY);
    cursorY += 7;
    doc.text(`AI Confidence Index: ${record.confidence || 0}%`, margin, cursorY);
    cursorY += 15;

    // Reasoning
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Strategic Insights:', margin, cursorY);
    cursorY += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const reasoningText = record.reasoning || 'No further analysis reasoning provided for this record.';
    const splitText = doc.splitTextToSize(reasoningText, 170);
    doc.text(splitText, margin, cursorY);
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('This document is AI-generated and for informational purposes only.', margin, pageHeight - 15);
    doc.text(`Report ID: ${record.id}`, margin, pageHeight - 10);

    const fileName = `${stockTitle.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`;
    console.log('Finalizing PDF construction...');
    
    // Using Blob and dynamic link for maximum compatibility in iframes
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    console.log('Download initiated successfully');
    return true;
  } catch (error: any) {
    console.error('PDF Engine Failure:', error);
    alert(`ENGINE_ERROR: ${error.message || 'Generation failed'}`);
    throw error;
  }
};
