import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RouteImportButton({ onClick }) {
  return (
    <Button 
      variant="outline" 
      onClick={onClick}
      className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
    >
      <Upload className="w-4 h-4 mr-2" />
      Import Routes
    </Button>
  );
}