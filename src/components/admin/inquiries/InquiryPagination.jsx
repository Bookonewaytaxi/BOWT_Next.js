import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InquiryPagination({ currentPage, totalItems, itemsPerPage, onPageChange, onLimitChange, loading }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-700/50 mt-4">
      <div className="text-sm text-slate-400">
        Showing <span className="font-medium text-white">{startItem}</span> to <span className="font-medium text-white">{endItem}</span> of <span className="font-medium text-white">{totalItems}</span> entries
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Rows per page:</span>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(val) => onLimitChange(Number(val))}
            disabled={loading}
          >
            <SelectTrigger className="h-8 w-[70px] bg-[#0f172a] border-slate-700 text-slate-200">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-[#0f172a] border-slate-700 hover:bg-slate-800 hover:text-[#FFD700]"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-slate-300 min-w-[3rem] text-center">
             Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-[#0f172a] border-slate-700 hover:bg-slate-800 hover:text-[#FFD700]"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}