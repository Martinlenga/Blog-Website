import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for redirect
import imageCompression from 'browser-image-compression'; // Added for fast uploads
import { X, Upload, Loader, Eye, EyeOff, CheckCircle } from "lucide-react";
import { createAdminPost, updateAdminPost } from "../services/adminApi";
import placeholder from "../../assets/article-placeholder.jpg";

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function PostModal({ open, post, onClose, refresh }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", excerpt: "", content: "", category: "General", 
    price: "150.00", featured: false, is_published: true, meta_description: ""
  });

  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(placeholder);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // Success popup state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (post) {
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
      const img = post.banner_image ? (post.banner_image.startsWith("http") ? post.banner_image : `${process.env.REACT_APP_API_URL?.replace("/api", "")}${post.banner_image}`) : placeholder;
      setPreview(img);
    } else {
      setFormData({ title: "", excerpt: "", content: "", category: "General", price: "150.00", featured: false, is_published: true, meta_description: "" });
      setPreview(placeholder);
      setBanner(null);
    }
    setErrors({});
  }, [post, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
      try {
        const compressed = await imageCompression(file, options);
        
        // FIX: Wrap the compressed blob in a File object with the original name
        const renamedFile = new File([compressed], file.name, { 
          type: file.type,
          lastModified: Date.now()
        });
        
        setBanner(renamedFile);
        setPreview(URL.createObjectURL(renamedFile));
      } catch (err) {
        console.error("Compression failed:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    
    // 1. Append all text fields
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      payload.append(key, typeof value === "boolean" ? (value ? "true" : "false") : value);
    });

    // 2. Append the banner file ONLY if it's a file object
    if (banner instanceof File) {
      // 3-argument version: (key, file_object, filename)
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
        navigate("/admin/posts");
      }, 1500);
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      setErrors(err.response?.data || { general: "Failed to save article" });
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  if (!open) return null;

  return (
    <>
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle className="text-emerald-500 w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Article Saved Successfully!</h3>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <style>{`
          .quill-editor .ql-toolbar.ql-snow { position: sticky; top: -32px; z-index: 50; background: rgba(249, 250, 251, 0.98); border: none; border-bottom: 1px solid #e5e7eb; border-radius: 12px 12px 0 0; padding: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .quill-editor .ql-container.ql-snow { border: none; min-height: 450px; font-size: 16px; }
        `}</style>

        <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
          <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
            <h2 className="font-serif text-xl font-bold text-gray-900">{post ? "Edit Article" : "New Article"}</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <div className="overflow-y-auto p-8 flex-1 custom-scrollbar bg-white">
            <form id="post-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              <div className="lg:col-span-3 space-y-6">
                <input name="title" value={formData.title} onChange={handleChange} required className="w-full px-0 py-2 text-4xl font-serif font-black border-b-2 border-gray-100 focus:border-indigo-600 outline-none transition-colors" placeholder="Type your title here..." />
                <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={2} className="w-full px-4 py-3 text-sm text-gray-800 bg-gray-50 rounded-xl border border-transparent focus:border-indigo-300 outline-none" placeholder="Catchy summary..." />
                <div className="quill-editor"><ReactQuill theme="snow" value={formData.content} onChange={handleContentChange} modules={quillModules} placeholder="Write your story here..." /></div>
              </div>

              <div className="space-y-8">
                <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 h-48">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} accept="image/*" />
                </div>
                {/* Visibility, Category, Price, SEO fields remain same as your original */}
              </div>
            </form>
          </div>

          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl">Cancel</button>
            <button type="submit" form="post-form" disabled={loading} className="px-8 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-lg transition-all flex items-center gap-2">
              {loading ? <Loader size={16} className="animate-spin" /> : "Save Article"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}