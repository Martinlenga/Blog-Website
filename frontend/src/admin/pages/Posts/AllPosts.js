import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { Trash2, Edit, Star, Eye, Plus, Search, Filter, ChevronDown } from "lucide-react";
import { getAdminPosts, deleteAdminPost, bulkFeaturePosts } from "../../services/adminApi";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import PostModal from "../../components/PostModal";
import placeholder from "../../../assets/article-placeholder.jpg";

// --- CUSTOM DROPDOWN COMPONENT (Strictly replaces your <select> logic) ---
const CustomDropdown = ({ value, onChange, options, placeholder, displayMap }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative inline-block w-full" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-[10px] sm:text-xs text-gray-600 cursor-pointer flex items-center justify-between gap-2 truncate"
      >
        <span className="truncate">{displayMap?.[value] || value || placeholder}</span>
        <ChevronDown size={10} className="text-gray-400 shrink-0" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] w-full py-1">
          <div className="px-3 py-1.5 text-[11px] text-gray-500 hover:bg-gray-50 cursor-pointer" onClick={() => { onChange(""); setIsOpen(false); }}>{placeholder}</div>
          {options.map((opt) => (
            <div key={opt} className="px-3 py-1.5 text-[11px] text-gray-800 hover:bg-indigo-50 cursor-pointer" onClick={() => { onChange(opt); setIsOpen(false); }}>
              {displayMap?.[opt] || opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState(""); 
  const [dateRange, setDateRange] = useState("");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, slug: null });
  const [modal, setModal] = useState({ open: false, post: null });

  useEffect(() => {
    const timer = setTimeout(() => { fetchPosts(); }, 400); 
    return () => clearTimeout(timer);
  }, [page, search, category, status, dateRange]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page, search, category, is_published: status, date_range: dateRange };
      const res = await getAdminPosts(params);
      setPosts(res.data.results);
      setPageCount(Math.ceil(res.data.count / 10));
      const uniqueCats = [...new Set(res.data.results.map(p => p.category).filter(Boolean))];
      if(uniqueCats.length > 0) setCategories(uniqueCats);
    } catch (err) { console.error("Failed to fetch posts:", err); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (confirm.slug) {
      await deleteAdminPost(confirm.slug);
      fetchPosts();
      setConfirm({ open: false, slug: null });
    }
  };

  const handleFeature = async (slug) => {
    await bulkFeaturePosts([slug]);
    fetchPosts();
  };

  return (
    <div className="animate-fade-in-up pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet><title>All Articles | JK Admin</title></Helmet>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">All Articles</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage, edit, and publish your content pipeline.</p>
        </div>
        <button onClick={() => setModal({ open: true, post: null })} className="bg-gray-900 hover:bg-gray-800 text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={16} /> New Article
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="relative w-full xl:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" placeholder="Search by title, author..." 
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 w-full xl:w-auto">
          <CustomDropdown value={category} onChange={setCategory} options={categories} placeholder="Category" />
          <CustomDropdown value={status} onChange={setStatus} options={["true", "false"]} displayMap={{"true": "Published", "false": "Drafts"}} placeholder="Status" />
          <CustomDropdown value={dateRange} onChange={setDateRange} options={["7", "30"]} displayMap={{"7": "7 Days", "30": "30 Days"}} placeholder="Time" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[750px] lg:min-w-0">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-4 sm:px-6 py-4 w-24">Cover</th>
                <th className="px-4 sm:px-6 py-4">Article Details</th>
                <th className="px-4 sm:px-6 py-4 text-center w-32">Engagement</th>
                <th className="px-4 sm:px-6 py-4 text-center w-28">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-400 text-xs sm:text-sm">Loading articles...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-400 text-xs sm:text-sm">No articles found matching your filters.</td></tr>
              ) : (
                posts.map((post) => {
                  const img = post.banner_image ? (post.banner_image.startsWith("http") ? post.banner_image : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${post.banner_image}`) : placeholder;
                  return (
                    <tr key={post.id} className="group hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 sm:px-6 py-4 align-top"><img src={img} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-xs shrink-0 bg-gray-50" /></td>
                      <td className="px-4 sm:px-6 py-4 max-w-xs sm:max-w-md">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{post.category || "General"}</span>
                          {post.featured && <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-0.5"><Star size={8} fill="currentColor" /> Featured</span>}
                        </div>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-gray-900 leading-snug mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{post.title}</h3>
                        <div className="flex items-center gap-2.5 text-[11px] text-gray-400 font-medium"><span className="truncate max-w-[120px]">{post.author || "Admin"}</span><span>•</span><span>{new Date(post.created_at).toLocaleDateString()}</span></div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center align-top">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><Eye size={10} /> {post.views}</span>
                          {Number(post.price) > 0 && <span className="text-xs font-bold text-emerald-600">Kshs {Number(post.price).toFixed(0)}</span>}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center align-top"><StatusBadge value={post.is_published ? "PUBLISHED" : "DRAFT"} type="dot" /></td>
                      <td className="px-4 sm:px-6 py-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                          <button onClick={() => handleFeature(post.slug)} className={`p-2 rounded-lg border text-xs font-medium transition-all shadow-2xs ${post.featured ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-white text-gray-400 border-gray-200 hover:text-amber-500 hover:border-amber-300"}`}><Star size={14} fill={post.featured ? "currentColor" : "none"} /></button>
                          <button onClick={() => setModal({ open: true, post })} className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs"><Edit size={14} /></button>
                          <button onClick={() => setConfirm({ open: true, slug: post.slug })} className="p-2 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-rose-600 hover:border-rose-300 shadow-2xs"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50"><Pagination page={page} setPage={setPage} pageCount={pageCount} /></div>
      </div>
      {confirm.open && <ConfirmDialog title="Delete Article?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, slug: null })} />}
      {modal.open && <PostModal open={modal.open} post={modal.post} onClose={() => setModal({ open: false, post: null })} refresh={fetchPosts} />}
    </div>
  );
}