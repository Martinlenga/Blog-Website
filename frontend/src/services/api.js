const API_BASE = "http://127.0.0.1:8000/api";

/* ---------------- helpers ---------------- */
const buildHeaders = (phone = null, extra = {}) => {
  const headers = { "Content-Type": "application/json", ...extra };
  if (phone) headers["X-USER-PHONE"] = phone;
  return headers;
};

const handleResponse = async (res) => {
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new Error(data?.error || data?.message || "Request failed");
  return data;
};

const fetchWithTimeout = async (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Request timed out. Please try again.");
    else throw new Error("Cannot reach backend. Is it running?");
  } finally {
    clearTimeout(id);
  }
};

/* ---------------- Fetch all posts ---------------- */
export const getPosts = async () => {
  const res = await fetchWithTimeout(`${API_BASE}/posts/`);
  return handleResponse(res);
};

/* ---------------- Fetch single post ---------------- */
export const getPostBySlug = async (slug, phone = null) => {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/posts/${slug}/`, { headers: buildHeaders(phone) });
    return handleResponse(res);
  } catch (err) {
    throw new Error(err.message || "Failed to fetch post");
  }
};

/* ---------------- Initiate payment ---------------- */
export const initiatePayment = async (slug, phone) => {
  if (!phone) throw new Error("Phone number is required");

  const res = await fetchWithTimeout(`${API_BASE}/posts/${slug}/pay/`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ phone }),
  });

  const data = await handleResponse(res);

  if (data?.paid === true) return { alreadyPaid: true, message: data.message || "Already unlocked" };

  return {
    alreadyPaid: false,
    checkoutRequestId: data.checkout_request_id,
    amount: data.amount,
    message: data.message,
  };
};
