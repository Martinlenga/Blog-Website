import React from 'react';

export default function ArticleBody({ content }) {
  if (!content) return null;

  return (
    <div 
      className="
        prose md:prose-lg max-w-none 
        
        /* 🔴 THE FIX: Justify text and enable smart hyphenation */
        text-justify hyphens-auto
        
        /* HEADINGS (Keep them left-aligned so they don't stretch weirdly) */
        prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 prose-headings:text-left
        
        /* PARAGRAPHS */
        prose-p:text-gray-800 prose-p:leading-[1.65] prose-p:mb-4 prose-p:mt-0
        
        /* LINKS */
        prose-a:text-indigo-600 prose-a:font-semibold hover:prose-a:underline hover:prose-a:text-indigo-800 transition-colors
        
        /* QUOTES */
        prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-gray-50 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:text-gray-800 prose-blockquote:font-medium prose-blockquote:text-left
        
        /* IMAGES */
        prose-img:rounded-2xl prose-img:shadow-md prose-img:mx-auto
        
        /* LISTS */
        prose-ul:list-disc prose-ul:pl-5 prose-li:text-gray-800 prose-li:my-1
        prose-ol:list-decimal prose-ol:pl-5
        
        /* BOLD TEXT */
        prose-strong:text-gray-900 prose-strong:font-extrabold
        
        /* REMOVE TOP SPACING ON FIRST ELEMENT */
        [&>*:first-child]:mt-0 
      "
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}