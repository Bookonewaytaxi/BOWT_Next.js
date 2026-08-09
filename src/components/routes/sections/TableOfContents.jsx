import React from 'react';

/**
 * Renders anchor links only for sections that are actually available
 * (per getRouteSectionAvailability) — no hardcoded link list. If a future
 * module adds a new section, it appears here automatically the moment its
 * availability flag turns true; nothing here needs to change.
 */
export default function TableOfContents({ sections }) {
  const availableSections = sections.filter((s) => s.available && s.id !== 'hero');

  if (availableSections.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="toc bg-white border border-slate-200 rounded-xl p-4 mb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">On this page</p>
      <ul className="flex flex-wrap gap-2">
        {availableSections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="inline-block text-sm px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 hover:bg-[#667eea]/10 hover:text-[#667eea] transition-colors"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
