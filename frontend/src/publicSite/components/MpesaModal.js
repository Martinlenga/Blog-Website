import { useState, useEffect } from "react";
import { initiatePayment } from "../services/api";
import "./MpesaModal.css";

const MpesaModal = ({ post, jwt, onClose, onPaid }) => {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | pending | success | error
  const [message, setMessage] = useState("");

  const normalizePhone = (input) => {
    if (!input) return null;
    const digits = input.replace(/\D/g, "");
    if ((digits.startsWith("07") && digits.length === 10) || (digits.startsWith("7") && digits.length === 9))
      return "254" + digits.slice(-9);
    if ((digits.startsWith("01") && digits.length === 10) || (digits.startsWith("1") && digits.length === 9))
      return "254" + digits.slice(-9);
    if (digits.startsWith("254") && digits.length === 12) return digits;
    return null;
  };

  const handlePay = async () => {
    const formattedPhone = normalizePhone(phone);
    if (!formattedPhone) {
      setStatus("error");
      setMessage("Enter a valid Kenyan phone number (07X, 7X, 01X, 1X).");
      return;
    }

    try {
      setStatus("pending");
      setMessage("Sending STK push…");

      const res = await initiatePayment(post.slug, formattedPhone, jwt);

      if (res?.paid || res?.alreadyPaid) {
        setStatus("success");
        setMessage("Payment verified! Unlocking…");
        onPaid();
        setTimeout(onClose, 500); // subtle delay for success animation
      } else {
        setStatus("pending");
        setMessage("STK push sent! Complete payment on your phone.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || err.message || "Payment failed. Try again.");
    }
  };

  useEffect(() => {
    if (status === "error") {
      const timer = setTimeout(() => setStatus("idle"), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="mpesa-backdrop">
      <div className={`mpesa-modal ${status}`}>
        <h3 className="modal-title">Pay with MPESA</h3>

        <div className="mpesa-summary">
          <p className="title">{post.title}</p>
          <p className="amount">KES {post.price}</p>
        </div>

        {(status === "idle" || status === "error") && (
          <div className="phone-row">
            <span>+254</span>
            <input
              className={status === "error" ? "error" : ""}
              placeholder="7XXXXXXXX or 1XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        )}

        {status !== "idle" && status !== "error" && (
          <div className={`mpesa-msg ${status}`}>
            {status === "pending" && <span className="spinner"></span>} {message}
          </div>
        )}

        {status === "error" && <div className="mpesa-msg error">{message}</div>}

        <div className="actions-center">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {(status === "idle" || status === "error") && (
            <button className="btn" onClick={handlePay}>
              Pay Now
            </button>
          )}
          {status === "pending" && (
            <button className="btn btn-disabled" disabled>
              Processing…
            </button>
          )}
          {status === "success" && (
            <button className="btn-success" disabled>
              Success!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MpesaModal;
