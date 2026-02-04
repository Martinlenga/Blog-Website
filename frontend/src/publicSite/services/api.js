const API_BASE = "http://127.0.0.1:8000/api";

/* ===================== HELPERS ===================== */
const buildHeaders = (jwt = null, extra = {}) => {
  const headers = { "Content-Type": "application/json", ...extra };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
};

const handleResponse = async (res) => {
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.detail || data?.error || data?.message || "Request failed");
  return data;
};

const fetchWithTimeout = async (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Request timed out");
    throw new Error("Backend unreachable");
  } finally {
    clearTimeout(id);
  }
};

/* ===================== FETCH WITH AUTH + AUTO REFRESH ===================== */
export const fetchWithAuth = async (url, options = {}, retry = true) => {
  const jwt = localStorage.getItem("jwt");
  const refresh = localStorage.getItem("refreshToken");

  const res = await fetchWithTimeout(url, {
    ...options,
    headers: buildHeaders(jwt, options.headers),
  });

  // If access token expired → try refresh ONCE
  if (res.status === 401 && retry && refresh) {
    try {
      const refreshRes = await fetchWithTimeout(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ refresh }),
      });

      const refreshData = await handleResponse(refreshRes);

      localStorage.setItem("jwt", refreshData.access);

      // Retry original request with new token
      return fetchWithAuth(url, options, false);
    } catch (err) {
      // Refresh failed → hard logout
      localStorage.removeItem("jwt");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
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
  const updatedPost = await fetchWithAuth(`${API_BASE}/posts/${slug}/unlock/`, { method: "POST" });
  console.log("🔓 Unlock response:", updatedPost);
  return updatedPost;
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
    return getPostBySlug(slug);
  }

  return res;
};

/* ===================== POLL UNLOCK ===================== */
export const pollPostUnlock = async (slug, timeout = 20000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    await new Promise((r) => setTimeout(r, 2000));
    const post = await getPostBySlug(slug);
    if (post.locked === false) return post;
  }
  throw new Error("Payment not confirmed yet");
};

/* ===================== FEEDBACK ===================== */
export const getFeedbacksByPost = async (postId) =>
  fetchWithAuth(`${API_BASE}/feedbacks/?post=${postId}`);

export const submitFeedback = async (postId, payload) =>
  fetchWithAuth(`${API_BASE}/feedbacks/`, {
    method: "POST",
    body: JSON.stringify({ post: postId, ...payload }),
  });
