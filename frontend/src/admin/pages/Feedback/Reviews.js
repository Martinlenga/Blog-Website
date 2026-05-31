import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { getAdminFeedback, approveFeedback, updateFeedbackStatus, deleteFeedback } from "../../services/adminApi";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import TableToolbar from "../../components/TableToolbar";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Trash2, CheckCircle, XCircle, Star, MessageSquare, Mail, X, Calendar, ChevronDown } from "lucide-react";

// --- CUSTOM DROPDOWN COMPONENT ---
const CustomDropdown = ({ value, onChange, options, placeholder, displayMap }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative inline-block w-full sm:w-auto" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer flex items-center justify-between gap-2 hover:bg-white transition-colors"
      >
        <span className="truncate">{displayMap?.[value] || value || placeholder}</span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] w-full py-1">
          <div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer" onClick={() => { onChange(""); setIsOpen(false); }}>{placeholder}</div>
          {options.map((opt) => (
            <div key={opt} className="px-3 py-2 text-sm text-gray-800 hover:bg-indigo-50 cursor-pointer" onClick={() => { onChange(opt); setIsOpen(false); }}>
              {displayMap?.[opt] || opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Reviews() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const [viewFeedback, setViewFeedback] = useState(null); 
  const [deleteId, setDeleteId] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => { fetchFeedback(); }, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter, ratingFilter]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminFeedback({ page, pageSize, search, is_approved: statusFilter, rating: ratingFilter });
      setFeedbacks(data.results);
      setCount(data.count);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleToggleStatus = async (fb) => {
    const newStatus = !fb.is_approved;
    if (newStatus) await approveFeedback(fb.id);
    else await updateFeedbackStatus(fb.id, false);
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
    <div className="flex gap-0.5 shrink-0">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in-up pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet><title>Community Reviews | JK Admin</title></Helmet>
      
      <div className="mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Community Reviews</h1>
        <p className="text-gray-500 text-sm mt-0.5">Moderate incoming user feedback submissions and testimonials.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <TableToolbar search={search} setSearch={setSearch}>
             <div className="grid grid-cols-2 gap-2 w-full sm:w-auto mt-3 md:mt-0">
                <CustomDropdown value={statusFilter} onChange={setStatusFilter} options={["true", "false"]} displayMap={{"true": "Approved", "false": "Pending"}} placeholder="All Status" />
                <CustomDropdown value={ratingFilter} onChange={setRatingFilter} options={["5", "4", "3", "2", "1"]} displayMap={{"5": "5 Stars", "4": "4 Stars", "3": "3 Stars", "2": "2 Stars", "1": "1 Star"}} placeholder="All Ratings" />
             </div>
        </TableToolbar>

        <div className="overflow-x-auto w-full min-h-[400px] mt-4">
          <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                // Loading State
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">Loading reviews...</td>
                </tr>
              ) : feedbacks.length > 0 ? (
                // Data State
                feedbacks.map((fb) => (
                  <tr key={fb.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-gray-900">{fb.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{fb.email || "Anonymous"}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <RatingStars rating={fb.rating} />
                    </td>
                    <td className="px-6 py-4 align-top cursor-pointer" onClick={() => setViewFeedback(fb)}>
                      <p className="text-gray-700 line-clamp-2 hover:text-indigo-600 transition-colors">
                        "{fb.comment}"
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top text-center">
                      <StatusBadge value={fb.is_approved ? "APPROVED" : "PENDING"} type="pill" />
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleToggleStatus(fb)} className="p-1.5 hover:text-emerald-600">
                          {fb.is_approved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button onClick={() => setDeleteId(fb.id)} className="p-1.5 hover:text-rose-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty State (This is what you were missing!)
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <MessageSquare size={40} className="text-gray-200 mb-2" />
                      <p className="font-bold text-gray-900">No reviews found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
           <Pagination page={page} setPage={setPage} pageCount={Math.ceil(count / pageSize)} />
        </div>
      </div>

      {viewFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="font-serif text-lg font-bold text-gray-900">Review Details</h3>
              <button onClick={() => setViewFeedback(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{viewFeedback.name.charAt(0).toUpperCase()}</div>
                <div>
                   <h4 className="font-bold text-gray-900">{viewFeedback.name}</h4>
                   <div className="flex items-center gap-1 text-xs text-gray-400"><Mail size={10} /> {viewFeedback.email || "No email"}</div>
                </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <RatingStars rating={viewFeedback.rating} />
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} /> {new Date(viewFeedback.created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700 text-sm leading-relaxed italic relative">
                    <span className="absolute top-1 left-2 text-gray-200 text-3xl font-serif">“</span>
                    <p className="relative z-10 px-2">{viewFeedback.comment}</p>
                 </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
               <button onClick={() => setViewFeedback(null)} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-bold text-xs rounded-lg">Close</button>
               <button onClick={() => { handleToggleStatus(viewFeedback); setViewFeedback(null); }} className={`px-4 py-2 text-white font-bold text-xs rounded-lg ${viewFeedback.is_approved ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                  {viewFeedback.is_approved ? "Unapprove" : "Approve"}
               </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && <ConfirmDialog title="Delete Review?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}