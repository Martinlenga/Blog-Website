import axios from "axios";

/* =========================
   AXIOS INSTANCE
========================= */
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/admin/",
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const refreshToken = localStorage.getItem("admin_refresh");
      if (refreshToken) {
        try {
          const { data } = await API.post("token/refresh/", { refresh: refreshToken });
          localStorage.setItem("admin_access", data.access);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return API(error.config);
        } catch {
          // Refresh failed → logout
          localStorage.removeItem("admin_access");
          localStorage.removeItem("admin_refresh");
          window.location.href = "/admin/login";
        }
      } else {
        localStorage.removeItem("admin_access");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

/* =========================
   AUTH
========================= */
export const adminLogin = (credentials) => API.post("login/", credentials);
export const adminLogout = (refreshToken) => API.post("logout/", { refresh: refreshToken });

/* =========================
   DASHBOARD
========================= */
export const getDashboardStats = () => API.get("dashboard/");

/* =========================
   POSTS (CRUD)
========================= */
export const getAdminPosts = ({
  page = 1,
  pageSize = 10,
  search = "",
  category = "",
  minPrice = "",
  maxPrice = "",
  dateRange = "",
  ordering = "-created_at",
} = {}) =>
  API.get("posts/", {
    params: { page, page_size: pageSize, search, ordering, category, min_price: minPrice, max_price: maxPrice, date_range: dateRange },
  });


export const getAdminPostBySlug = (slug) => API.get(`posts/${slug}/`);
export const createAdminPost = (data) =>
  API.post("posts/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAdminPost = (slug, data) =>
  API.put(`posts/${slug}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteAdminPost = (slug) => API.delete(`posts/${slug}/`);
export const bulkFeaturePosts = (slugs) => API.post("posts/bulk_feature/", { slugs });
export const bulkDeletePosts = async (slugs = []) => {
  try {
    const res = await Promise.all(
      slugs.map((slug) => axios.delete(`/api/admin/posts/${slug}/`))
    );
    return res;
  } catch (err) {
    console.error("Bulk delete error:", err);
    throw err;
  }
};
export const getCategories = () => API.get("posts/categories/");

/* =========================
   PAYMENTS
========================= */
export const getAdminPayments = ({
  page = 1,
  pageSize = 10,
  search = "",
  ordering = "-created_at",
  status = "", // pass filter here
} = {}) =>
  API.get("payments/", {
    params: { page, page_size: pageSize, search, ordering, status },
  });

export const getPaymentsAnalytics = () => API.get("payments/analytics/");

/* =========================
   FEEDBACK
========================= */
export const getAdminFeedback = ({
  page = 1,
  pageSize = 10,
  search = "",
  ordering = "-created_at",
  rating = "",
  isApproved = "",
} = {}) =>
  API.get("feedbacks/", {
    params: { page, page_size: pageSize, search, ordering, rating, is_approved: isApproved },
  });

export const approveFeedback = (id) =>
  API.post(`feedbacks/${id}/approve/`);

export const updateFeedbackStatus = (id, isApproved) =>
  API.patch(`feedbacks/${id}/`, { is_approved: isApproved });

export const getFeedbackAnalytics = () => API.get("feedbacks/analytics/");

/* =========================
   POST ACCESS
========================= */
export const getAdminPostAccess = ({
  page = 1,
  pageSize = 10,
  search = "",
  category = "",
  date_range = "",
  ordering = "-granted_at",
} = {}) => {
  return API.get("posts/access/", {
    params: { page, page_size: pageSize, search, category, date_range, ordering },
  });
};

/* =========================
   PROFILE
========================= */
export const getAdminProfile = () => API.get("profile/");
export const updateAdminProfile = (data) => API.put("profile/", data);

export const changeAdminPassword = (payload) => {
  return API.post("change-password/", payload);
};


/* =========================
   PASSWORD RESET
========================= */
export const requestAdminPasswordReset = (email) => API.post("password-reset-request/", { email });
export const resetAdminPassword = (data) => API.post("password-reset/", data);

/* =========================
   AUDIT LOGS
========================= */
export const getAdminAuditLogs = ({
  page = 1,
  pageSize = 10,
  ordering = "-timestamp",
  action,
  search,
} = {}) =>
  API.get("audit-logs/", {
    params: {
      page,
      page_size: pageSize,
      ordering,
      action,
      search,
    },
  });

