import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Trash2, Edit, Star, Eye, Calendar, DollarSign, Filter, Search, Plus } from "lucide-react";
import { getAdminPosts, deleteAdminPost, bulkFeaturePosts } from "../../services/adminApi";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import PostModal from "../../components/PostModal";
import placeholder from "../../../assets/article-placeholder.jpg";

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // -- Filters --
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState(""); // Maps to is_published
  const [dateRange, setDateRange] = useState("");
  
  // -- Metadata --
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  // -- Modals --
  const [confirm, setConfirm] = useState({ open: false, slug: null });
  const [modal, setModal] = useState({ open: false, post: null });

  // 1. Fetch Posts (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 400); // Slight delay for typing search
    return () => clearTimeout(timer);
  }, [page, search, category, status, dateRange]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Align params with Django views.py
      const params = {
        page,
        search, // Matches SearchFilter
        category, // Matches custom get_queryset
        is_published: status, // Matches filterset_fields
        date_range: dateRange, // Matches custom get_queryset
      };

      const res = await getAdminPosts(params);
      setPosts(res.data.results);
      setPageCount(Math.ceil(res.data.count / 10));
      
      // Extract unique categories for filter
      const uniqueCats = [...new Set(res.data.results.map(p => p.category).filter(Boolean))];
      if(uniqueCats.length > 0) setCategories(uniqueCats);

    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
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
    <div className="animate-fade-in-up pb-10">

      <Helmet>
        <title>All Articles | JK Admin</title>
      </Helmet>
      
      {/* HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">All Articles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage, edit, and publish your content.</p>
        </div>
        <button
          onClick={() => setModal({ open: true, post: null })}
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-gray-200 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> New Article
        </button>
      </div>

      {/* FILTERS BAR (Custom Editorial Design) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" placeholder="Search by title, author..." 
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select 
            value={category} onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-indigo-500 outline-none cursor-pointer hover:bg-gray-50"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={status} onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-indigo-500 outline-none cursor-pointer hover:bg-gray-50"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Drafts</option>
          </select>

          <select 
            value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-indigo-500 outline-none cursor-pointer hover:bg-gray-50"
          >
            <option value="">Any Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-4 w-20">Cover</th>
                <th className="px-6 py-4">Article Details</th>
                <th className="px-6 py-4 text-center">Engagement</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-400">Loading articles...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-400">No articles found matching your filters.</td></tr>
              ) : (
                posts.map((post) => {
                  const img = post.banner_image ? (post.banner_image.startsWith("http") ? post.banner_image : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${post.banner_image}`) : placeholder;
                  
                  return (
                    <tr key={post.id} className="group hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <img src={img} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {post.category || "General"}
                          </span>
                          {post.featured && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                              <Star size={8} fill="currentColor" /> Featured
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-base font-bold text-gray-900 leading-snug mb-1 group-hover:text-indigo-700 transition-colors">
                          {post.title}
                        </h3>

                        {/* Meta Description (NEW) */}
                        {post.meta_description && (
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-1">
                            {post.meta_description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                          <span>{post.author || "Admin"}</span>
                          <span className="text-gray-300">•</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="text-xs font-medium text-gray-600 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md" title="Views">
                            <Eye size={12} /> {post.views}
                          </span>
                          {Number(post.price) > 0 && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1" title="Price">
                              KES {Number(post.price).toFixed(0)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge value={post.is_published ? "PUBLISHED" : "DRAFT"} type="dot" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button 
                            onClick={() => handleFeature(post.slug)}
                            className={`p-2 rounded-lg border transition-colors ${post.featured ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-white text-gray-400 border-gray-200 hover:text-amber-500 hover:border-amber-300"}`}
                            title="Toggle Feature"
                          >
                            <Star size={16} fill={post.featured ? "currentColor" : "none"} />
                          </button>
                          <button 
                            onClick={() => setModal({ open: true, post })}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setConfirm({ open: true, slug: post.slug })}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER PAGINATION */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
           <Pagination page={page} setPage={setPage} pageCount={pageCount} />
        </div>
      </div>

      {/* DIALOGS */}
      {confirm.open && (
        <ConfirmDialog
          title="Delete Article?"
          message="This action is permanent. The article and its analytics will be removed."
          confirmText="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirm({ open: false, slug: null })}
        />
      )}

      {modal.open && (
        <PostModal
          open={modal.open}
          post={modal.post}
          onClose={() => setModal({ open: false, post: null })}
          refresh={fetchPosts}
        />
      )}
    </div>
  );
}