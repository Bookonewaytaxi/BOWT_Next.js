import React from 'react';
import BookingSummarySection from './BookingSummarySection';
import PriceBreakdownSection from './PriceBreakdownSection';
import PaymentDetailsSection from './PaymentDetailsSection';
import InvoiceSection from './InvoiceSection';
import { useBillingCalculations } from '@/hooks/useBillingCalculations';
import { generateInvoiceNumber } from '@/utils/billingUtils';

export default function BillingDetailsCard({ 
  booking, 
  bill, 
  onDownloadInvoice, 
  onEmailInvoice, 
  onBillUpdated, // NEW PROP
  isDownloading, 
  isSending 
}) {
  const { calculateSubtotalFromTotal, calculateTax, calculateTotal } = useBillingCalculations();

  // Derived Data
  const hasBill = !!bill;
  
  // Amounts - Prefer Bill, fallback to Booking
  const totalAmount = hasBill ? (bill.total_amount || 0) : (booking.total_amount || 0);
  const paidAmount = hasBill ? (bill.advance_amount || 0) : (booking.advance_amount || 0);
  
  // Logic: Assume Total is inclusive of Tax if not specified otherwise
  // For breakdown display
  const subtotal = calculateSubtotalFromTotal(totalAmount);
  const tax = calculateTax(subtotal);
  
  // Payment Info
  const paymentStatus = hasBill ? bill.payment_status : booking.payment_status;
  const paymentMethod = hasBill ? bill.payment_mode : booking.payment_mode;
  
  // Invoice Info
  const invoiceNumber = hasBill ? bill.bill_number : generateInvoiceNumber(booking.booking_ref_id);
  const invoiceDate = hasBill ? bill.created_at : null;
  const invoiceStatus = hasBill ? (bill.status || 'Generated') : 'Pending';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-1">
      {/* Column 1: Summary */}
      <div className="lg:col-span-1">
        <BookingSummarySection booking={booking} />
      </div>

      {/* Column 2: Pricing & Payment */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <PriceBreakdownSection 
          baseFare={0} // Not explicitly tracked, subtotal used
          distance={booking.distance_km || bill?.distance_km}
          subtotal={subtotal}
          tax={tax}
          total={totalAmount}
          carType={booking.car_type}
        />
        <PaymentDetailsSection 
          status={paymentStatus}
          method={paymentMethod}
          transactionId={booking.transaction_id}
          date={booking.updated_at}
          amountPaid={paidAmount}
          totalAmount={totalAmount}
        />
      </div>

      {/* Column 3: Invoice Actions */}
      <div className="lg:col-span-2 xl:col-span-1">
        <InvoiceSection 
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          status={invoiceStatus}
          bill={bill} // Pass full bill object
          onDownload={onDownloadInvoice}
          onEmail={onEmailInvoice}
          onBillUpdated={onBillUpdated} // Pass handler
          isDownloading={isDownloading}
          isSending={isSending}
          hasBill={hasBill}
        />
      </div>
    </div>
  );
}