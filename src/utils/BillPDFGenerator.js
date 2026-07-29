import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import { createRoot } from 'react-dom/client';
import BillTemplate from '@/components/admin/BillTemplate';

export const generateBillPDF = async (billData, filename = 'invoice.pdf') => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '800px'; // A4 approximate width in pixels at 96 DPI
      document.body.appendChild(container);

      // Render the BillTemplate into the container
      const root = createRoot(container);
      
      // Wrap in a promise to wait for render
      await new Promise((resolveRender) => {
        root.render(
          React.createElement(
            'div',
            { className: 'p-8 bg-white text-slate-900', style: { width: '100%', minHeight: '1123px' } },
            React.createElement(BillTemplate, { bill: billData })
          )
        );
        // Give React a moment to render
        setTimeout(resolveRender, 500);
      });

      // Capture with html2canvas
      const canvas = await html2canvas(container, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Generate PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add extra pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const pdfBlob = pdf.output('blob');
      
      // Cleanup
      root.unmount();
      document.body.removeChild(container);
      
      resolve(pdfBlob);
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};

export const downloadPDF = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};