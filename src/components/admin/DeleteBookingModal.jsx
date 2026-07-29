import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Trash } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function DeleteBookingModal({ isOpen, onClose, booking, onDeleteSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  if (!booking) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 1. Delete associated bills first (if foreign key constraints exist, otherwise skip)
      // Assuming cascade delete is set up on DB or manual cleanup needed:
      await supabase.from('bills').delete().eq('booking_id', booking.id);

      // 2. Delete booking
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Booking Deleted",
        description: `Booking #${booking.booking_ref_id || 'ID'} has been permanently removed.`,
        className: "bg-red-50 border-red-200 text-red-900"
      });

      onDeleteSuccess();
      onClose();
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete booking. Please try again."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !isDeleting && onClose(val)}>
      <DialogContent className="bg-[#1e293b] border-slate-700 text-slate-100 max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-red-500/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
             <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Delete Booking?</DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            This action cannot be undone. This will permanently delete booking 
            <span className="font-mono text-white font-bold ml-1">{booking.booking_ref_id}</span> 
            and remove all associated data from the server.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-3 my-2">
            <div className="flex justify-between text-xs text-red-200 mb-1">
                <span>Customer:</span>
                <span className="font-bold">{booking.name}</span>
            </div>
            <div className="flex justify-between text-xs text-red-200">
                <span>Route:</span>
                <span className="font-bold">{booking.from_city} → {booking.to_city}</span>
            </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => onClose(false)} 
            disabled={isDeleting}
            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isDeleting ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...
                </>
            ) : (
                <>
                    <Trash className="h-4 w-4 mr-2" /> Yes, Delete it
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}