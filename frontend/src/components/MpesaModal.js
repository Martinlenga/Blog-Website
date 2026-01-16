import { useState } from "react";
import { initiatePayment } from "../services/api";

const MpesaModal = ({ post, onClose, onPaid }) => {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [message, setMessage] = useState("");

  const normalize = (input) => {
    if (!input) return null;
    const d = input.replace(/\D/g, "");
    if ((d.startsWith("07") && d.length === 10) || (d.startsWith("7") && d.length === 9))
      return "254" + d.slice(d.length - 9);
    if ((d.startsWith("01") && d.length === 10) || (d.startsWith("1") && d.length === 9))
      return "254" + d.slice(d.length - 9);
    if (d.startsWith("254") && d.length === 12) return d;
    return null;
  };

  const pay = async () => {
    const formatted = normalize(phone);
    if (!formatted) {
      setStatus("error");
      setMessage("Enter a valid Kenyan phone number (07X, 7X, 01X, 1X)");
      return;
    }

    try {
      const res = await initiatePayment(post.slug, formatted);
      setStatus("success");
      setMessage(
        res?.paid || res?.alreadyPaid
          ? "Payment verified! Unlocking content…"
          : "STK push sent! Check your phone…"
      );
      onPaid(formatted);
    } catch (e) {
      setStatus("error");
      setMessage(e.message || "Failed to initiate payment. Try again.");
    }
  };

  const getButtonClass = () => {
    if (status === "error") return "btn btn-error";
    if (status === "success") return "btn-success";
    return "btn";
  };

  return (
    <div className="mpesa-backdrop">
      <div className="mpesa-modal">
        <h3>Pay with MPESA</h3>

        <div className="mpesa-summary">
          <p className="title">{post.title}</p>
          <p className="amount">KES {post.price}</p>
        </div>

        {status === "idle" && (
          <div className="phone-row">
            <span>+254</span>
            <input
              placeholder="7XXXXXXXX or 1XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        )}

        {status !== "idle" && (
          <p className={`mpesa-msg ${status}`}>{message}</p>
        )}

        {(status === "idle" || status === "error") && (
          <div className="actions-center">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>

            {status === "idle" ? (
              <button className="btn" onClick={pay}>Pay Now</button>
            ) : (
              <button className="btn btn-error" onClick={() => setStatus("idle")}>
                Retry
              </button>
            )}
          </div>
        )}

        {status === "success" && (
          <div className="actions-center">
            <button className="btn-success" disabled>
              Payment Successful
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MpesaModal;
