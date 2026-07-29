import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateBillPDF, downloadPDF } from '@/utils/BillPDFGenerator';

export default function BillDownloadButton({ bill, className, variant = "default", size = "sm" }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!bill) return;
    
    setLoading(true);
    try {
      const dateStr = bill.invoice_date || new Date().toISOString().split('T')[0];
      const filename = `INV-${bill.booking_ref || bill.bill_number}-${dateStr}.pdf`;
      
      const pdfBlob = await generateBillPDF(bill);
      downloadPDF(pdfBlob, filename);
      
      toast({
        title: "Download Started",
        description: "Your invoice PDF is downloading.",
        className: "bg-green-600 text-white"
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not generate PDF invoice."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
      Download PDF
    </Button>
  );
}