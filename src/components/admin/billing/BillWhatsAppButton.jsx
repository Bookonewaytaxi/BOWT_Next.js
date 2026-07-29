import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateBillPDF } from '@/utils/BillPDFGenerator';
import { supabase } from '@/lib/customSupabaseClient';

export default function BillWhatsAppButton({ bill, className, variant = "outline", size = "sm" }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!bill) return;
    
    setLoading(true);
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const filename = `INV-${bill.booking_ref || bill.bill_number}-${date.toISOString().split('T')[0]}.pdf`;
      const filePath = `invoices/${year}/${month}/${filename}`;

      // 1. Generate PDF Blob
      const pdfBlob = await generateBillPDF(bill);

      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents') // Assuming 'documents' bucket exists, or user might need to create it
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw new Error("Upload failed: " + uploadError.message);

      // 3. Get Signed URL
      const { data: signedUrlData, error: signError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60 * 24 * 30); // 30 days

      if (signError) throw new Error("Could not generate link: " + signError.message);
      
      const shareLink = signedUrlData.signedUrl;
      
      // 4. Open WhatsApp
      const message = `Here is your invoice for booking ${bill.booking_ref || ''}. You can download it here: ${shareLink}`;
      const encodedMessage = encodeURIComponent(message);
      const phone = bill.customer_phone ? bill.customer_phone.replace(/\D/g, '') : '';
      
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: "WhatsApp Opened",
        description: "Review message and send.",
        className: "bg-green-600 text-white"
      });

    } catch (error) {
      console.error('WhatsApp Share Error:', error);
      toast({
        variant: "destructive",
        title: "Share Failed",
        description: error.message || "Could not share on WhatsApp."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={`text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 ${className}`} 
      onClick={handleShare}
      disabled={loading}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
      Share WhatsApp
    </Button>
  );
}