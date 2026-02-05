import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/PublicAuthContext";
import { initiatePayment, pollPostUnlock } from "../services/api";
import "./MpesaModal.css";

const MpesaModal = ({ post, onClose, onPaid }) => {
  const { jwt } = useAuth();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | pending | success | error
  const [message, setMessage] = useState("");

  const pollingRef = useRef(null);
  const hasCompletedRef = useRef(false); // 🔐 prevents modal flash & re-entry

  const normalizePhone = (input) => {
    if (!input) return null;
    const digits = input.replace(/\D/g, "");

    if ((digits.startsWith("7") && digits.length === 9) ||
        (digits.startsWith("07") && digits.length === 10))
      return "254" + digits.slice(-9);

    if ((digits.startsWith("1") && digits.length === 9) ||
        (digits.startsWith("01") && digits.length === 10))
      return "254" + digits.slice(-9);

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
      setMessage("Enter a valid Kenyan phone number (7XXXXXXXX or 1XXXXXXXX).");
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
      setMessage("Sending STK push…");

      const res = await initiatePayment(post.slug, formattedPhone);

      // 🔥 Instant success (rare but supported)
      if (res?.paid) {
        hasCompletedRef.current = true;
        stopPolling();
        setStatus("success");
        setMessage("Payment confirmed!");
        onPaid();
        setTimeout(onClose, 1200);
        return;
      }

      if (res?.pending) {
        setMessage("Payment already in progress. Waiting for confirmation…");
      }

      // 🔁 Poll backend until unlock
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
            setMessage("Payment confirmed!");
            onPaid();
            setTimeout(onClose, 1200);
          } else if (attempts >= maxAttempts) {
            stopPolling();
            setStatus("error");
            setMessage("Payment not confirmed yet. Try again.");
          }
        } catch {
          stopPolling();
          setStatus("error");
          setMessage("Payment failed. Try again.");
        }
      }, 3000);

    } catch (err) {
      stopPolling();
      setStatus("error");
      setMessage(err?.message || "Payment failed. Try again.");
    }
  };

  // Auto-reset error state
  useEffect(() => {
    if (status === "error") {
      const timer = setTimeout(() => setStatus("idle"), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Cleanup polling on unmount
  useEffect(() => stopPolling, []);

  return (
    <div className="mpesa-backdrop">
      <div className={`mpesa-modal ${status}`}>
        <h3>Pay with MPESA</h3>

        <div className="mpesa-summary">
          <p>{post.title}</p>
          <p className="amount">KES {post.price}</p>
        </div>

        {(status === "idle" || status === "error") && (
          <div className="phone-row">
            <span>+254</span>
            <input
              placeholder="7XXXXXXXX or 1XXXXXXXX"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
              className={status === "error" ? "error" : ""}
            />
          </div>
        )}

        {(status === "pending" || status === "success" || status === "error") && (
          <div className={`mpesa-msg ${status}`}>
            {status === "pending" && <span className="spinner" />} {message}
          </div>
        )}

        <div className="actions-center">
          <button
            className="btn-secondary"
            disabled={status === "success"}
            onClick={() => {
              if (hasCompletedRef.current) return;
              stopPolling();
              setStatus("idle");
              onClose();
            }}
          >
            Cancel
          </button>

          {(status === "idle" || status === "error") && (
            <button className="btn" onClick={handlePay}>
              Pay Now
            </button>
          )}

          {status === "pending" && (
            <button className="btn-disabled" disabled>
              <span className="spinner-small"></span> Processing…
            </button>
          )}

          {status === "success" && (
            <button className="btn-success" disabled>
              <span className="checkmark">&#10003;</span> Success!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MpesaModal;
