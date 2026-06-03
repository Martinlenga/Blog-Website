import React, { useMemo } from 'react';
import DOMPurify from 'dompurify'; 

// 🚀 Helper function to safely process text
const processContent = (rawContent) => {
  if (!rawContent) return "";
  
  // 1. Sanitize the HTML first to prevent XSS
  const cleanHtml = DOMPurify.sanitize(rawContent);
  
  // 2. Parse the string into an actual DOM tree
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, 'text/html');
  
  // 3. Walk through ONLY the text nodes
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  
  while ((node = walker.nextNode())) {
    // 🚀 SAFETY NET: Do NOT alter spacing inside code blocks!
    if (node.parentElement && node.parentElement.closest('pre, code')) {
      continue;
    }

    let text = node.nodeValue;

    // 🚀 THE SPACE CRUSHER: 
    // Finds any combination of standard spaces, tabs (\t), or non-breaking spaces (\u00A0)
    // and collapses them into one single, standard space.
    text = text.replace(/[ \t\u00A0]+/g, ' ');

    // 🚀 THE HYPHEN FIX:
    // Replace standard hyphens between letters with a Non-Breaking Hyphen (\u2011)
    text = text.replace(/([a-zA-Z])-([a-zA-Z])/g, '$1\u2011$2');

    node.nodeValue = text;
  }
  
  // 4. Return the updated, safely processed HTML
  return doc.body.innerHTML;
};

export default function ArticleBody({ content }) {
  // useMemo ensures we only run this processing once when the content loads
  const safeContent = useMemo(() => processContent(content), [content]);

  if (!content) return null;

  return (
    <div 
      className="
        /* Base Prose Styling */
        prose md:prose-lg max-w-none font-sans text-gray-800
        
        /* HEADINGS */
        prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 
        
        /* PARAGRAPHS - Kept clean and breathable */
        prose-p:leading-[1.8] prose-p:mb-5 prose-p:mt-0
        
        /* LISTS & QUOTES - Beautiful editorial accents */
        prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-gray-50/80 
        prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:text-gray-700
        
        /* IMAGES - Neat and contained */
        prose-img:rounded-2xl prose-img:shadow-sm prose-img:mx-auto
        
        /* Clean up top margin spacing */
        [&>*:first-child]:mt-0 
      "
      dangerouslySetInnerHTML={{ __html: safeContent }} 
    />
  );
}