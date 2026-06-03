import React, { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { getAdminPosts, deleteAdminPost, bulkFeaturePosts } from "../../services/adminApi";

// 🚀 Utilizing your complete, reusable UI Toolkit!
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import PostModal from "../../components/PostModal";
import TableToolbar from "../../components/TableToolbar";
import EmptyState from "../../components/EmptyState";
import { TableSkeleton } from "../../components/Skeleton";

import { Trash2, Edit, Star, Eye, Plus, ChevronDown, FileText } from "lucide-react";
import placeholder from "../../../assets/article-placeholder.jpg";

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState(""); 
  const [dateRange, setDateRange] = useState("");
  const [categories, setCategories] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  
  // Modals
  const [confirm, setConfirm] = useState({ open: false, slug: null });
  const [modal, setModal] = useState({ open: false, post: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        search,
        category,
        is_published: status,
        date_range: dateRange,
      };

      const res = await getAdminPosts(params);

      setPosts(res.data.results || []);

      setPageCount(
        Math.max(Math.ceil((res.data.count || 0) / 10), 1)
      );

      const uniqueCats = [
        ...new Set(
          (res.data.results || [])
            .map((p) => p.category)
            .filter(Boolean)
        ),
      ];

      setCategories(uniqueCats);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, status, dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 400);

    return () => clearTimeout(timer);
  }, [fetchPosts]);

  const handleDelete = async () => {
    if (confirm.slug) {
      setActionLoading(true);
      try {
        await deleteAdminPost(confirm.slug);
        setPosts(prev => prev.filter(p => p.slug !== confirm.slug));
        setConfirm({ open: false, slug: null });
      } catch (err) {
        alert("Failed to delete post.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleFeature = async (slug) => {
    try {
      await bulkFeaturePosts([slug]);

      setPosts(prev =>
        prev.map(p => ({
          ...p,
          featured: p.slug === slug
        }))
      );
    } catch (err) {
      alert("Failed to update feature status.");
    }
  };

  // Helper for filter resets to fix the Pagination Bug
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet><title>All Articles | JK Admin</title></Helmet>
      
      {/* HEADER ACTION ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 border-b border-gray-100 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">All Articles</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage, edit, and publish your content pipeline.</p>
        </div>
        <button 
          onClick={() => setModal({ open: true, post: null })} 
          className="bg-gray-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        >
          <Plus size={16} /> New Article
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-5">
        
        {/* 🚀 TOOLBAR REUSABILITY: Leveraging native props exactly like PostAccess */}
        <TableToolbar 
          search={search} 
          setSearch={(val) => handleFilterChange(setSearch, val)}
          category={category}
          setCategory={(val) => handleFilterChange(setCategory, val)}
          categories={categories}
          dateRange={dateRange}
          setDateRange={(val) => handleFilterChange(setDateRange, val)}
        >
          {/* Status Filter: Compact and beautifully styled for mobile */}
          <div className="relative mt-3 sm:mt-0 shrink-0 self-start sm:self-auto">
             <select
                id="postStatus"
                name="postStatus"
                value={status}
                onChange={(e) => handleFilterChange(setStatus, e.target.value)}
                className="appearance-none w-[130px] sm:w-[150px] pl-3 pr-8 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all hover:bg-gray-100 shadow-sm"
              >
                <option value="">All Statuses</option>
                <option value="true">Published</option>
                <option value="false">Drafts</option>
              </select>
             <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
           </div>
        </TableToolbar>

        {/* DATA TABLE */}
        <div className="overflow-x-auto w-full mt-4">
          <table className="w-full text-left border-collapse min-w-[750px] lg:min-w-0">
            <thead>
              <tr className="border-y border-gray-100 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-4 sm:px-6 py-4 w-24">Cover</th>
                <th className="px-4 sm:px-6 py-4">Article Details</th>
                <th className="px-4 sm:px-6 py-4 text-center w-32">Engagement</th>
                <th className="px-4 sm:px-6 py-4 text-center w-28">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {/* SKELETON REUSABILITY */}
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8">
                    <TableSkeleton rows={5} cols={5} />
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                
                /* EMPTY STATE REUSABILITY */
                <tr>
                  <td colSpan="5">
                    <EmptyState 
                      title="No articles found" 
                      description={search || category || status || dateRange ? "Try clearing your filters or adjusting your search term." : "You haven't published any articles yet."}
                      icon={<FileText size={32} className="text-gray-400" />}
                    />
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const img = post.banner_image ? (post.banner_image.startsWith("http") ? post.banner_image : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${post.banner_image}`) : placeholder;
                  
                  return (
                    <tr key={post.id} className="group hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 sm:px-6 py-4 align-top">
                        <img src={img} alt="" className="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-sm shrink-0 bg-gray-50" />
                      </td>
                      <td className="px-4 sm:px-6 py-4 max-w-xs sm:max-w-md">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 shrink-0">
                            {post.category || "General"}
                          </span>
                          {post.featured && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5 shrink-0 shadow-sm">
                              <Star size={8} fill="currentColor" /> Featured
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-gray-900 leading-snug mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                          <span className="truncate max-w-[120px]">{post.author || "Admin"}</span>
                          <span>•</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center align-top">
                        <div className="inline-flex flex-col items-center gap-1.5 mt-1">
                          <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                            <Eye size={12} className="text-gray-400" /> {(post.views || 0).toLocaleString()}
                          </span>
                          {Number(post.price) > 0 && (
                            <span className="text-xs font-bold text-emerald-600">
                              Kshs {Number(post.price).toFixed(0)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center align-top">
                        <div className="mt-1">
                          <StatusBadge value={post.is_published ? "PUBLISHED" : "DRAFT"} type="pill" />
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5 mt-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                          <button 
                            onClick={() => handleFeature(post.slug)} 
                            title={post.featured ? "Remove from Featured" : "Feature Article"}
                            className={`p-2 rounded-lg border transition-all ${post.featured ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" : "bg-white text-gray-400 border-gray-200 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50 shadow-sm"}`}
                          >
                            <Star size={16} fill={post.featured ? "currentColor" : "none"} />
                          </button>
                          
                          <button 
                            onClick={() => setModal({ open: true, post })} 
                            title="Edit Article"
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button 
                            onClick={() => setConfirm({ open: true, slug: post.slug })} 
                            title="Delete Article"
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 shadow-sm transition-all"
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
        
        {/* PAGINATION */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl mt-2">
          <Pagination page={page} setPage={setPage} pageCount={pageCount} />
        </div>
      </div>
      
      {/* MODALS */}
      {confirm.open && (
        <ConfirmDialog 
          title="Delete Article?" 
          message="Are you sure you want to delete this article? This action cannot be undone."
          confirmText="Yes, Delete"
          isLoading={actionLoading}
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