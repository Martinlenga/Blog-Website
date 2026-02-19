import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/PublicAuthContext";
import { initiatePayment, pollPostUnlock } from "../services/api";
import { FiX, FiSmartphone, FiCheck, FiAlertCircle, FiLoader } from "react-icons/fi";

const MpesaModal = ({ post, onClose, onPaid }) => {
  const { jwt } = useAuth();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | pending | success | error
  const [message, setMessage] = useState("");

  const pollingRef = useRef(null);
  const hasCompletedRef = useRef(false);

  // --- LOGIC (Untouched, works perfectly) ---
  const normalizePhone = (input) => {
    if (!input) return null;
    const digits = input.replace(/\D/g, "");
    if ((digits.startsWith("7") && digits.length === 9) || (digits.startsWith("07") && digits.length === 10)) return "254" + digits.slice(-9);
    if ((digits.startsWith("1") && digits.length === 9) || (digits.startsWith("01") && digits.length === 10)) return "254" + digits.slice(-9);
    if (digits.startsWith("254") && digits.length === 12) return digits;
    return null;
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handlePay = async () => {
    if (hasCompletedRef.current) return;
    const formattedPhone = normalizePhone(phone.trim());

    if (!formattedPhone) {
      setStatus("error");
      setMessage("Enter a valid Safaricom number.");
      return;
    }

    if (!jwt) {
      setStatus("error");
      setMessage("You must be logged in to pay.");
      return;
    }

    if (status === "pending") return;

    try {
      setStatus("pending");
      setMessage("Check your phone for the STK Push...");

      const res = await initiatePayment(post.slug, formattedPhone);

      if (res?.paid) {
        hasCompletedRef.current = true;
        stopPolling();
        setStatus("success");
        setMessage("Payment confirmed!");
        onPaid();
        setTimeout(onClose, 2000);
        return;
      }

      if (res?.pending) {
        setMessage("Request sent! Enter your M-Pesa PIN.");
      }

      let attempts = 0;
      const maxAttempts = 20;

      pollingRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const unlockedPost = await pollPostUnlock(post.slug);
          if (unlockedPost?.locked === false) {
            hasCompletedRef.current = true;
            stopPolling();
            setStatus("success");
            setMessage("Payment received! Unlocking...");
            onPaid();
            setTimeout(onClose, 2000);
          } else if (attempts >= maxAttempts) {
            stopPolling();
            setStatus("error");
            setMessage("Time out. We didn't receive payment.");
          }
        } catch {
          stopPolling();
          setStatus("error");
          setMessage("Connection error. Try again.");
        }
      }, 3000);

    } catch (err) {
      stopPolling();
      setStatus("error");
      setMessage(err?.message || "Payment initiation failed.");
    }
  };

  useEffect(() => {
    if (status === "error") {
      const timer = setTimeout(() => setStatus("idle"), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    return () => stopPolling();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 relative">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Secure Payment</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-8">
          
          <div className="text-center mb-8">
            <h3 className="text-gray-900 font-serif text-xl font-bold mb-1 line-clamp-1">{post.title}</h3>
            <p className="text-gray-500 text-sm mb-4">Unlock premium access</p>
            <div className="inline-block bg-indigo-50 px-4 py-2 rounded-xl">
               <span className="text-indigo-700 font-bold text-2xl tracking-tight">KES {post.price}</span>
            </div>
          </div>

          {status === "pending" && (
            <div className="mb-6 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-pulse">
              <FiLoader className="animate-spin text-xl shrink-0" />
              {message}
            </div>
          )}

          {status === "error" && (
             <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold">
               <FiAlertCircle className="text-xl shrink-0" />
               {message}
             </div>
          )}

          {status === "success" && (
             <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold">
               <FiCheck className="text-xl shrink-0" />
               {message}
             </div>
          )}

          {/* Phone Input */}
          {(status === "idle" || status === "error") && (
            <div className="mb-8">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                M-Pesa Number
              </label>
              
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all group">
                <div className="bg-gray-100 px-4 py-3 border-r border-gray-200 text-gray-500 font-bold flex items-center gap-2 group-focus-within:bg-white group-focus-within:text-green-600 transition-colors">
                  <FiSmartphone /> +254
                </div>
                {/* UPDATED PLACEHOLDER */}
                <input 
                  type="tel" 
                  placeholder="7XX... or 1XX..."
                  className="w-full px-4 py-3 outline-none text-gray-900 font-bold tracking-widest placeholder-gray-300"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
              </div>
              
              {/* HELPER TEXT */}
              <p className="text-[10px] text-gray-400 mt-2 ml-1 font-medium">
                Enter number starting with <strong>7</strong> or <strong>1</strong> (e.g., 712... or 110...)
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {(status === "idle" || status === "error") && (
              <button 
                onClick={handlePay}
                className="w-full py-4 bg-[#4CAF50] hover:bg-[#43a047] text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 text-lg"
              >
                Pay KES {post.price}
              </button>
            )}

            {status === "pending" && (
               <button disabled className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                 Waiting for PIN...
               </button>
            )}
            
            <button 
              onClick={onClose}
              className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors py-2"
            >
              Cancel Transaction
            </button>
          </div>

        </div>

        <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secured by M-Pesa</p>
        </div>

      </div>
    </div>
  );
};

export default MpesaModal;