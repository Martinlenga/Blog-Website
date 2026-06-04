// Remove trailing slashes safely if they exist in the env variable
const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");
const API_BASE = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

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

/* ------------------------------------------------------------------
 * 🌐 PUBLIC FETCH: For logged-out visitors (Homepage, reading lists)
 * ------------------------------------------------------------------ */
export const fetchPublic = async (url, options = {}) => {
  const jwt = localStorage.getItem("jwt");
  // Still attaches token if it exists, but doesn't freak out if it fails
  const res = await fetchWithTimeout(url, { ...options, headers: buildHeaders(jwt, options.headers) });
  return handleResponse(res);
};

/* ------------------------------------------------------------------
 * 🛡️ AUTH FETCH: For strict user actions (Payments, Unlocks)
 * ------------------------------------------------------------------ */
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
      return fetchWithAuth(url, options, false); 
    } catch {
      // 🚀 THE CRASH FIX: Quietly remove the bad tokens and fetch as a public guest
      localStorage.removeItem("jwt");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      return fetchPublic(url, options); // Fetch without auth so the page doesn't crash!
    }
  }
  return handleResponse(res);
};

/* ===================== AUTHENTICATION ===================== */
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

/* ===================== ARTICLES ===================== */
export const getPosts = async () => fetchPublic(`${API_BASE}/posts/`);

export const getPostBySlug = async (slug) => fetchWithAuth(`${API_BASE}/posts/${slug}/`);

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
// 🚀 ARCHITECTURE FIX: This replaces the dead 'unlockPost' endpoint.
// We just ask Django for the post again. If M-Pesa was successful, 
// Django will automatically return the full content instead of null.
export const pollPostUnlock = async (slug) => {
  const article = await getPostBySlug(slug);
  return article; 
};

/* ===================== FEEDBACK / TESTIMONIALS ===================== */
export const getFeedbacksByPost = async (articleId) =>
  fetchPublic(`${API_BASE}/feedbacks/?post=${articleId}`);

export const submitFeedback = async (articleId, payload) =>
  fetchWithAuth(`${API_BASE}/feedbacks/`, {
    method: "POST",
    body: JSON.stringify({ post: articleId, ...payload }),
  });

 
/* ===================== POST COMMENTS ===================== */  
export const getPostComments = async (slug) => {
  return await fetchPublic(`${API_BASE}/posts/${slug}/comments/`);
};

export const submitPostComment = async (slug, commentData) => {
  return await fetchWithAuth(`${API_BASE}/posts/${slug}/comments/`, {
    method: "POST",
    body: JSON.stringify(commentData)
  });
};