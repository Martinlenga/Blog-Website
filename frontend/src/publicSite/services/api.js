// Use the environment variable, fallback to localhost
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const buildHeaders = (jwt = null, extra = {}) => {
  const headers = { 
    "Content-Type": "application/json",
    ...extra 
  };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
};

const handleResponse = async (res) => {
  let data = null;
  try { 
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch { data = {}; }
  
  if (!res.ok) throw new Error(data?.detail || data?.message || "Request failed");
  return data;
};

const fetchWithTimeout = async (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    throw err.name === "AbortError" ? new Error("Request timed out") : new Error("Backend unreachable");
  } finally {
    clearTimeout(id);
  }
};

export const fetchWithAuth = async (url, options = {}, retry = true) => {
  let jwt = localStorage.getItem("jwt");
  const refresh = localStorage.getItem("refreshToken");

  let res = await fetchWithTimeout(url, { ...options, headers: buildHeaders(jwt, options.headers) });

  if (res.status === 401 && retry && refresh) {
    try {
      const refreshRes = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      const refreshData = await handleResponse(refreshRes);
      localStorage.setItem("jwt", refreshData.access);
      return fetchWithAuth(url, options, false); // Retry once
    } catch {
      localStorage.clear();
      throw new Error("Session expired");
    }
  }
  return handleResponse(res);
};

export const googleLogin = async (token) => {
  const res = await fetchWithTimeout(`${API_BASE}/google-login/`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ token }),
  });
  const data = await handleResponse(res);
  localStorage.setItem("jwt", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
};

/* ===================== POSTS ===================== */
export const getPosts = async () => fetchWithAuth(`${API_BASE}/posts/`);
export const getPostBySlug = async (slug) => fetchWithAuth(`${API_BASE}/posts/${slug}/`);

/* ===================== PERSISTENT UNLOCK ===================== */
export const unlockPost = async (slug) => {
  return fetchWithAuth(`${API_BASE}/posts/${slug}/unlock/`, { method: "POST" });
};

/* ===================== PAYMENTS ===================== */
export const initiatePayment = async (slug, phone) => {
  const res = await fetchWithAuth(`${API_BASE}/posts/${slug}/pay/`, {
    method: "POST",
    body: JSON.stringify({ phone }), 
  });

  if (res?.message === "Payment already in progress") {
    return { pending: true, tx_id: res.tx_id };
  }

  if (res?.paid) {
    return { paid: true };
  }

  return res;
};

/* ===================== POLL UNLOCK ===================== */
export const pollPostUnlock = async (slug) => {
  const post = await getPostBySlug(slug);
  return post; 
};

/* ===================== FEEDBACK ===================== */
export const getFeedbacksByPost = async (postId) =>
  fetchWithAuth(`${API_BASE}/feedbacks/?post=${postId}`);

export const submitFeedback = async (postId, payload) =>
  fetchWithAuth(`${API_BASE}/feedbacks/`, {
    method: "POST",
    body: JSON.stringify({ post: postId, ...payload }),
  });