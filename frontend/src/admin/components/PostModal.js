import { useState, useEffect } from "react";
import { X, Upload, Loader, Eye, EyeOff } from "lucide-react";
import { createAdminPost, updateAdminPost } from "../services/adminApi";
import placeholder from "../../assets/article-placeholder.jpg";

// React Quill
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function PostModal({ open, post, onClose, refresh }) {
  const [formData, setFormData] = useState({
    title: "", excerpt: "", content: "", category: "General", 
    price: "150.00", featured: false, is_published: true, meta_description: ""
  });

  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(placeholder);
  const [loading, setLoading] = useState(false);
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

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (typeof formData[key] === "boolean") {
        payload.append(key, formData[key] ? "true" : "false");
      } else {
        payload.append(key, formData[key]);
      }
    });
    if (banner) payload.append("banner_image", banner);

    try {
      if (post) await updateAdminPost(post.slug, payload);
      else await createAdminPost(payload);
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  // 🔴 EXPANDED TOOLBAR OPTIONS
  const quillModules = {
    toolbar: [
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }], // Fonts & Sizes
      [{ 'header': [1, 2, 3, 4, false] }], // Headings
      ['bold', 'italic', 'underline', 'strike'], // Styles
      [{ 'color': [] }, { 'background': [] }], // Colors
      [{ 'align': [] }], // Alignment
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }], // Lists
      ['blockquote', 'code-block'], // Blocks
      ['link', 'image', 'video'], // Media
      ['clean'] // Remove formatting
    ],
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      
      {/* 🔴 STICKY TOOLBAR CSS OVERRIDES */}
      <style>{`
        .quill-editor .ql-toolbar.ql-snow {
          position: sticky;
          top: -32px; /* Offsets the p-8 padding exactly */
          z-index: 50;
          background: rgba(249, 250, 251, 0.98);
          backdrop-filter: blur(8px);
          border: none;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 12px 12px 0 0;
          padding: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .quill-editor .ql-container.ql-snow {
          border: none;
          min-height: 450px;
          font-size: 16px;
          font-family: inherit;
        }
      `}</style>

      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* HEADER */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">
              {post ? "Edit Article" : "New Article"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="overflow-y-auto p-8 flex-1 custom-scrollbar bg-white relative">
          <form id="post-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-10 relative">

            {/* LEFT COLUMN (Wide Editor) */}
            <div className="lg:col-span-3 space-y-6">

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</label>
                <input
                  name="title" value={formData.title} onChange={handleChange} required
                  className="w-full px-0 py-2 text-4xl font-serif font-black border-b-2 border-gray-100 focus:border-indigo-600 outline-none transition-colors bg-transparent placeholder:text-gray-200"
                  placeholder="Type your title here..."
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Excerpt</label>
                <textarea
                  name="excerpt" value={formData.excerpt} onChange={handleChange} rows={2}
                  className="w-full px-4 py-3 text-sm text-gray-800 bg-gray-50 rounded-xl border border-transparent focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none font-medium"
                  placeholder="A short, catchy summary..."
                />
              </div>

              {/* RICH TEXT CONTENT */}
              <div className="quill-editor relative">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Body Content</label>
                <div className="border border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all bg-white relative">
                  <ReactQuill 
                    theme="snow"
                    value={formData.content} 
                    onChange={handleContentChange} 
                    modules={quillModules}
                    placeholder="Write your story here..."
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Settings) */}
            <div className="space-y-8">

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cover Image</label>
                <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 h-48 hover:border-indigo-400 transition-colors">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <Upload className="text-white mb-2" size={24} />
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Change Image</span>
                  </div>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} accept="image/*" />
                </div>
              </div>

              {/* Visibility */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700">Visibility</label>
                  <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, is_published: true }))}
                      className={`p-1.5 rounded ${formData.is_published ? "bg-emerald-100 text-emerald-700 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      title="Publish"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, is_published: false }))}
                      className={`p-1.5 rounded ${!formData.is_published ? "bg-amber-100 text-amber-700 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      title="Save as Draft"
                    >
                      <EyeOff size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Meta Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <input
                    name="category" value={formData.category} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border-b border-gray-200 focus:border-indigo-600 outline-none bg-transparent font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Price (Kshs)</label>
                  <input
                    type="number" name="price" value={formData.price} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border-b border-gray-200 focus:border-indigo-600 outline-none bg-transparent font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">SEO Summary</label>
                  <textarea
                    name="meta_description" value={formData.meta_description} onChange={handleChange} rows={3} maxLength={160}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-600 outline-none resize-none bg-gray-50"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-right">{formData.meta_description.length}/160 chars</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id="featuredCheck" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4 text-indigo-600 cursor-pointer" />
                  <label htmlFor="featuredCheck" className="text-sm font-bold text-gray-700 cursor-pointer">Pin as Featured Story</label>
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-50">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button type="submit" form="post-form" disabled={loading} className="px-8 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader size={16} className="animate-spin" /> : "Save Article"}
          </button>
        </div>

      </div>
    </div>
  );
}