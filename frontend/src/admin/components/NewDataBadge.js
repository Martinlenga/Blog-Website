import React from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

export default function NewDataBadge({ show, onClick, label = "New items available" }) {
  if (!show) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <ArrowUpIcon className="w-4 h-4" strokeWidth={3} />
        {label}
      </button>
    </div>
  );
}