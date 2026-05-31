// 🔹 FIX: Use the .env variable, fallback to localhost only if missing
const API_BASE = process.env.REACT_APP_API_URL;
if (!API_BASE) {
    console.error("REACT_APP_API_URL is missing! Check your .env file.");
}

/* ===================== HELPERS ===================== */
const buildHeaders = (jwt = null, extra = {}) => {
  const headers = { "Content-Type": "application/json", ...extra };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
};

const handleResponse = async (res) => {
  let data = null;
  try { 
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch { 
    data = {}; 
  }
  
  if (!res.ok) {
    throw new Error(data?.detail || data?.error || data?.message || "Request failed");
  }
  return data;
};

const fetchWithTimeout = async (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { 
      ...options, 
      signal: controller.signal,
      // ⭐ SMART COUNTER FIX: This allows the browser to send/receive the session cookie
      credentials: "include" 
    });
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Request timed out");
    throw new Error("Backend unreachable");
  } finally {
    clearTimeout(id);
  }
};

/* ===================== FETCH WITH AUTH + AUTO REFRESH ===================== */
export const fetchWithAuth = async (url, options = {}, retry = true) => {
  let jwt = localStorage.getItem("jwt");
  const refresh = localStorage.getItem("refreshToken");

  // Initial Request
  let res = await fetchWithTimeout(url, {
    ...options,
    headers: buildHeaders(jwt, options.headers),
  });

  // If access token expired → try refresh ONCE
  if (res.status === 401 && retry && refresh) {
    try {
      const refreshRes = await fetchWithTimeout(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      const refreshData = await handleResponse(refreshRes);

      // Save new token
      localStorage.setItem("jwt", refreshData.access);
      jwt = refreshData.access; // Update local variable

      // Retry original request with new token
      return fetchWithTimeout(url, {
        ...options,
        headers: buildHeaders(refreshData.access, options.headers),
      }).then(handleResponse);
      
    } catch (err) {
      // Refresh failed → hard logout
      localStorage.removeItem("jwt");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      // Optional: window.location.reload() to clear state
      throw new Error("Session expired");
    }
  }

  return handleResponse(res);
};

/* ===================== GOOGLE LOGIN ===================== */
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