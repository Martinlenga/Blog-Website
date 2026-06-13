import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/PublicAuthContext";
import { initiatePayment, pollPostUnlock } from "../services/api";
import { FiX, FiSmartphone, FiCheck, FiAlertCircle, FiLoader, FiShield } from "react-icons/fi";

const MpesaModal = ({ post, onClose, onPaid }) => {
  const { jwt } = useAuth();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | pending | success | error
  const [message, setMessage] = useState("");

  const pollingRef = useRef(null);
  const hasCompletedRef = useRef(false);

  const formattedPrice = parseFloat(post.price || 0).toLocaleString();

  // --- LOGIC ---
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
      setMessage("Please enter a valid Safaricom number.");
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handlePay();
  };

  // 🚀 FIX: Allow users to click the dark background to close the modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && status !== "pending") {
      onClose();
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

  // Safaricom Green Hex
  const mpesaGreen = "#00A859";

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 relative border border-white/20">
        
        {/* Header */}
        <div className="bg-gray-50/50 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A859] opacity-40"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00A859]"></span>
            </div>
            <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-widest">Secure Checkout</span>
          </div>
          {status !== "pending" && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors bg-white hover:bg-gray-100 border border-gray-100 p-1.5 rounded-full shadow-sm">
              <FiX size={16} />
            </button>
          )}
        </div>

        <div className="p-8">
          
          {/* Article Info */}
          <div className="text-center mb-8">
            <h3 className="text-gray-900 font-serif text-xl font-bold mb-1 line-clamp-2 leading-snug">{post.title}</h3>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-5">Premium Access</p>
            <div className="inline-flex items-center justify-center bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100/50 shadow-inner">
               <span className="text-[#00A859] font-extrabold text-3xl tracking-tight font-serif">KES {formattedPrice}</span>
            </div>
          </div>

          {/* ==========================================
              STATE: IDLE / ERROR (Input Mode)
             ========================================== */}
          {(status === "idle" || status === "error") && (
            <div className="animate-in fade-in duration-500">
              
              {status === "error" && (
                 <div className="mb-5 bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in shake">
                   <FiAlertCircle className="text-xl shrink-0" />
                   {message}
                 </div>
              )}

              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  M-Pesa Number
                </label>
                
                <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden focus-within:border-[#00A859] focus-within:ring-4 focus-within:ring-[#00A859]/10 transition-all group shadow-sm bg-white">
                  <div className="bg-gray-50 px-4 py-3.5 border-r border-gray-100 text-gray-500 font-bold flex items-center gap-2 transition-colors">
                    <FiSmartphone size={18} className={phone.length > 8 ? "text-[#00A859]" : ""} /> 
                    <span className="text-sm">+254</span>
                  </div>
                  
                  <input 
                    type="tel" 
                    placeholder="7XX or 1XX..."
                    className="w-full px-4 py-3.5 outline-none text-gray-900 font-bold tracking-widest placeholder-gray-300 text-lg bg-transparent"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>
              </div>

              <button 
                onClick={handlePay}
                className="w-full py-4 bg-[#00A859] hover:bg-[#00904C] text-white font-extrabold rounded-xl shadow-lg shadow-[#00A859]/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-[#00A859]/30"
              >
                Pay Now
              </button>
            </div>
          )}

          {/* ==========================================
              STATE: PENDING (Waiting Mode)
             ========================================== */}
          {status === "pending" && (
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 mb-6 relative flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#00A859] rounded-full border-t-transparent animate-spin"></div>
                <FiSmartphone size={28} className="text-[#00A859] animate-pulse" />
              </div>
              <h4 className="text-gray-900 font-bold text-lg mb-2">Awaiting PIN</h4>
              <p className="text-gray-500 text-center text-sm font-medium leading-relaxed px-4">
                {message}
              </p>
            </div>
          )}

          {/* ==========================================
              STATE: SUCCESS (Unlocked Mode)
             ========================================== */}
          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 text-[#00A859] rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-green-50/50">
                <FiCheck size={40} />
              </div>
              <h4 className="text-gray-900 font-bold text-lg mb-2">Payment Successful</h4>
              <p className="text-gray-500 text-center text-sm font-medium">
                {message}
              </p>
            </div>
          )}

          {/* Cancel Button (Hidden during success) */}
          {status !== "success" && (
            <div className="mt-4 text-center">
              <button 
                onClick={onClose}
                disabled={status === "pending"}
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors py-2 px-4 rounded-lg ${status === "pending" ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                Cancel Transaction
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50/80 py-3.5 text-center border-t border-gray-100">
           <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest flex justify-center items-center gap-1.5">
             <FiShield size={12} className="text-gray-300" />
             Secured by Daraja
           </p>
        </div>

      </div>
    </div>
  );
};

export default MpesaModal;