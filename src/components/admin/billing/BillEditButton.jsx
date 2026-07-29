import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import BillEditModal from './BillEditModal';

export default function BillEditButton({ bill, onBillUpdated, className, variant = "outline", size = "sm" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className} 
        onClick={() => setIsOpen(true)}
        disabled={!bill}
      >
        <Edit className="w-4 h-4 mr-2" />
        Edit Bill
      </Button>

      <BillEditModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        bill={bill} 
        onBillUpdated={onBillUpdated} 
      />
    </>
  );
}