import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/admin/` 
  : "http://localhost:8000/api/admin/";

const API = axios.create({ baseURL: API_URL });

/* INTERCEPTORS */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("admin_refresh");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}token/refresh/`, { refresh: refreshToken });
          localStorage.setItem("admin_access", data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return API(originalRequest);
        } catch (err) {
          localStorage.clear();
          window.location.href = "/admin/login";
        }
      } else {
        localStorage.clear();
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

/* ENDPOINTS */
// Auth
export const adminLogin = (creds) => API.post("login/", creds); // Renamed to match
export const adminLogout = (refresh) => API.post("logout/", { refresh }); // Renamed to match

// Dashboard & Posts
export const getDashboardStats = () => API.get("dashboard/");
export const getAdminPosts = (params) => API.get("posts/", { params });
export const getAdminPostBySlug = (slug) => API.get(`posts/${slug}/`);
export const createAdminPost = (data) => API.post("posts/", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateAdminPost = (slug, data) => API.put(`posts/${slug}/`, data, { headers: { "Content-Type": "multipart/form-data" } });
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

// Profile & Password (RENAMED HERE TO FIX YOUR ERROR)
export const getAdminProfile = () => API.get("profile/"); 
export const updateAdminProfile = (data) => API.put("profile/", data, { headers: { "Content-Type": "multipart/form-data" } });
export const changeAdminPassword = (data) => API.post("change-password/", data);
export const requestAdminPasswordReset = (email) => API.post("password-reset-request/", { email });
export const resetAdminPassword = (data) => API.post("password-reset/", data);

export default API;