import jsPDF from 'jspdf';
import { formatCurrency } from '@/utils/billingUtils';

export const generateAdvancedPDF = (booking) => {
  const doc = new jsPDF();
  
  // Constants
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = 20;

  // --- Header ---
  doc.setFontSize(22);
  doc.setTextColor(245, 158, 11); // Amber-500 roughly
  doc.text("ONE WAY TAXI", margin, y);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Excellence Defined", margin, y + 6);

  // Invoice Details (Right Aligned)
  doc.setFontSize(24);
  doc.setTextColor(0);
  doc.text("INVOICE", pageWidth - margin, y, { align: "right" });
  
  y += 20;
  doc.setFontSize(10);
  doc.setTextColor(100);
  
  const invNo = booking.booking_ref_id || (booking.id ? booking.id.slice(0, 8) : 'DRAFT');
  const dateStr = new Date().toLocaleDateString();
  
  doc.text(`Invoice No: ${invNo}`, pageWidth - margin, y, { align: "right" });
  y += 5;
  doc.text(`Date: ${dateStr}`, pageWidth - margin, y, { align: "right" });
  y += 5;
  doc.text(`Booking ID: ${invNo}`, pageWidth - margin, y, { align: "right" });

  y += 15;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- Two Columns: Bill To & Trip Details ---
  const col2X = pageWidth / 2 + 10;
  
  // Col 1: Bill To
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont(undefined, 'bold');
  doc.text("BILL TO:", margin, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  doc.text(booking.name || '', margin, y);
  y += 5;
  doc.text(booking.mobile_number || '', margin, y);
  y += 5;
  if (booking.email) doc.text(booking.email, margin, y);

  // Col 2: Trip Summary
  let rightY = y - 16; 
  doc.setFont(undefined, 'bold');
  doc.text("TRIP SUMMARY:", col2X, rightY);
  doc.setFont(undefined, 'normal');
  rightY += 6;
  doc.text(`Type: ${booking.service_type || booking.trip_type || 'One Way'}`, col2X, rightY);
  rightY += 5;
  doc.text(`Vehicle: ${booking.car_type || 'Taxi'}`, col2X, rightY);
  rightY += 5;
  doc.text(`Route: ${booking.from_city} -> ${booking.to_city}`, col2X, rightY);

  y = Math.max(y, rightY) + 15;

  // --- Route Details Box ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(margin, y, contentWidth, 30, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 30, 'S');
  
  const boxY = y + 10;
  doc.setFont(undefined, 'bold');
  doc.text("Pickup:", margin + 5, boxY);
  doc.setFont(undefined, 'normal');
  doc.text(`${booking.pickup_date} ${booking.pickup_time || ''}`, margin + 25, boxY);
  doc.text(booking.pickup_location || 'N/A', margin + 25, boxY + 5);

  doc.setFont(undefined, 'bold');
  doc.text("Drop:", col2X, boxY);
  doc.setFont(undefined, 'normal');
  doc.text(booking.drop_location || 'N/A', col2X + 15, boxY);
  
  y += 45;

  // --- Vehicle & Payment ---
  doc.setFontSize(10);
  doc.text(`Vehicle No: ${booking.driver_car_no || 'N/A'}`, margin, y);
  doc.text(`Driver: ${booking.driver_name || 'N/A'} (${booking.driver_phone || 'N/A'})`, margin + 80, y);
  y += 7;
  doc.text(`Payment: ${booking.payment_mode || 'Cash'} - ${booking.payment_status || 'Pending'}`, margin, y);
  
  y += 15;

  // --- Fare Table ---
  // Headings
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 10, 'F');
  doc.setTextColor(255);
  doc.setFont(undefined, 'bold');
  doc.text("DESCRIPTION", margin + 5, y + 7);
  doc.text("AMOUNT", pageWidth - margin - 5, y + 7, { align: "right" });
  
  y += 10;
  doc.setTextColor(0);
  doc.setFont(undefined, 'normal');
  
  // Rows
  const addRow = (label, amount) => {
    if (amount === undefined || amount === null) return;
    y += 10;
    doc.text(label, margin + 5, y);
    doc.text(formatCurrency(amount), pageWidth - margin - 5, y, { align: "right" });
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 3, pageWidth - margin, y + 3);
  };

  const finalFare = Number(booking.final_fare) || 0;
  const gst = Number(booking.gst_amount) || 0;
  
  addRow("Base Fare", finalFare);
  if (gst > 0) addRow("GST (5%)", gst);
  
  // Total
  y += 15;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 6, contentWidth, 12, 'F');
  doc.setFont(undefined, 'bold');
  doc.text("TOTAL PAYABLE", margin + 5, y + 2);
  doc.setFontSize(12);
  doc.text(formatCurrency(Number(booking.total_payable) || 0), pageWidth - margin - 5, y + 2, { align: "right" });

  // --- Footer ---
  const footerY = 270;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Terms & Conditions:", margin, footerY);
  doc.text("1. This is a computer generated invoice.", margin, footerY + 5);
  doc.text("2. Payment due immediately.", margin, footerY + 9);
  
  doc.text("Contact: +91 1234567890 | support@onewaytaxi.com", pageWidth - margin, footerY + 9, { align: "right" });
  
  return doc.output('blob');
};