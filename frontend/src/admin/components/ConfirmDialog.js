import React, { useEffect } from "react";
import { AlertTriangle, Info, Loader } from "lucide-react";

export default function ConfirmDialog({ 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true, // Set to false for safe actions like "Publish" or "Approve"
  isLoading = false     // Pass true when your API call is running
}) {

  // 🚀 UX OPTIMIZATION: Allow users to press "Escape" to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, isLoading]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 animate-in fade-in duration-200"
      onClick={() => !isLoading && onCancel()} // Click background to cancel
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent background click from firing when clicking inside the white box
      >
        <div className="flex items-start gap-4 mb-5">
          {/* Dynamic Icon based on action type */}
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {isDestructive ? <AlertTriangle size={20} strokeWidth={2.5} /> : <Info size={20} strokeWidth={2.5} />}
          </div>
          
          <div className="pt-1">
            <h3 id="dialog-title" className="text-lg font-bold text-gray-900 leading-none mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100'
            }`}
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}