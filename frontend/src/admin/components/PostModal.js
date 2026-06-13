import { useState, useEffect, useMemo } from "react";
import imageCompression from 'browser-image-compression';
import { Loader, CheckCircle, Upload, Image as ImageIcon, Settings, Lock } from "lucide-react"; // 🚀 Added Lock icon
import { createAdminPost, updateAdminPost, getAdminPosts } from "../services/adminApi";
import placeholder from "../../assets/article-placeholder.jpg"; 

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function PostModal({ open, post, onClose, refresh }) {
  const [formData, setFormData] = useState({
    title: "", excerpt: "", content: "", category: "General", 
    price: "150.00", featured: false, is_published: true, meta_description: "",
    custom_author: "",
    series_name: "", 
    part_number: ""
  });

  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(placeholder);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [seriesRegistry, setSeriesRegistry] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (open) {
      getAdminPosts({ page: 1 })
        .then(res => {
          const posts = res.data?.results || [];
          const registry = {};
          posts.forEach(p => {
            if (p.series_name && p.part_number) {
              const part = parseInt(p.part_number);
              if (!registry[p.series_name]) registry[p.series_name] = [];
              if (!registry[p.series_name].includes(part)) {
                registry[p.series_name].push(part);
              }
            }
          });
          setSeriesRegistry(registry);
        })
        .catch(() => console.log("Failed to load series registry"));
    }

    if (post && open) {
      setFormData({
        title: post.title || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        category: post.category || "General",
        price: post.price ? Number(post.price).toFixed(2) : "150.00",
        featured: post.featured || false,
        is_published: post.is_published !== undefined ? post.is_published : true,
        meta_description: post.meta_description || "",
        custom_author: post.custom_author || "",
        series_name: post.series_name || "",
        part_number: post.part_number || ""
      });
      
      const img = post.banner_image 
        ? (post.banner_image.startsWith("http") ? post.banner_image : `${process.env.REACT_APP_API_URL?.replace("/api", "")}${post.banner_image}`) 
        : placeholder;
      
      setPreview(img);
      setBanner(null); 
    } else if (open) {
      setFormData({ 
        title: "", excerpt: "", content: "", category: "General", 
        price: "150.00", featured: false, is_published: true, meta_description: "",
        custom_author: "",
        series_name: "", 
        part_number: ""
      });
      setPreview(placeholder);
      setBanner(null);
    }
    setErrors({});
  }, [post, open]);

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [2, 3, 4, false] }], 
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video', 'code-block'],
      ['clean'] 
    ],
    clipboard: { matchVisual: false }
  }), []);

  // 🚀 THE AUTOPILOT ENGINE: Calculates the exact right number instantly
  const getNextPartNumber = (seriesName) => {
    if (!seriesName.trim()) return "";
    
    // If they are editing the original post, keep its assigned part number locked in place
    if (post && post.series_name === seriesName.trim()) {
      return post.part_number;
    }

    // Look for an exact match in the database registry (case-insensitive)
    const exactMatch = Object.keys(seriesRegistry).find(
      s => s.toLowerCase() === seriesName.trim().toLowerCase()
    );

    // If it exists, find the highest part and add 1. If brand new, it's Part 1.
    if (exactMatch) {
      const parts = seriesRegistry[exactMatch] || [];
      const maxPart = parts.length > 0 ? Math.max(...parts) : 0;
      return (maxPart + 1).toString();
    }
    
    return "1";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
      
      // Calculate sequence in real-time as they type
      if (name === "series_name") {
        updated.part_number = getNextPartNumber(value);
      }
      
      return updated;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (name === "series_name") setShowSuggestions(true);
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
    if (errors.content) setErrors(prev => ({ ...prev, content: null }));
  };

  const handleSeriesSelect = (selectedSeries) => {
    setFormData(prev => ({
      ...prev,
      series_name: selectedSeries,
      part_number: getNextPartNumber(selectedSeries) // Use the autopilot engine here too
    }));
    setShowSuggestions(false);
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview("loading"); 
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
      try {
        const compressed = await imageCompression(file, options);
        const renamedFile = new File([compressed], file.name, { type: file.type, lastModified: Date.now() });
        setBanner(renamedFile);
        setPreview(URL.createObjectURL(renamedFile));
      } catch (err) {
        alert("Failed to compress image.");
        setPreview(placeholder);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (key === 'part_number' && value === "") return;
      payload.append(key, typeof value === "boolean" ? (value ? "true" : "false") : value);
    });

    if (banner instanceof File) payload.append("banner_image", banner, banner.name);

    try {
      if (post) await updateAdminPost(post.slug, payload); 
      else await createAdminPost(payload);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        refresh();
        onClose();
      }, 1500);
    } catch (err) {
      setErrors(err.response?.data || { general: "Failed to save article" });
      document.querySelector('.custom-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const matchingSeries = Object.keys(seriesRegistry).filter(s => 
    s.toLowerCase().includes(formData.series_name.toLowerCase()) && s !== formData.series_name
  );

  if (!open) return null;

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
            <CheckCircle className="text-emerald-500 w-16 h-16 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-gray-900 text-center">Article Saved Successfully!</h3>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-6" role="dialog" aria-modal="true">
        <style>{`
          .quill-editor .ql-toolbar.ql-snow { position: sticky; top: 0; z-index: 50; background: white; border: none; border-bottom: 1px solid #e5e7eb; border-radius: 12px 12px 0 0; padding: 12px; }
          .quill-editor .ql-container.ql-snow { border: none; min-height: 500px; font-size: 16px; font-family: inherit; }
          .quill-editor .ql-editor { padding: 2rem 1.5rem; word-break: normal !important; overflow-wrap: break-word !important; hyphens: none !important; -webkit-hyphens: none !important; }
          .quill-editor .ql-editor p, .quill-editor .ql-editor span, .quill-editor .ql-editor li { text-align: left; white-space: pre-wrap !important; }
          .quill-editor .ql-editor img { border-radius: 8px; max-width: 100% !important; }
        `}</style>

        <div className="bg-gray-50 w-full max-w-[1400px] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[98vh] sm:h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
          
          <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Settings size={18} />
              </div>
              <h2 id="modal-title" className="font-serif text-xl font-bold text-gray-900 tracking-tight">
                {post ? "Edit Publication" : "New Publication"}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50">
                Cancel
              </button>
              
              {/* 🚀 Restored the clean button now that duplication checking is handled automatically */}
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                <span>{post ? "Update Post" : "Publish Now"}</span>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar relative">
            <form id="post-form" onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">
                
                {/* 📝 LEFT COLUMN */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                    <div>
                      <input id="title" name="title" value={formData.title} onChange={handleChange} required className={`w-full px-0 py-2 text-3xl sm:text-4xl font-serif font-black border-b-2 outline-none transition-colors placeholder:text-gray-300 ${errors.title ? 'border-rose-400 text-rose-900' : 'border-gray-100 focus:border-indigo-600 text-gray-900'}`} placeholder="Enter a compelling title..." />
                      {errors.title && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.title}</p>}
                    </div>
                    <div>
                      <textarea id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange} rows={2} className={`w-full px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-xl border outline-none transition-colors placeholder:text-gray-400 focus:bg-white ${errors.excerpt ? 'border-rose-300 focus:border-rose-500' : 'border-transparent focus:border-indigo-300'}`} placeholder="Write a brief, catchy summary for the article cards..." />
                      {errors.excerpt && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.excerpt}</p>}
                    </div>
                  </div>

                  <div className={`bg-white rounded-2xl border shadow-sm ${errors.content ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-200'}`}>
                    <div className="quill-editor rounded-2xl overflow-hidden">
                      <ReactQuill id="content" theme="snow" value={formData.content} onChange={handleContentChange} modules={quillModules} placeholder="Begin writing your masterpiece..." />
                    </div>
                    {errors.content && <p className="text-rose-500 text-xs font-bold px-6 pb-4">{errors.content}</p>}
                  </div>
                </div>

                {/* ⚙️ RIGHT COLUMN */}
                <div className="lg:col-span-4 space-y-6">
                  
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                      <ImageIcon size={16} className="text-indigo-500"/> Cover Media
                    </label>
                    <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 h-44 transition-colors hover:border-indigo-400 hover:bg-indigo-50">
                      {preview === "loading" ? (
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-500">
                           <Loader className="animate-spin mb-2" size={24} />
                           <span className="text-xs font-medium">Processing...</span>
                         </div>
                      ) : (
                        <>
                          <img src={preview} alt="Cover Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload className="text-white mb-2" size={24} />
                            <span className="text-white text-xs font-bold px-4 py-2 bg-white/20 rounded-full backdrop-blur-md">
                              {post ? "Replace Image" : "Upload Image"}
                            </span>
                          </div>
                        </>
                      )}
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFile} accept="image/jpeg, image/png, image/webp" />
                    </div>
                    {errors.banner_image && <p className="text-rose-500 text-xs font-bold mt-2">{errors.banner_image}</p>}
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                    
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-4 mb-2">
                      <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-1.5"><Settings size={12}/> Story Sequence</h4>
                      
                      <div className="relative">
                        <label htmlFor="series_name" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Series Name (Optional)</label>
                        <input
                          id="series_name" type="text" name="series_name" placeholder="e.g. The Genesis Protocol"
                          value={formData.series_name} 
                          onChange={handleChange} 
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
                          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:border-indigo-500 transition-all font-medium"
                        />
                        
                        {showSuggestions && matchingSeries.length > 0 && (
                          <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-indigo-100 shadow-xl rounded-lg max-h-48 overflow-y-auto custom-scrollbar overflow-hidden">
                            {matchingSeries.map(s => (
                              <li 
                                key={s} 
                                onMouseDown={() => handleSeriesSelect(s)} 
                                className="px-3 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer font-medium flex justify-between items-center transition-colors border-b border-gray-50 last:border-none"
                              >
                                <span className="truncate pr-2">{s}</span>
                                <span className="text-[9px] text-indigo-500 bg-indigo-100/50 px-1.5 py-0.5 rounded font-black uppercase tracking-widest shrink-0">
                                  Next: PT {(Math.max(...(seriesRegistry[s] || [0]))) + 1}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* 🚀 COMPLETELY LOCKED AUTOPILOT FIELD */}
                      <div>
                        <label htmlFor="part_number" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                          <span>Part Number</span>
                          {formData.part_number && <Lock size={10} className="text-gray-400" />}
                        </label>
                        <input
                          id="part_number" type="number" name="part_number" value={formData.part_number} 
                          placeholder="Auto" 
                          disabled // Prevents all editing
                          className="w-full px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-lg outline-none cursor-not-allowed font-bold tabular-nums"
                        />
                        {formData.series_name && (
                           <p className="text-indigo-500 text-[9px] font-bold mt-1.5 uppercase tracking-wider">
                             Automatically Assigned
                           </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="custom_author" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Guest Author (Optional)</label>
                      <input id="custom_author" type="text" name="custom_author" value={formData.custom_author} onChange={handleChange} placeholder="Leave blank to post as Admin" className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium" />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                      <input id="category" type="text" name="category" value={formData.category} onChange={handleChange} placeholder="General" className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium" />
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Access Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">KES</span>
                        <input id="price" type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0" className="w-full pl-12 pr-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-bold tabular-nums" />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-4">
                      <label htmlFor="is_published" className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Publish Live</span>
                        <div className="relative">
                          <input id="is_published" type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} className="sr-only peer" />
                          <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </div>
                      </label>

                      <label htmlFor="featured" className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Feature Post</span>
                        <div className="relative">
                          <input id="featured" type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="sr-only peer" />
                          <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </div>
                      </label>
                    </div>

                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}