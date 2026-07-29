import React, { useState } from 'react';
import { Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AdminNotesSection({ notes, onSave }) {
  const [value, setValue] = useState(notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(value);
    setSaving(false);
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-6 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#FFD700]" /> Admin Notes
        </h3>
        <Button 
           size="sm" 
           onClick={handleSave} 
           disabled={saving}
           className="bg-[#FFD700] hover:bg-[#e5c100] text-black font-bold"
        >
           {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-1" /> Save</>}
        </Button>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave} // Auto-save on blur
        placeholder="Add internal notes about this inquiry..."
        className="flex-1 bg-[#0f172a] border-slate-700 text-slate-200 resize-none focus:border-[#FFD700] min-h-[150px]"
      />
      
      <div className="text-right text-xs text-slate-500 mt-2">
        {value.length} characters
      </div>
    </div>
  );
}