import React, { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Card } from '@/components/ui/card';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function ContentEditor({ value, onChange, placeholder }) {
  const quillRef = useRef(null);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'clean'],
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
  ];

  return (
    <Card className="overflow-hidden bg-white text-slate-900 border-0 h-full flex flex-col">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Start writing your SEO optimized content here..."}
        className="flex-1 flex flex-col h-full [&>.ql-container]:flex-1 [&>.ql-container]:font-sans [&>.ql-container]:text-base"
      />
      <style>{`
        .ql-toolbar.ql-snow {
          border-color: #e2e8f0;
          background: #f8fafc;
        }
        .ql-container.ql-snow {
          border: none;
        }
        .ql-editor {
          min-height: 300px;
          font-family: inherit;
        }
      `}</style>
    </Card>
  );
}
