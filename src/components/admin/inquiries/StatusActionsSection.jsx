import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StatusActionsSection({ currentStatus, onUpdateStatus, onConvertClick }) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status) => {
    setLoading(true);
    await onUpdateStatus(status);
    setLoading(false);
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-6 shadow-lg mt-6">
      <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
      
      <div className="flex flex-col gap-3">
        <Button 
           disabled={loading || currentStatus === 'converted'}
           onClick={onConvertClick}
           className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
        >
           <CheckCircle className="w-4 h-4 mr-2" /> Convert to Booking
        </Button>

        <Button 
           disabled={loading || currentStatus === 'follow_up'}
           onClick={() => handleStatusChange('follow_up')}
           className="w-full bg-yellow-600 hover:bg-yellow-700 text-white justify-start"
        >
           <Clock className="w-4 h-4 mr-2" /> Mark as Follow-up
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              disabled={loading || currentStatus === 'lost'}
              variant="destructive"
              className="w-full justify-start bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" /> Mark as Lost
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1e293b] border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                 <AlertTriangle className="text-red-500 w-5 h-5" /> Confirm Action
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Are you sure you want to mark this inquiry as lost? This status indicates no further action is required.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                 onClick={() => handleStatusChange('lost')}
                 className="bg-red-600 hover:bg-red-700 border-none"
              >
                 Mark Lost
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
