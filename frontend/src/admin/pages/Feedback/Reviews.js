import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getAdminFeedback, approveFeedback, updateFeedbackStatus, deleteFeedback } from "../../services/adminApi";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import TableToolbar from "../../components/TableToolbar";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Trash2, CheckCircle, XCircle, Star, MessageSquare, Mail, X, Calendar } from "lucide-react";

export default function Reviews() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const [viewFeedback, setViewFeedback] = useState(null); // Changed name for clarity
  const [deleteId, setDeleteId] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchFeedback();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter, ratingFilter]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminFeedback({
        page, 
        pageSize, 
        search, 
        is_approved: statusFilter, // 🔴 FIX: Changed from isApproved to is_approved
        rating: ratingFilter
      });
      setFeedbacks(data.results);
      setCount(data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (fb) => {
    const newStatus = !fb.is_approved;
    if (newStatus) {
        await approveFeedback(fb.id);
    } else {
        await updateFeedbackStatus(fb.id, false);
    }
    fetchFeedback();
  };

  const handleDelete = async () => {
    if (deleteId) {
        await deleteFeedback(deleteId);
        setDeleteId(null);
        fetchFeedback();
    }
  };

  const RatingStars = ({ rating }) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={14} 
          className={i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} 
        />
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in-up pb-10">

      <Helmet>
        <title>Community Reviews | JK Admin</title>
      </Helmet>
      
      {/* 1. Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Community Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Moderate user feedback and testimonials.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        
        {/* 2. Enhanced Toolbar */}
        <TableToolbar 
          search={search} setSearch={setSearch}
          children={
             <div className="flex gap-2">
                <select 
                  value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-indigo-500 outline-none cursor-pointer hover:bg-white transition-colors"
                >
                   <option value="">All Status</option>
                   <option value="true">Approved</option>
                   <option value="false">Pending</option>
                </select>
                <select 
                  value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-indigo-500 outline-none cursor-pointer hover:bg-white transition-colors"
                >
                   <option value="">All Ratings</option>
                   <option value="5">5 Stars</option>
                   <option value="4">4 Stars</option>
                   <option value="3">3 Stars</option>
                   <option value="2">2 Stars</option>
                   <option value="1">1 Star</option>
                </select>
             </div>
          }
        />

        {/* 3. The List */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-4 w-64">User</th>
                <th className="px-6 py-4 w-32">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4 text-center w-32">Status</th>
                <th className="px-6 py-4 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-400">Loading reviews...</td></tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                    <td colSpan="5" className="p-16 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare size={48} className="mb-4 text-gray-200" />
                            <p className="font-medium text-gray-900">No reviews found</p>
                            <p className="text-sm">Your community is quiet for now.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                feedbacks.map((fb) => (
                  <tr key={fb.id} className="group hover:bg-gray-50/80 transition-colors">
                    
                    {/* User */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {fb.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <div className="font-bold text-gray-900 text-sm">{fb.name}</div>
                           <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                {fb.email || "Anonymous"}
                           </div>
                           <div className="text-[10px] text-gray-400 mt-1">
                                {new Date(fb.created_at).toLocaleDateString()}
                           </div>
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4 align-top">
                      <RatingStars rating={fb.rating} />
                      <span className="text-xs font-bold text-gray-400 mt-1 block">{fb.rating}.0 / 5.0</span>
                    </td>

                    {/* Comment */}
                    <td className="px-6 py-4 align-top">
                      <p 
                        className="text-sm text-gray-600 leading-relaxed line-clamp-2 cursor-pointer hover:text-indigo-700 transition-colors"
                        onClick={() => setViewFeedback(fb)}
                        title="Click to read full review"
                      >
                        "{fb.comment}"
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 align-top text-center">
                      <StatusBadge value={fb.is_approved ? "APPROVED" : "PENDING"} type="pill" />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button 
                          onClick={() => handleToggleStatus(fb)}
                          className={`p-2 rounded-lg border transition-colors ${
                             fb.is_approved 
                               ? 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100' 
                               : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                          title={fb.is_approved ? "Reject Review" : "Approve Review"}
                        >
                           {fb.is_approved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button 
                          onClick={() => setDeleteId(fb.id)}
                          className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-white transition-colors"
                          title="Delete Permanently"
                        >
                           <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
           <Pagination page={page} setPage={setPage} pageCount={Math.ceil(count / pageSize)} />
        </div>
      </div>

      {/* --- CUSTOM READ MODAL (Fixed) --- */}
      {viewFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-serif text-lg font-bold text-gray-900">Review Details</h3>
              <button onClick={() => setViewFeedback(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                   {viewFeedback.name.charAt(0).toUpperCase()}
                </div>
                <div>
                   <h4 className="font-bold text-gray-900">{viewFeedback.name}</h4>
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail size={12} /> {viewFeedback.email || "No email"}
                   </div>
                </div>
              </div>

              <div className="mb-4">
                 <div className="flex items-center justify-between mb-2">
                    <RatingStars rating={viewFeedback.rating} />
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                       <Calendar size={12} /> {new Date(viewFeedback.created_at).toLocaleDateString()}
                    </span>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700 text-sm leading-relaxed italic relative">
                    <span className="absolute top-2 left-2 text-gray-300 text-4xl font-serif leading-none">“</span>
                    <p className="relative z-10 px-2">{viewFeedback.comment}</p>
                 </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
               <button 
                 onClick={() => setViewFeedback(null)}
                 className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors"
               >
                 Close
               </button>
               {/* Optional: Add Approve/Reject inside modal too */}
               <button 
                 onClick={() => { handleToggleStatus(viewFeedback); setViewFeedback(null); }}
                 className={`px-4 py-2 text-white font-bold text-sm rounded-lg transition-colors ${viewFeedback.is_approved ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
               >
                 {viewFeedback.is_approved ? "Unapprove" : "Approve"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <ConfirmDialog 
          title="Delete Review?"
          message="Are you sure you want to permanently delete this feedback? This action cannot be undone."
          confirmText="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}