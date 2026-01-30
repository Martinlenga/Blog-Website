const API_BASE = "http://127.0.0.1:8000/api";

/* ---------------- helpers ---------------- */
const buildHeaders = (jwt = null, extra = {}) => {
  const headers = { "Content-Type": "application/json", ...extra };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
  return headers;
};

const handleResponse = async (res) => {
  let data = null;
  try { data = await res.json(); } catch {}
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

/* ---------------- Google Login ---------------- */
export const googleLogin = async (token) => {
  const res = await fetchWithTimeout(`${API_BASE}/google-login/`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ token }),
  });
  return handleResponse(res); // { jwt, user: {id, name, email} }
};

/* ---------------- Fetch all posts ---------------- */
export const getPosts = async (jwt = null) => {
  const res = await fetchWithTimeout(`${API_BASE}/posts/`, { headers: buildHeaders(jwt) });
  return handleResponse(res);
};

/* ---------------- Fetch single post ---------------- */
export const getPostBySlug = async (slug, jwt = null) => {
  const res = await fetchWithTimeout(`${API_BASE}/posts/${slug}/`, { headers: buildHeaders(jwt) });
  return handleResponse(res);
};

/* ---------------- Initiate payment ---------------- */
export const initiatePayment = async (slug, jwt) => {
  if (!jwt) throw new Error("Login is required");

  const res = await fetchWithTimeout(`${API_BASE}/posts/${slug}/pay/`, {
    method: "POST",
    headers: buildHeaders(jwt),
    body: JSON.stringify({}),
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

/* ---------------- Feedback ---------------- */
export const getFeedbacksByPost = async (postId, jwt = null) => {
  const res = await fetchWithTimeout(`${API_BASE}/feedbacks/?post=${postId}`, { headers: buildHeaders(jwt) });
  return handleResponse(res);
};

export const submitFeedback = async (postId, { name, email, rating, comment, secret_key }, jwt = null) => {
  const res = await fetchWithTimeout(`${API_BASE}/feedbacks/`, {
    method: "POST",
    headers: buildHeaders(jwt),
    body: JSON.stringify({ post: postId, name, email, rating, comment, secret_key }),
  });
  return handleResponse(res);
};
