import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getAdminComments, approveAdminComment, updateAdminComment, deleteAdminComment } from "../../services/adminApi";

// Reusing our polished UI toolkit
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import TableToolbar from "../../components/TableToolbar";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { TableSkeleton } from "../../components/Skeleton";
import NewDataBadge from '../../components/NewDataBadge';

import { Trash2, CheckCircle, XCircle, MessageSquare, Mail, X, Calendar, ChevronDown, FileText } from "lucide-react";

export default function CommentsList() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  
  // Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal/Dialog State
  const [viewComment, setViewComment] = useState(null); 
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 🚀 NOTIFICATION STATE
  const [hasNewItems, setHasNewItems] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  // 🚀 PERFORMANCE FIX: Proper Debounced API Fetching
  useEffect(() => {
    let isMounted = true;

    const fetchComments = async () => {
      if (comments.length === 0 || search) setLoading(true); 
      try {
        const { data } = await getAdminComments({ 
          page, 
          pageSize, 
          search, 
          is_approved: statusFilter
        });
        if (isMounted) {
          const items = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
          
          setComments(items);
          setCount(data?.count || items.length);
          setHasNewItems(false); 
        }
      } catch (err) { 
        if (isMounted) console.error(err); 
      } finally { 
        if (isMounted) setLoading(false); 
      }
    };

    const timer = setTimeout(() => { 
      fetchComments(); 
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, refreshTrigger]); 

  // 🚀 THE SILENT POLLER
  useEffect(() => {
    if (page !== 1 || search) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await getAdminComments({ 
          page: 1, 
          pageSize: 1, 
          is_approved: statusFilter 
        });
        
        const latestServerItem = data.results[0];
        const latestLocalItem = comments[0];

        if (latestServerItem && latestLocalItem && latestServerItem.id !== latestLocalItem.id) {
          setHasNewItems(true);
        }
      } catch (err) { 
        // Fail silently
      }
    }, 30000); 

    return () => clearInterval(interval);
  }, [comments, page, search, statusFilter]);

  // Handle Badge Click
  const handleRefreshClick = () => {
    setHasNewItems(false);
    setRefreshTrigger(prev => prev + 1); 
  };

  // Handle Approve/Unapprove
  const handleToggleStatus = async (cmt) => {
    setActionLoading(true);
    try {
      const newStatus = !cmt.is_approved;
      
      // Our API requires different endpoints/payloads for these actions
      if (newStatus) {
        await approveAdminComment(cmt.id);
      } else {
        await updateAdminComment(cmt.id, { is_approved: false });
      }
      
      // Optimistically update the UI to feel instant
      setComments(prev => prev.map(item => item.id === cmt.id ? { ...item, is_approved: newStatus } : item));
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
      await deleteAdminComment(deleteId);
      setComments(prev => prev.filter(cmt => cmt.id !== deleteId));
      setDeleteId(null);
      setCount(prev => Math.max(prev - 1, 0)); 
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <Helmet><title>Post Comments | JK Admin</title></Helmet>

      <NewDataBadge 
        show={hasNewItems} 
        onClick={handleRefreshClick} 
        label="New comments available" 
      />
      
      <div className="mb-6 sm:mb-8 border-b border-gray-100 pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Post Comments</h1>
        <p className="text-gray-500 text-sm mt-1">Moderate user discussions and interactions on your published articles.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        
        {/* TOOLBAR */}
        <TableToolbar 
          search={search} 
          setSearch={(val) => { setSearch(val); setPage(1); }} 
        >
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
             <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
           </div>
        </TableToolbar>

        {/* DATA TABLE */}
        <div className="overflow-x-auto w-full mt-4">
          <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
            <thead>
              <tr className="border-y border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4 w-1/4">Article</th>
                <th className="px-6 py-4 w-1/3">Comment</th>
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
              ) : comments.length > 0 ? (
                comments.map((cmt) => (
                  <tr key={cmt.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-gray-900">{cmt.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{cmt.author_email || "Anonymous"}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                        <FileText size={12} />
                        <span className="line-clamp-1 max-w-[150px]">{cmt.post_title}</span>
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 align-top cursor-pointer" 
                      onClick={() => setViewComment(cmt)}
                    >
                      <p className="text-gray-700 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                        "{cmt.content}"
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top text-center">
                      <div className="mt-0.5">
                        <StatusBadge value={cmt.is_approved ? "APPROVED" : "PENDING"} type="pill" />
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex justify-end gap-1 mt-0.5">
                        <button 
                          onClick={() => handleToggleStatus(cmt)} 
                          disabled={actionLoading}
                          title={cmt.is_approved ? "Unapprove Comment" : "Approve Comment"}
                          className={`p-2 rounded-lg transition-colors ${cmt.is_approved ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'} disabled:opacity-50`}
                        >
                          {cmt.is_approved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button 
                          onClick={() => setDeleteId(cmt.id)} 
                          disabled={actionLoading}
                          title="Delete Comment"
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
                      title="No comments found" 
                      description={search || statusFilter ? "Try clearing your filters or adjusting your search term." : "No one has commented on any articles yet."}
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

      {/* COMMENT DETAILS MODAL */}
      {viewComment && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="font-serif text-lg font-bold text-gray-900">Comment Details</h3>
              <button onClick={() => setViewComment(null)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm shrink-0">
                  {viewComment.name.charAt(0).toUpperCase()}
                </div>
                <div>
                   <h4 className="font-bold text-gray-900 text-lg leading-tight">{viewComment.name}</h4>
                   <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                     <Mail size={12} /> {viewComment.author_email || "No email provided"}
                   </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">Posted On Article:</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-500 shrink-0" />
                  <span className="truncate">{viewComment.post_title}</span>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-end pb-3 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5"><Calendar size={12} /> {new Date(viewComment.created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-gray-700 text-sm leading-relaxed italic relative shadow-inner">
                    <span className="absolute top-2 left-2 text-gray-200 text-4xl font-serif">“</span>
                    <p className="relative z-10 px-3 pt-2">{viewComment.content}</p>
                 </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
               <button 
                 onClick={() => setViewComment(null)} 
                 className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-xl transition-colors"
               >
                 Close
               </button>
               <button 
                 onClick={() => { handleToggleStatus(viewComment); setViewComment(null); }} 
                 className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95 ${viewComment.is_approved ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
               >
                 {viewComment.is_approved ? "Revoke Approval" : "Approve Comment"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {deleteId && (
        <ConfirmDialog 
          title="Delete Comment?" 
          message="Are you sure you want to permanently delete this comment? This action cannot be undone."
          confirmText="Yes, Delete"
          isLoading={actionLoading}
          onConfirm={handleDelete} 
          onCancel={() => setDeleteId(null)} 
        />
      )}
    </div>
  );
}