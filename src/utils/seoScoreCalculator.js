const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

export const calculateSeoScore = (data = {}) => {
  const title = String(data.meta_title || '').trim();
  const description = String(data.meta_description || '').trim();
  const h1 = String(data.h1_heading || '').trim();
  const keyword = String(data.focus_keyword || '').trim().toLowerCase();
  const content = String(data.long_form_content || data.seo_content || '');
  const plainContent = stripHtml(content);
  const words = plainContent ? plainContent.split(/\s+/).length : 0;
  const lowerContent = content.toLowerCase();
  const faqs = Array.isArray(data.faq_section) ? data.faq_section : [];
  const secondary = Array.isArray(data.secondary_keywords) ? data.secondary_keywords.filter(Boolean) : [];
  const breakdown = {
    metadata: { score: 0, max: 30, issues: [] },
    keywordRelevance: { score: 0, max: 20, issues: [] },
    content: { score: 0, max: 30, issues: [] },
    faq: { score: 0, max: 10, issues: [] },
    mediaAndLinks: { score: 0, max: 10, issues: [] }
  };

  if (title.length >= 30 && title.length <= 60) breakdown.metadata.score += 10;
  else breakdown.metadata.issues.push('Title should be approximately 30–60 characters.');
  if (description.length >= 140 && description.length <= 160) breakdown.metadata.score += 10;
  else breakdown.metadata.issues.push('Description should be 140–160 characters.');
  if (description.includes('+91 75675 75578')) breakdown.metadata.score += 5;
  else breakdown.metadata.issues.push('Add the business phone number to the meta description.');
  if (data.slug && !/[A-Z\s]/.test(data.slug)) breakdown.metadata.score += 5;
  else breakdown.metadata.issues.push('Check the existing URL slug format (lowercase, hyphen-separated).');

  if (keyword && title.toLowerCase().includes(keyword)) breakdown.keywordRelevance.score += 7;
  else breakdown.keywordRelevance.issues.push('Focus keyword is missing from the title.');
  if (keyword && description.toLowerCase().includes(keyword)) breakdown.keywordRelevance.score += 7;
  else breakdown.keywordRelevance.issues.push('Focus keyword is missing from the description.');
  if (keyword && h1.toLowerCase().includes(keyword)) breakdown.keywordRelevance.score += 6;
  else if (keyword) breakdown.keywordRelevance.issues.push('Use the focus keyword naturally in the H1.');

  if (words >= 300) breakdown.content.score += 10;
  else breakdown.content.issues.push(`Content is ${words} words; add useful, route-specific information where needed.`);
  if (/<h2\b/i.test(content)) breakdown.content.score += 8;
  else breakdown.content.issues.push('Add meaningful H2 sections.');
  if (/<h3\b/i.test(content)) breakdown.content.score += 4;
  else breakdown.content.issues.push('Use H3 subheadings where they improve structure.');
  if (plainContent && !/\b(best|number one|guaranteed)\b/i.test(plainContent)) breakdown.content.score += 4;
  else breakdown.content.issues.push('Review promotional or unverifiable claims.');
  if (words > 0 && keyword) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const count = (plainContent.toLowerCase().match(new RegExp(escaped, 'g')) || []).length;
    const density = (count / words) * 100;
    if (density <= 2.5) breakdown.content.score += 4;
    else breakdown.content.issues.push('Reduce repeated exact-match keyword usage.');
  }

  if (faqs.some((faq) => faq.question?.trim() && faq.answer?.trim())) breakdown.faq.score += 10;
  else breakdown.faq.issues.push('Add useful FAQs with verified answers.');

  const altValues = Object.values(data.image_alt_text || {}).filter(Boolean);
  if (altValues.length) breakdown.mediaAndLinks.score += 5;
  else breakdown.mediaAndLinks.issues.push('Image alt text is not configured in this editor.');
  if (/<a\s+[^>]*href=/i.test(content)) breakdown.mediaAndLinks.score += 5;
  else breakdown.mediaAndLinks.issues.push('Add relevant contextual internal links where useful.');

  const totalScore = Object.values(breakdown).reduce((sum, item) => sum + item.score, 0);
  return { totalScore: Math.min(100, totalScore), breakdown };
};
