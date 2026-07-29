import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Phone, MapPin, Calendar, Clock, Car, MessageCircle, AlertCircle, CheckCircle2, XCircle, Edit, Save, FileText, X } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import ConvertToBookingModal from './ConvertToBookingModal';
import { format } from 'date-fns';

export default function InquiryDetailsModal({ isOpen, onClose, inquiry, onUpdate }) {
  const { toast } = useToast();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(inquiry?.admin_notes || '');
  const [showConvertModal, setShowConvertModal] = useState(false);

  if (!inquiry) return null;

  const updateStatus = async (status) => {
     try {
        const { error } = await supabase.from('inquiries').update({ 
           status, 
           updated_at: new Date() 
        }).eq('id', inquiry.id);
        
        if (error) throw error;
        toast({ title: "Status Updated", description: `Inquiry marked as ${status}`, className: "bg-green-50 border-green-200" });
        onUpdate();
        onClose();
     } catch (e) {
        toast({ variant: "destructive", title: "Error", description: e.message });
     }
  };

  const saveNotes = async () => {
     try {
        const { error } = await supabase.from('inquiries').update({ 
           admin_notes: notes, 
           updated_at: new Date() 
        }).eq('id', inquiry.id);
        
        if (error) throw error;
        toast({ title: "Notes Saved", className: "bg-green-50 border-green-200" });
        setEditingNotes(false);
        onUpdate();
     } catch (e) {
        toast({ variant: "destructive", title: "Error", description: e.message });
     }
  };

  const openWhatsApp = () => {
     const mobile = inquiry.mobile_number.replace(/\D/g, '');
     const url = `https://wa.me/${inquiry.country_code ? inquiry.country_code.replace('+','') : '91'}${mobile}`;
     window.open(url, '_blank');
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[100vw] h-[100vh] sm:h-auto sm:w-full sm:max-w-4xl bg-[#0f172a] text-white border-slate-700 p-0 overflow-hidden flex flex-col rounded-none sm:rounded-lg">
        <div className="bg-slate-900 px-4 md:px-6 py-4 border-b border-slate-700 flex justify-between items-center shrink-0">
            <div className="flex flex-col">
               <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-3">
                  <span>Inquiry #{inquiry.inquiry_id?.slice(0,8)}</span>
               </DialogTitle>
               <span className="text-[10px] md:text-xs text-slate-400">
                  {format(new Date(inquiry.created_at), 'PPP p')}
               </span>
            </div>
            
            <div className="flex items-center gap-3">
               <Badge className={`border-0 hidden md:inline-flex ${
                  inquiry.status === 'New Inquiry' ? 'bg-blue-500' : 
                  inquiry.status === 'Follow-up Required' ? 'bg-amber-500' :
                  inquiry.status === 'Converted to Booking' ? 'bg-emerald-500' : 'bg-red-500'
               }`}>
                  {inquiry.status}
               </Badge>
               <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full md:hidden">
                  <X className="h-6 w-6 text-slate-400" />
               </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto grid md:grid-cols-3 gap-0">
           {/* Left Col: Details */}
           <div className="md:col-span-2 p-4 md:p-6 space-y-4 md:space-y-6 border-b md:border-b-0 md:border-r border-slate-800">
              
              <div className="md:hidden mb-4">
                 <Badge className={`w-full justify-center py-1 ${
                     inquiry.status === 'New Inquiry' ? 'bg-blue-500' : 
                     inquiry.status === 'Follow-up Required' ? 'bg-amber-500' :
                     inquiry.status === 'Converted to Booking' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}>
                     {inquiry.status}
                  </Badge>
              </div>

              {/* Route Card */}
              <div className="bg-slate-800/40 p-4 md:p-5 rounded-xl border border-slate-700/50">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Trip Details
                 </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <span className="text-xs text-slate-500">Pickup</span>
                       <p className="font-bold text-lg text-white break-words">{inquiry.pickup_city}</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-xs text-slate-500">Drop</span>
                       <p className="font-bold text-lg text-white break-words">{inquiry.drop_city}</p>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-700/30 sm:border-0 sm:pt-0">
                       <span className="text-xs text-slate-500">Date & Time</span>
                       <p className="font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          {inquiry.pickup_date ? format(new Date(inquiry.pickup_date), 'dd MMM yyyy') : 'N/A'}
                       </p>
                       <p className="font-medium flex items-center gap-2 pl-6">
                          <Clock className="w-4 h-4 text-amber-500" />
                          {inquiry.pickup_time || 'N/A'}
                       </p>
                    </div>
                    {inquiry.fare_shown && (
                       <div className="space-y-1 pt-2 border-t border-slate-700/30 sm:border-0 sm:pt-0">
                          <span className="text-xs text-slate-500">Estimated Fare</span>
                          <p className="font-bold text-xl text-emerald-400">₹{inquiry.fare_shown}</p>
                       </div>
                    )}
                 </div>
              </div>

              {/* Customer Card */}
              <div className="bg-slate-800/40 p-4 md:p-5 rounded-xl border border-slate-700/50">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Customer Info
                 </h4>
                 <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div>
                          <p className="font-bold text-lg">{inquiry.name || inquiry.customer_name || 'Guest User'}</p>
                          <p className="text-slate-400 font-mono text-sm">{inquiry.country_code} {inquiry.mobile_number}</p>
                       </div>
                       <Button size="sm" onClick={openWhatsApp} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                          <MessageCircle className="w-4 h-4 mr-2" /> Chat on WhatsApp
                       </Button>
                    </div>
                    {inquiry.special_instructions && (
                       <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-500 block mb-1">Special Instructions:</span>
                          <p className="text-sm italic text-slate-300">{inquiry.special_instructions}</p>
                       </div>
                    )}
                 </div>
              </div>

           </div>

           {/* Right Col: Admin Actions */}
           <div className="p-4 md:p-6 bg-slate-900/30 flex flex-col h-full overflow-y-auto">
              
              <div className="flex-1 mb-6">
                 <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                       <FileText className="w-4 h-4" /> Admin Notes
                    </h4>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => editingNotes ? saveNotes() : setEditingNotes(true)}>
                       {editingNotes ? <Save className="h-4 w-4 text-green-500" /> : <Edit className="h-4 w-4 text-blue-400" />}
                    </Button>
                 </div>
                 {editingNotes ? (
                    <Textarea 
                       value={notes} 
                       onChange={e => setNotes(e.target.value)} 
                       className="h-32 md:h-48 bg-slate-900 border-slate-600 resize-none focus:border-amber-500" 
                       placeholder="Add internal notes about this lead..."
                    />
                 ) : (
                    <div className="h-32 md:h-48 overflow-y-auto bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 whitespace-pre-wrap">
                       {notes || <span className="text-slate-600 italic">No notes added yet.</span>}
                    </div>
                 )}
              </div>

              <div className="space-y-3 mt-auto pb-safe">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Change Status</h4>
                 
                 {inquiry.status !== 'Converted to Booking' && (
                    <Button onClick={() => setShowConvertModal(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 md:h-10">
                       <CheckCircle2 className="h-4 w-4 mr-2" /> Convert to Booking
                    </Button>
                 )}
                 
                 {inquiry.status !== 'Follow-up Required' && (
                    <Button variant="outline" onClick={() => updateStatus('Follow-up Required')} className="w-full border-amber-500/50 text-amber-500 hover:bg-amber-500/10 h-11 md:h-10">
                       <AlertCircle className="h-4 w-4 mr-2" /> Mark for Follow-up
                    </Button>
                 )}
                 
                 {inquiry.status !== 'Lost Inquiry' && (
                    <Button variant="outline" onClick={() => updateStatus('Lost Inquiry')} className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 h-11 md:h-10">
                       <XCircle className="h-4 w-4 mr-2" /> Mark as Lost
                    </Button>
                 )}
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>

    <ConvertToBookingModal 
       isOpen={showConvertModal} 
       onClose={() => setShowConvertModal(false)} 
       inquiry={inquiry}
       onSuccess={() => {
          onUpdate();
          onClose();
       }}
    />
    </>
  );
}