import React from 'react';

export default function SEOContentRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="seo-content-section mt-10 mb-10 rounded-2xl overflow-hidden">
      <div className="content-wrapper p-6 md:p-10">
        <div 
          className="seo-content-body"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>
    </div>
  );
}