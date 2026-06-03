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

  // Safely format the price for the UI
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
      const maxAttempts = 20; // 60 seconds total (20 * 3s)

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

  // 🔹 FIX: Allow users to press "Enter" to submit
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handlePay();
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 relative">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse"></div>
            <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-widest">Secure Checkout</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors bg-white hover:bg-gray-100 p-1.5 rounded-full">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-8">
          
          <div className="text-center mb-8">
            <h3 className="text-gray-900 font-serif text-xl font-bold mb-1 line-clamp-1">{post.title}</h3>
            <p className="text-gray-500 text-sm mb-5">Unlock premium access</p>
            <div className="inline-block bg-[#4CAF50]/10 px-5 py-2.5 rounded-xl border border-[#4CAF50]/20">
               <span className="text-[#4CAF50] font-extrabold text-2xl tracking-tight">KES {formattedPrice}</span>
            </div>
          </div>

          {status === "pending" && (
            <div className="mb-6 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold border border-blue-100">
              <FiLoader className="animate-spin text-xl shrink-0" />
              {message}
            </div>
          )}

          {status === "error" && (
             <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in shake">
               <FiAlertCircle className="text-xl shrink-0" />
               {message}
             </div>
          )}

          {status === "success" && (
             <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold border border-green-100">
               <FiCheck className="text-xl shrink-0" />
               {message}
             </div>
          )}

          {/* Phone Input */}
          {(status === "idle" || status === "error") && (
            <div className="mb-8">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                M-Pesa Number
              </label>
              
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#4CAF50] focus-within:ring-4 focus-within:ring-[#4CAF50]/10 transition-all group">
                <div className="bg-gray-50 px-4 py-3.5 border-r border-gray-200 text-gray-500 font-bold flex items-center gap-2 group-focus-within:bg-[#4CAF50]/5 group-focus-within:text-[#4CAF50] group-focus-within:border-[#4CAF50]/20 transition-colors">
                  <FiSmartphone size={18} /> +254
                </div>
                
                <input 
                  type="tel" 
                  placeholder="7XX... or 1XX..."
                  className="w-full px-4 py-3.5 outline-none text-gray-900 font-bold tracking-[0.15em] placeholder-gray-300 text-lg"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={handleKeyDown} // 🔹 FIX: Enter key support
                  autoFocus
                />
              </div>
              
              {/* HELPER TEXT */}
              <p className="text-[10px] text-gray-400 mt-2 ml-1 font-medium">
                Enter number starting with <strong>7</strong> or <strong>1</strong>
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {(status === "idle" || status === "error") && (
              <button 
                onClick={handlePay}
                className="w-full py-4 bg-[#4CAF50] hover:bg-[#43a047] text-white font-extrabold rounded-xl shadow-lg shadow-[#4CAF50]/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-base uppercase tracking-wider"
              >
                Pay KES {formattedPrice}
              </button>
            )}

            {status === "pending" && (
               <button disabled className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed uppercase tracking-wider text-sm">
                 Waiting for PIN...
               </button>
            )}
            
            <button 
              onClick={onClose}
              className="text-gray-400 text-xs font-bold uppercase tracking-wider hover:text-gray-700 transition-colors py-2"
            >
              Cancel Transaction
            </button>
          </div>

        </div>

        <div className="bg-gray-50 py-3 text-center border-t border-gray-100">
           <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest flex justify-center items-center gap-1.5">
             Secured by M-Pesa
           </p>
        </div>

      </div>
    </div>
  );
};

export default MpesaModal;

