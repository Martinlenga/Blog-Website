import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/PublicAuthContext";
import { initiatePayment } from "../services/api";
import "./MpesaModal.css";

const MpesaModal = ({ post, onClose, onPaid }) => {
  const { jwt } = useAuth();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | pending | success | error
  const [message, setMessage] = useState("");
  const pollingRef = useRef(null); // store polling interval
  const [txId, setTxId] = useState(null); // store transaction ID

  const normalizePhone = (input) => {
    if (!input) return null;
    const digits = input.replace(/\D/g, "");

    if ((digits.startsWith("07") && digits.length === 10) ||
        (digits.startsWith("7") && digits.length === 9)) return "254" + digits.slice(-9);
    if ((digits.startsWith("01") && digits.length === 10) ||
        (digits.startsWith("1") && digits.length === 9)) return "254" + digits.slice(-9);
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

    if (!jwt) {
      setStatus("error");
      setMessage("You must be logged in to make payment.");
      return;
    }

    if (pollingRef.current) return; // prevent multiple payments

    try {
      setStatus("pending");
      setMessage("Sending STK push…");

      const res = await initiatePayment(post.slug, formattedPhone);

      if (res?.paid) {
        setStatus("success");
        setMessage("Payment verified! Unlocking content…");
        onPaid();
        setTimeout(onClose, 1000);
        return;
      }

      if (res?.pending) {
        setTxId(res.tx_id);
        setStatus("pending");
        setMessage("Payment already in progress… please check your phone.");
      }

      // start polling
      let attempts = 0;
      const maxAttempts = 20;
      pollingRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const pollRes = await initiatePayment(post.slug, formattedPhone, post.price); // poll
          if (pollRes?.paid) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setStatus("success");
            setMessage("Payment confirmed! Unlocking content…");
            onPaid();
            setTimeout(onClose, 1000);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setStatus("error");
            setMessage("Payment not confirmed. Try again or check your phone.");
          }
        } catch (err) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatus("error");
          setMessage("Payment failed. Try again.");
        }
      }, 3000);

    } catch (err) {
      console.error("Payment error:", err);
      setStatus("error");
      setMessage(err?.message || "Payment failed. Try again.");
    }
  };

  // Reset error
  useEffect(() => {
    if (status === "error") {
      const timer = setTimeout(() => setStatus("idle"), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Cleanup polling
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

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

        {(status === "pending" || status === "success") && (
          <div className={`mpesa-msg ${status}`}>
            {status === "pending" && <span className="spinner"></span>} {message}
          </div>
        )}

        <div className="actions-center">
          <button className="btn-secondary" onClick={() => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            onClose();
          }}>Cancel</button>

          {(status === "idle" || status === "error") && (
            <button className="btn" onClick={handlePay}>Pay Now</button>
          )}

          {status === "pending" && (
            <button className="btn btn-disabled" disabled>Processing…</button>
          )}

          {status === "success" && (
            <button className="btn-success" disabled>Success!</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MpesaModal;
