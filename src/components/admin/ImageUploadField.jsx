import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function ImageUploadField({ label, value, onChange, altText, onAltChange }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `route-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('route-pages')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('route-pages')
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onChange(publicUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Image successfully uploaded to storage."
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Could not upload image."
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div className="space-y-4">
      <Label className="text-slate-200 font-bold">{label || "Image Upload"}</Label>
      
      <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition-colors">
        {preview ? (
          <div className="relative group">
             <img 
               src={preview} 
               alt="Preview" 
               className="w-full h-48 object-cover rounded-md border border-slate-600"
             />
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4 mr-2" /> Remove Image
                </Button>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            {uploading ? (
               <Loader2 className="h-10 w-10 mb-3 animate-spin text-amber-500" />
            ) : (
               <ImageIcon className="h-10 w-10 mb-3 text-slate-500" />
            )}
            <p className="text-sm mb-4">{uploading ? 'Uploading...' : 'Drag & drop or click to upload'}</p>
            <div className="relative">
               <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
               />
               <Button type="button" variant="secondary" disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" /> Select File
               </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
         <Label className="text-slate-300 text-xs uppercase font-bold">Alt Text (For SEO)</Label>
         <Input 
            value={altText || ''}
            onChange={(e) => onAltChange && onAltChange(e.target.value)}
            placeholder="Describe the image..."
            className="bg-[#0f172a] border-slate-700 text-white"
         />
      </div>
    </div>
  );
}