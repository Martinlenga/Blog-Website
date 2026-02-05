import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";

// Dashboard
import Overview from "../pages/Dashboard/Overview";

// Posts
import AllPosts from "../pages/Posts/AllPosts";
import PostAccess from "../pages/Posts/PostAccess";

// Payments
import Transactions from "../pages/Payments/Transactions";
import FinancialTrends from "../pages/Payments/FinancialTrends"; 

// Feedback
import Reviews from "../pages/Feedback/Reviews";
import FeedbackAnalytics from "../pages/Feedback/Analytics"; 

// System
import AuditLogs from "../pages/System/AuditLogs";

// My Account
import Profile from "../pages/MyAccount/Profile";
import ChangePassword from "../pages/MyAccount/ChangePassword";
import ForgotPassword from "../pages/MyAccount/ForgotPassword";
import ResetPassword from "../pages/MyAccount/ResetPassword";

// Route protection
import AdminProtectedRoute from "./AdminProtectedRoute";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Overview />} />
        <Route path="dashboard/overview" element={<Overview />} />

        {/* Posts */}
        <Route path="posts" element={<AllPosts />} />
        <Route path="posts/access" element={<PostAccess />} />

        {/* Payments */}
        <Route path="payments" element={<Transactions />} />
        <Route path="payments/trends" element={<FinancialTrends />} /> 

        {/* Feedback */}
        <Route path="feedback" element={<Reviews />} />
        <Route path="feedback/analytics" element={<FeedbackAnalytics />} />

        {/* System */}
        <Route path="system/audit-logs" element={<AuditLogs />} />

        {/* My Account */}
        <Route path="my-account/profile" element={<Profile />} />
        <Route path="my-account/change-password" element={<ChangePassword />} />

        {/* Forgot / Reset Password */}
        <Route path="my-account/forgot-password" element={<ForgotPassword />} />
        <Route path="my-account/reset-password" element={<ResetPassword />} />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
