import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function RichTextEditor({ value, onChange, label, placeholder }) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link'
  ];

  return (
    <div className="space-y-2">
      {label && <Label className="text-slate-200 font-bold">{label}</Label>}
      <div className="bg-white rounded-lg text-slate-900 overflow-hidden">
        <ReactQuill 
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder || 'Write something amazing...'}
          className="h-64 mb-12" // Add margin bottom for toolbar space
        />
      </div>
    </div>
  );
}
