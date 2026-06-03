import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getAdminFeedback, approveFeedback, updateFeedbackStatus, deleteFeedback } from "../../services/adminApi";

// 🚀 Reusing our polished UI toolkit
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import TableToolbar from "../../components/TableToolbar";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { TableSkeleton } from "../../components/Skeleton";
import NewDataBadge from '../../components/NewDataBadge';

import { Trash2, CheckCircle, XCircle, Star, MessageSquare, Mail, X, Calendar, ChevronDown } from "lucide-react";

export default function Reviews() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  
  // Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // Modal/Dialog State
  const [viewFeedback, setViewFeedback] = useState(null); 
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 🚀 NOTIFICATION STATE
  const [hasNewItems, setHasNewItems] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to force a manual refresh

  // 🚀 PERFORMANCE FIX: Proper Debounced API Fetching
  useEffect(() => {
    let isMounted = true;

    const fetchFeedback = async () => {
      // Only show the hard loading spinner if it's the very first load or a filter change
      if (feedbacks.length === 0 || search) setLoading(true); 
      try {
        const { data } = await getAdminFeedback({ 
          page, 
          pageSize, 
          search, 
          is_approved: statusFilter, 
          rating: ratingFilter 
        });
        if (isMounted) {
          setFeedbacks(data.results || []);
          setCount(data.count || 0);
          setHasNewItems(false); // Clear the badge automatically if a natural fetch happens
        }
      } catch (err) { 
        if (isMounted) console.error(err); 
      } finally { 
        if (isMounted) setLoading(false); 
      }
    };

    const timer = setTimeout(() => { 
      fetchFeedback(); 
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  // 👇 Added refreshTrigger here so clicking the badge fires this effect again
  }, [page, search, statusFilter, ratingFilter, refreshTrigger]); 

  // 🚀 THE SILENT POLLER
  useEffect(() => {
    // We only want to poll if the user is looking at the newest stuff (Page 1, no search)
    if (page !== 1 || search) return;

    const interval = setInterval(async () => {
      try {
        // We only fetch 1 item just to check the ID. Very light on the Contabo server!
        const { data } = await getAdminFeedback({ 
          page: 1, 
          pageSize: 1, 
          is_approved: statusFilter, 
          rating: ratingFilter 
        });
        
        const latestServerItem = data.results[0];
        const latestLocalItem = feedbacks[0];

        // If the server has a newer item than what is on the screen, pop the badge!
        if (latestServerItem && latestLocalItem && latestServerItem.id !== latestLocalItem.id) {
          setHasNewItems(true);
        }
      } catch (err) { 
        // Fail silently
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [feedbacks, page, search, statusFilter, ratingFilter]);

  // Handle Badge Click
  const handleRefreshClick = () => {
    setHasNewItems(false);
    setRefreshTrigger(prev => prev + 1); // This tells the main useEffect to run again!
  };

  // Handle Approve/Unapprove
  const handleToggleStatus = async (fb) => {
    setActionLoading(true);
    try {
      const newStatus = !fb.is_approved;
      if (newStatus) await approveFeedback(fb.id);
      else await updateFeedbackStatus(fb.id, false);
      
      // Optimistically update the UI to feel instant
      setFeedbacks(prev => prev.map(item => item.id === fb.id ? { ...item, is_approved: newStatus } : item));
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await deleteFeedback(deleteId);
      // Optimistically remove from UI
      setFeedbacks(prev => prev.filter(fb => fb.id !== deleteId));
      setDeleteId(null);
      // Adjust count so pagination doesn't break
      setCount(prev => Math.max(prev - 1, 0)); 
    } catch (err) {
      console.error(err);
      alert("Failed to delete review.");
    } finally {
      setActionLoading(false);
    }
  };

  const RatingStars = ({ rating }) => (
    <div className="flex gap-0.5 shrink-0" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
      ))}
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet><title>Community Reviews | JK Admin</title></Helmet>

      <NewDataBadge 
        show={hasNewItems} 
        onClick={handleRefreshClick} 
        label="New reviews available" 
      />
      
      <div className="mb-6 sm:mb-8 border-b border-gray-100 pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Community Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Moderate incoming user feedback submissions and testimonials.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        
        {/* TOOLBAR */}
        <TableToolbar 
          search={search} 
          setSearch={(val) => { setSearch(val); setPage(1); }} // Reset to page 1 on search
        >
           {/* Custom Filters injected as children */}
           <div className="flex items-center gap-2 w-full sm:w-auto mt-3 md:mt-0 relative">
             <select
                id="statusFilter"
                name="statusFilter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px] sm:text-xs font-medium text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>
             <ChevronDown size={12} className="absolute left-[85px] top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
             
             
             <select
                id="ratingFilter"
                name="ratingFilter"
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px] sm:text-xs font-medium text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ml-1"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
             <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
           </div>
        </TableToolbar>

        {/* DATA TABLE */}
        <div className="overflow-x-auto w-full mt-4">
          <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
            <thead>
              <tr className="border-y border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8">
                    <TableSkeleton rows={5} cols={5} />
                  </td>
                </tr>
              ) : feedbacks.length > 0 ? (
                feedbacks.map((fb) => (
                  <tr key={fb.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-gray-900">{fb.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{fb.email || "Anonymous"}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="mt-1"><RatingStars rating={fb.rating} /></div>
                    </td>
                    <td 
                      className="px-6 py-4 align-top cursor-pointer" 
                      onClick={() => setViewFeedback(fb)}
                    >
                      <p className="text-gray-700 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                        "{fb.comment}"
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top text-center">
                      <div className="mt-0.5">
                        <StatusBadge value={fb.is_approved ? "APPROVED" : "PENDING"} type="pill" />
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex justify-end gap-1 mt-0.5">
                        <button 
                          onClick={() => handleToggleStatus(fb)} 
                          disabled={actionLoading}
                          title={fb.is_approved ? "Unapprove Review" : "Approve Review"}
                          className={`p-2 rounded-lg transition-colors ${fb.is_approved ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'} disabled:opacity-50`}
                        >
                          {fb.is_approved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button 
                          onClick={() => setDeleteId(fb.id)} 
                          disabled={actionLoading}
                          title="Delete Review"
                          className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState 
                      title="No reviews found" 
                      description={search || statusFilter || ratingFilter ? "Try clearing your filters or adjusting your search term." : "Your community hasn't left any reviews yet."}
                      icon={<MessageSquare size={32} className="text-gray-400" />}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
           <Pagination page={page} setPage={setPage} pageCount={Math.max(Math.ceil(count / pageSize), 0)} />
        </div>
      </div>

      {/* REVIEW DETAILS MODAL */}
      {viewFeedback && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="font-serif text-lg font-bold text-gray-900">Review Details</h3>
              <button onClick={() => setViewFeedback(null)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
                  {viewFeedback.name.charAt(0).toUpperCase()}
                </div>
                <div>
                   <h4 className="font-bold text-gray-900 text-lg leading-tight">{viewFeedback.name}</h4>
                   <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                     <Mail size={12} /> {viewFeedback.email || "No email provided"}
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <RatingStars rating={viewFeedback.rating} />
                    <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5"><Calendar size={12} /> {new Date(viewFeedback.created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-gray-700 text-sm leading-relaxed italic relative shadow-inner">
                    <span className="absolute top-2 left-2 text-gray-200 text-4xl font-serif">“</span>
                    <p className="relative z-10 px-3 pt-2">{viewFeedback.comment}</p>
                 </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
               <button 
                 onClick={() => setViewFeedback(null)} 
                 className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-xl transition-colors"
               >
                 Close
               </button>
               <button 
                 onClick={() => { handleToggleStatus(viewFeedback); setViewFeedback(null); }} 
                 className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95 ${viewFeedback.is_approved ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
               >
                 {viewFeedback.is_approved ? "Revoke Approval" : "Approve Review"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {deleteId && (
        <ConfirmDialog 
          title="Delete Review?" 
          message="Are you sure you want to permanently delete this review? This action cannot be undone."
          confirmText="Yes, Delete"
          isLoading={actionLoading}
          onConfirm={handleDelete} 
          onCancel={() => setDeleteId(null)} 
        />
      )}
    </div>
  );
}