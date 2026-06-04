import { useState, useEffect, useMemo } from "react";
import imageCompression from 'browser-image-compression';
import { Loader, CheckCircle, Upload, Image as ImageIcon, Settings } from "lucide-react";
import { createAdminPost, updateAdminPost } from "../services/adminApi";
import placeholder from "../../assets/article-placeholder.jpg"; 

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function PostModal({ open, post, onClose, refresh }) {
  const [formData, setFormData] = useState({
    title: "", excerpt: "", content: "", category: "General", 
    price: "150.00", featured: false, is_published: true, meta_description: ""
  });

  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(placeholder);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (post && open) {
      setFormData({
        title: post.title || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        category: post.category || "General",
        price: post.price ? Number(post.price).toFixed(2) : "150.00",
        featured: post.featured || false,
        is_published: post.is_published !== undefined ? post.is_published : true,
        meta_description: post.meta_description || ""
      });
      
      const img = post.banner_image 
        ? (post.banner_image.startsWith("http") ? post.banner_image : `${process.env.REACT_APP_API_URL?.replace("/api", "")}${post.banner_image}`) 
        : placeholder;
      
      setPreview(img);
      setBanner(null); 
    } else if (open) {
      setFormData({ 
        title: "", excerpt: "", content: "", category: "General", 
        price: "150.00", featured: false, is_published: true, meta_description: "" 
      });
      setPreview(placeholder);
      setBanner(null);
    }
    setErrors({});
  }, [post, open]);

  // 🚀 RE-ENGINEERED QUILL: Strips messy formatting on paste and removes unnecessary heading options
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [2, 3, 4, false] }], // H1 removed. The article title is the H1.
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video', 'code-block'],
      ['clean'] // 🚀 CRITICAL: The "Remove Formatting" button
    ],
    clipboard: {
      matchVisual: false, // 🚀 Prevents Quill from adding massive extra spacing when pasting from Word/Notion
    }
  }), []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
    if (errors.content) setErrors(prev => ({ ...prev, content: null }));
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview("loading"); 
      
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
      try {
        const compressed = await imageCompression(file, options);
        
        const renamedFile = new File([compressed], file.name, { 
          type: file.type,
          lastModified: Date.now()
        });
        
        setBanner(renamedFile);
        setPreview(URL.createObjectURL(renamedFile));
      } catch (err) {
        console.error("Compression failed:", err);
        alert("Failed to compress image. Please try a smaller file.");
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
      payload.append(key, typeof value === "boolean" ? (value ? "true" : "false") : value);
    });

    if (banner instanceof File) {
      payload.append("banner_image", banner, banner.name);
    }

    try {
      if (post) {
        await updateAdminPost(post.slug, payload); 
      } else {
        await createAdminPost(payload);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        refresh();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      setErrors(err.response?.data || { general: "Failed to save article" });
      document.querySelector('.custom-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

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

      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <style>{`
          /* 🚀 ADMIN WYSIWYG FIX: Force the editor to behave EXACTLY like the public UI */
          .quill-editor .ql-toolbar.ql-snow { 
            position: sticky; top: 0; z-index: 50; 
            background: white; border: none; 
            border-bottom: 1px solid #e5e7eb; 
            border-radius: 12px 12px 0 0; padding: 12px; 
          }
          .quill-editor .ql-container.ql-snow { 
            border: none; 
            min-height: 500px; 
            font-size: 16px; 
            font-family: inherit; 
          }
          .quill-editor .ql-editor { 
            padding: 2rem 1.5rem; 
            word-break: normal !important; 
            overflow-wrap: break-word !important; 
            hyphens: none !important;
            -webkit-hyphens: none !important;
          }
          .quill-editor .ql-editor p, 
          .quill-editor .ql-editor span, 
          .quill-editor .ql-editor li {
            text-align: left; 
            white-space: pre-wrap !important;
          }
          .quill-editor .ql-editor img {
            border-radius: 8px;
            max-width: 100% !important;
          }
        `}</style>

        <div className="bg-gray-50 w-full max-w-[1400px] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[98vh] sm:h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
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
              <button 
                type="button" 
                onClick={onClose} 
                disabled={loading}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
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

          {/* Body & Form Layout */}
          <div className="overflow-y-auto flex-1 custom-scrollbar relative">
            <form id="post-form" onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">
                
                {/* 📝 LEFT COLUMN: The Writing Zone */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Title & Excerpt Box */}
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                    <div>
                      <input 
                        id="title" name="title" aria-label="Article Title"
                        value={formData.title} onChange={handleChange} required 
                        className={`w-full px-0 py-2 text-3xl sm:text-4xl font-serif font-black border-b-2 outline-none transition-colors placeholder:text-gray-300 ${errors.title ? 'border-rose-400 text-rose-900' : 'border-gray-100 focus:border-indigo-600 text-gray-900'}`} 
                        placeholder="Enter a compelling title..." 
                      />
                      {errors.title && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.title}</p>}
                    </div>

                    <div>
                      <textarea 
                        id="excerpt" name="excerpt" aria-label="Article Excerpt"
                        value={formData.excerpt} onChange={handleChange} rows={2} 
                        className={`w-full px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-xl border outline-none transition-colors placeholder:text-gray-400 focus:bg-white ${errors.excerpt ? 'border-rose-300 focus:border-rose-500' : 'border-transparent focus:border-indigo-300'}`} 
                        placeholder="Write a brief, catchy summary for the article cards..." 
                      />
                      {errors.excerpt && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.excerpt}</p>}
                    </div>
                  </div>

                  {/* Rich Text Editor Box */}
                  <div className={`bg-white rounded-2xl border shadow-sm ${errors.content ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-200'}`}>
                    <div className="quill-editor rounded-2xl overflow-hidden">
                      <ReactQuill 
                        id="content" theme="snow" 
                        value={formData.content} 
                        onChange={handleContentChange} 
                        modules={quillModules} 
                        placeholder="Begin writing your masterpiece..." 
                      />
                    </div>
                    {errors.content && <p className="text-rose-500 text-xs font-bold px-6 pb-4">{errors.content}</p>}
                  </div>

                </div>

                {/* ⚙️ RIGHT COLUMN: Settings Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Banner Image Card */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <label htmlFor="banner_image" className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
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
                      
                      <input 
                        id="banner_image" name="banner_image" type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        onChange={handleFile} accept="image/jpeg, image/png, image/webp" 
                      />
                    </div>
                    {errors.banner_image && <p className="text-rose-500 text-xs font-bold mt-2">{errors.banner_image}</p>}
                  </div>

                  {/* Settings Card */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                    
                    <div>
                      <label htmlFor="category" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                      <input
                        id="category" type="text" name="category" value={formData.category} onChange={handleChange} placeholder="General"
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Access Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">KES</span>
                        <input 
                          id="price" type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0"
                          className="w-full pl-12 pr-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-bold tabular-nums" 
                        />
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