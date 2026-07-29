import React from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function BulkDeleteModal({ isOpen, onClose, onConfirm, selectedRoutes = [], isDeleting }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white text-slate-900">
        <DialogHeader>
          <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Delete {selectedRoutes.length} Routes?</DialogTitle>
          <DialogDescription className="text-center">
            This action cannot be undone. The selected routes will be permanently removed from the database.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-bold text-slate-700 mb-2">Routes to be deleted:</p>
          <ScrollArea className="h-[150px] w-full rounded-md border p-2 bg-slate-50">
            <ul className="space-y-1 text-sm text-slate-600">
              {selectedRoutes.map((route) => (
                <li key={route.id} className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                   {route.from_city} <span className="text-slate-400">→</span> {route.to_city}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                 <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
              </>
            ) : (
              'Yes, Delete All'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}