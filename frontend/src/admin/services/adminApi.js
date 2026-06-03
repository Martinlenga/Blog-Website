import axios from "axios";

// Safely construct the URL for Next.js, ensuring no double-slashes
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000/api";
const API_URL = `${BASE_URL}/admin/`;

const API = axios.create({ baseURL: API_URL });

// Helper function to surgically clear only admin auth state without destroying public user sessions
const clearAdminAuth = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_refresh");
    localStorage.removeItem("admin_user");
  }
};

/* ------------------------------------------------------------------
 * 🛡️ REQUEST INTERCEPTOR: Attach JWT securely
 * ------------------------------------------------------------------ */
API.interceptors.request.use((config) => {
  // Do NOT attach Authorization header for the login endpoint
  if (!config.url.includes("login/")) {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_access") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ------------------------------------------------------------------
 * 🔄 RESPONSE INTERCEPTOR: Handle 401s and Token Refresh
 * ------------------------------------------------------------------ */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. If the request failed on the login endpoint itself, reject IMMEDIATELY.
    if (originalRequest.url.includes("login/")) {
      return Promise.reject(error);
    }

    // 2. Handle token expiration for other authenticated dashboard routes
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("admin_refresh") : null;
      
      if (refreshToken) {
        try {
          // Attempt to fetch a new access token
          const { data } = await axios.post(`${API_URL}token/refresh/`, { refresh: refreshToken });
          
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_access", data.access);
          }
          
          // Update the failed request with the new token and retry
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return API(originalRequest);
          
        } catch (err) {
          // Token refresh failed (refresh token expired/blacklisted)
          clearAdminAuth();
          if (typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
            window.location.href = "/admin/login";
          }
        }
      } else {
        // No refresh token available at all
        clearAdminAuth();
        if (typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

/* ------------------------------------------------------------------
 * 🔌 ENDPOINTS
 * ------------------------------------------------------------------ */

// Auth
export const adminLogin = (creds) => API.post("login/", creds);
export const adminLogout = (refresh) => API.post("logout/", { refresh });

// Dashboard & Posts
export const getDashboardStats = () => API.get("dashboard/");
export const getAdminPosts = (params) => API.get("posts/", { params });
export const getAdminPostBySlug = (slug) => API.get(`posts/${slug}/`);

// Note: When sending FormData (for banner_image), Axios automatically sets the correct multipart headers
export const createAdminPost = (data) => API.post("posts/", data);
export const updateAdminPost = (slug, data) => API.patch(`posts/${slug}/`, data);
export const deleteAdminPost = (slug) => API.delete(`posts/${slug}/`);
export const bulkFeaturePosts = (slugs) => API.post("posts/bulk_feature/", { slugs });
export const getCategories = () => API.get("posts/categories/");
export const getAdminPostAccess = (params) => API.get("posts/access/", { params });

// Payments
export const getAdminPayments = (params) => API.get("payments/", { params });
export const getPaymentsAnalytics = (params) => API.get("payments/analytics/", { params });

export const exportPaymentsCSV = async (params) => {
    const response = await API.get("payments/export_csv/", { params, responseType: 'blob' });
    return response.data;
};

// Feedback
export const getAdminFeedback = (params) => API.get("feedbacks/", { params });
export const approveFeedback = (id) => API.post(`feedbacks/${id}/approve/`);
export const updateFeedbackStatus = (id, isApproved) => API.patch(`feedbacks/${id}/`, { is_approved: isApproved });
export const deleteFeedback = (id) => API.delete(`feedbacks/${id}/`);
export const getFeedbackAnalytics = () => API.get("feedbacks/analytics/");

// System
export const getAdminAuditLogs = (params) => API.get("audit-logs/", { params });

// Profile & Password
export const getAdminProfile = () => API.get("profile/"); 
export const updateAdminProfile = (data) => API.put("profile/", data);
export const changeAdminPassword = (data) => API.post("change-password/", data);
export const requestAdminPasswordReset = (email) => API.post("password-reset-request/", { email });
export const resetAdminPassword = (data) => API.post("password-reset/", data);

export default API;