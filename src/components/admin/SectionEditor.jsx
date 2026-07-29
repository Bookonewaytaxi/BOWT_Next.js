import React, { useState, useEffect } from 'react';
import { 
  X, Check, Image as ImageIcon, Type, Layout, List, 
  MessageSquare, Grid, Trash2, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function SectionEditor({ section, onSave, onCancel, onDelete }) {
  const [content, setContent] = useState(section.content || {});

  useEffect(() => {
    setContent(section.content || {});
  }, [section]);

  const handleChange = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const renderEditor = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label>Hero Title (H1)</Label>
              <Input 
                value={content.title || ''} 
                onChange={(e) => handleChange('title', e.target.value)} 
                placeholder="e.g., Taxi from Delhi to Agra"
              />
            </div>
            <div>
              <Label>Background Image URL</Label>
              <Input 
                value={content.image_url || ''} 
                onChange={(e) => handleChange('image_url', e.target.value)} 
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input 
                value={content.alt_text || ''} 
                onChange={(e) => handleChange('alt_text', e.target.value)} 
                placeholder="Descriptive text for image"
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Heading</Label>
              <Input 
                value={content.heading || ''} 
                onChange={(e) => handleChange('heading', e.target.value)} 
                placeholder="Section Heading"
              />
            </div>
            <div>
              <Label>Heading Type</Label>
              <select 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                value={content.heading_type || 'h2'}
                onChange={(e) => handleChange('heading_type', e.target.value)}
              >
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
              </select>
            </div>
            <div>
              <Label>Body Paragraph</Label>
              <Textarea 
                value={content.body || ''} 
                onChange={(e) => handleChange('body', e.target.value)} 
                placeholder="Write your content here..."
                rows={6}
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input 
                value={content.image_url || ''} 
                onChange={(e) => handleChange('image_url', e.target.value)} 
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input 
                value={content.alt_text || ''} 
                onChange={(e) => handleChange('alt_text', e.target.value)} 
              />
            </div>
            <div>
              <Label>Caption (Optional)</Label>
              <Input 
                value={content.caption || ''} 
                onChange={(e) => handleChange('caption', e.target.value)} 
              />
            </div>
          </div>
        );
      
      case 'table':
        // Simplified Table Editor - Just entering JSON or basic structure for now
        // In a real app, a full grid editor is needed.
        return (
           <div className="space-y-4">
             <div>
               <Label>Table Title</Label>
               <Input 
                 value={content.title || ''} 
                 onChange={(e) => handleChange('title', e.target.value)} 
               />
             </div>
             <div className="p-4 bg-slate-100 rounded text-sm text-slate-500">
                Table building is complex. For now, please ensure your public page can render a default pricing table or schedule table.
                (Placeholder for complex table builder)
             </div>
           </div>
        );

      case 'amenities':
         return (
            <div className="space-y-4">
               <Label>Amenities List (One per line)</Label>
               <Textarea 
                  value={content.items ? content.items.join('\n') : ''}
                  onChange={(e) => handleChange('items', e.target.value.split('\n'))}
                  placeholder="AC Cabs\nClean Interiors\n..."
                  rows={6}
               />
            </div>
         );

      default:
        return <p>Unknown section type</p>;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px] bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 capitalize">
             {section.type === 'hero' && <Layout className="h-5 w-5" />}
             {section.type === 'text' && <Type className="h-5 w-5" />}
             {section.type === 'image' && <ImageIcon className="h-5 w-5" />}
             {section.type === 'amenities' && <List className="h-5 w-5" />}
             Edit {section.type} Section
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
           {renderEditor()}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between w-full">
           <Button variant="destructive" size="sm" onClick={onDelete} type="button">
             <Trash2 className="h-4 w-4 mr-2" /> Delete Section
           </Button>
           <div className="flex gap-2">
             <Button variant="outline" onClick={onCancel}>Cancel</Button>
             <Button onClick={() => onSave({ ...section, content })}>
               <Check className="h-4 w-4 mr-2" /> Save Changes
             </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}