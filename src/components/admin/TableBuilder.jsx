import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TableBuilder({ value, onChange }) {
  // Default structure if empty
  const [data, setData] = useState(value || {
    headers: ['Column 1', 'Column 2'],
    rows: [['Cell 1', 'Cell 2']]
  });

  useEffect(() => {
    // Keep internal state in sync if prop changes from outside (rare but safe)
    if (value) setData(value);
  }, [value]);

  const updateParent = (newData) => {
    setData(newData);
    onChange(newData);
  };

  const addColumn = () => {
    const newData = {
      headers: [...data.headers, `Column ${data.headers.length + 1}`],
      rows: data.rows.map(row => [...row, ''])
    };
    updateParent(newData);
  };

  const removeColumn = (index) => {
    if (data.headers.length <= 1) return;
    const newData = {
      headers: data.headers.filter((_, i) => i !== index),
      rows: data.rows.map(row => row.filter((_, i) => i !== index))
    };
    updateParent(newData);
  };

  const addRow = () => {
    const newRow = new Array(data.headers.length).fill('');
    const newData = {
      ...data,
      rows: [...data.rows, newRow]
    };
    updateParent(newData);
  };

  const removeRow = (index) => {
    const newData = {
      ...data,
      rows: data.rows.filter((_, i) => i !== index)
    };
    updateParent(newData);
  };

  const updateHeader = (index, val) => {
    const newHeaders = [...data.headers];
    newHeaders[index] = val;
    updateParent({ ...data, headers: newHeaders });
  };

  const updateCell = (rowIndex, colIndex, val) => {
    const newRows = [...data.rows];
    newRows[rowIndex] = [...newRows[rowIndex]]; // Copy the row
    newRows[rowIndex][colIndex] = val;
    updateParent({ ...data, rows: newRows });
  };

  return (
    <div className="space-y-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-slate-200 font-bold">Table Content</Label>
        <div className="flex gap-2">
           <Button type="button" size="sm" variant="outline" onClick={addColumn} className="text-xs h-8">
              <Plus className="h-3 w-3 mr-1" /> Add Column
           </Button>
           <Button type="button" size="sm" variant="outline" onClick={addRow} className="text-xs h-8">
              <Plus className="h-3 w-3 mr-1" /> Add Row
           </Button>
        </div>
      </div>

      <div className="border border-slate-700 rounded-lg overflow-hidden bg-[#0f172a] min-w-[600px]">
        <table className="w-full text-sm text-left text-slate-300">
           <thead className="text-xs text-slate-400 uppercase bg-slate-800">
              <tr>
                 <th className="px-4 py-3 w-10">#</th>
                 {data.headers.map((header, idx) => (
                    <th key={`h-${idx}`} className="px-2 py-2 min-w-[150px] relative group border-r border-slate-700 last:border-0">
                       <div className="flex items-center gap-2">
                          <Input 
                             value={header} 
                             onChange={(e) => updateHeader(idx, e.target.value)}
                             className="h-8 bg-slate-900 border-none focus:ring-1 focus:ring-amber-500 p-1 text-xs font-bold text-center"
                          />
                          <button 
                             type="button"
                             onClick={() => removeColumn(idx)}
                             className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1/2 -translate-y-1/2 bg-slate-800 rounded p-1"
                          >
                             <Trash2 className="h-3 w-3" />
                          </button>
                       </div>
                    </th>
                 ))}
                 <th className="w-10"></th>
              </tr>
           </thead>
           <tbody>
              {data.rows.map((row, rIdx) => (
                 <tr key={`r-${rIdx}`} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30">
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                       <td key={`c-${rIdx}-${cIdx}`} className="px-2 py-2 border-r border-slate-800 last:border-0">
                          <Input 
                             value={cell} 
                             onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                             className="h-9 bg-transparent border-transparent hover:border-slate-700 focus:border-amber-500 focus:bg-slate-900 transition-all text-sm"
                             placeholder="Cell content"
                          />
                       </td>
                    ))}
                    <td className="px-2 py-2 text-center">
                       <button 
                          type="button"
                          onClick={() => removeRow(rIdx)}
                          className="text-slate-600 hover:text-red-500 p-1 rounded hover:bg-slate-800 transition-colors"
                       >
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
      {data.rows.length === 0 && (
          <div className="text-center p-4 text-slate-500 text-sm italic bg-slate-900/50 rounded border border-dashed border-slate-800">
             No rows. Click "Add Row" to start.
          </div>
      )}
    </div>
  );
}