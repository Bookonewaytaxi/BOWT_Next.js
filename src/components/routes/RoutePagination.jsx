import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function RoutePagination({ currentPage, totalPages, onPageChange, isLoading, totalItems, itemsPerPage }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 mt-4 border-t border-[#2F3336]">
      <p className="text-gray-400 text-sm">
        Showing <span className="text-[#FFD700] font-bold">{startItem}</span> - <span className="text-[#FFD700] font-bold">{endItem}</span> of <span className="text-white font-bold">{totalItems}</span> routes
      </p>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="border-[#2F3336] text-gray-300 hover:text-white hover:border-[#FFD700] hover:bg-[#161B22]"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        
        <div className="flex items-center gap-1 px-4">
           {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic to show pages around current page could be added here for large page counts
              // For simplicity showing first 5 or logic needs to be complex. 
              // Using simple current/total display instead of numbers for cleaner mobile look
              return null;
           })}
           <span className="text-gray-400 text-sm">Page {currentPage} of {totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="border-[#2F3336] text-gray-300 hover:text-white hover:border-[#FFD700] hover:bg-[#161B22]"
        >
           {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
           Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}