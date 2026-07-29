import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SEOKeywordEditor({ keywords = [], onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const term = inputValue.trim();
    
    if (!term) return;
    
    if (term.length < 2 || term.length > 50) {
      setError('Keyword must be between 2 and 50 characters');
      return;
    }

    if (keywords.includes(term)) {
      setError('Keyword already exists');
      return;
    }

    onChange([...keywords, term]);
    setInputValue('');
    setError('');
  };

  const handleRemove = (termToRemove) => {
    onChange(keywords.filter(k => k !== termToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Add SEO keyword..."
            className="pl-9 bg-slate-950 border-slate-800"
          />
        </div>
        <Button onClick={handleAdd} type="button" variant="secondary">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
        {keywords.length === 0 && (
          <span className="text-slate-500 text-sm italic">No keywords added yet</span>
        )}
        {keywords.map((keyword, index) => (
          <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200">
            {keyword}
            <button 
              type="button"
              onClick={() => handleRemove(keyword)}
              className="p-0.5 hover:bg-slate-600 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className="text-xs text-slate-500 text-right">
        {keywords.length} keywords (Minimum 15 recommended)
      </div>
    </div>
  );
}