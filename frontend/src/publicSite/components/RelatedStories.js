import React from "react";
import { Link } from "react-router-dom";
import { FiClock, FiPlayCircle, FiLock } from "react-icons/fi";
import { Layers } from "lucide-react"; 
import placeholder from "../../assets/article-placeholder.jpg";

const getImageUrl = (imagePath) => {
  if (!imagePath) return placeholder;
  const rawApiUrl = process.env.REACT_APP_API_URL || "https://api.ithaguru.co.ke/api";
  const apiBase = rawApiUrl.replace(/\/api\/?$/, "");
  let safePath = String(imagePath);
  if (safePath.includes("localhost:8000")) safePath = safePath.replace("http://localhost:8000", "");
  if (safePath.startsWith("http")) return safePath;
  const cleanPath = safePath.startsWith("/") ? safePath : `/${safePath}`;
  return `${apiBase}${cleanPath}`;
};

const RelatedStories = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-gray-100 animate-in fade-in duration-700">
      <div className="flex items-center gap-2 mb-6 px-1">
        <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
        <h3 className="font-serif text-2xl font-black text-gray-900 tracking-tight">Up Next</h3>
      </div>
      
      <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 snap-x hide-scrollbar">
        {posts.map((related) => {
          const imageUrl = getImageUrl(related.banner_image);
          
          // 🚀 Safely extract category name
          const categoryName = related.category 
            ? (typeof related.category === 'object' ? related.category.name : related.category) 
            : "Editorial";

          return (
            <Link 
              to={`/post/${related.slug}`} 
              key={related.id || related.slug}
              className="group relative flex-shrink-0 w-[280px] md:w-[320px] aspect-[4/5] md:aspect-video bg-gray-900 rounded-2xl overflow-hidden snap-start shadow-sm hover:shadow-xl transition-all duration-300 block border border-gray-800 focus:ring-4 focus:ring-indigo-500/20"
            >
              <img 
                src={imageUrl} 
                alt={related.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105"
              />
              
              {/* Darker gradient so text always pops */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
              
              {/* 🚀 THE FIX: Top Left Category Badge (Balances the Premium badge perfectly) */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-black/50 backdrop-blur-md border border-white/10 text-white text-[8px] font-extrabold uppercase tracking-widest px-2 py-1 rounded shadow-sm">
                  {categoryName}
                </span>
              </div>

              {/* Top Right Premium Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm flex items-center gap-1">
                  <FiLock size={10} /> Premium
                </span>
              </div>

              {/* Content Bottom Left */}
              <div className="absolute bottom-4 left-4 right-4 z-10 transform transition-transform duration-500 group-hover:-translate-y-1">
                
                {/* 🚀 Series Overline (Only renders if the post is part of a series) */}
                {related.series_name && (
                  <div className="flex items-center gap-1.5 text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-1.5 drop-shadow-sm">
                    <Layers size={10} className="shrink-0" /> 
                    <span className="truncate">{related.series_name}</span>
                    {related.part_number && <span className="shrink-0">• PT {related.part_number}</span>}
                  </div>
                )}

                <h4 className="font-serif text-white font-bold text-lg leading-tight mb-2.5 group-hover:text-indigo-300 transition-colors line-clamp-2 drop-shadow-md">
                  {related.title}
                </h4>
                
                <div className="flex items-center gap-3 text-gray-300 text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><FiPlayCircle size={14} className="text-indigo-400" /> Read Now</span>
                  <span className="flex items-center gap-1"><FiClock size={12} className="text-gray-400" /> {related.reading_time || "5 Min"}</span>
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedStories;