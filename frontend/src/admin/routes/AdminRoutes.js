import { Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "../context/AdminContext";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layout/AdminLayout";

// Auth
import AdminLogin from "../../auth/AdminLogin";

// Pages (We will build these next, ensure placeholders exist)
import Overview from "../pages/Dashboard/Overview";
import AllPosts from "../pages/Posts/AllPosts";
import PostAccess from "../pages/Posts/PostAccess";
import Transactions from "../pages/Payments/Transactions";
import FinancialTrends from "../pages/Payments/FinancialTrends";
import Reviews from "../pages/Feedback/Reviews";
import FeedbackAnalytics from "../pages/Feedback/Analytics";
import AuditLogs from "../pages/System/AuditLogs";
import Profile from "../pages/MyAccount/Profile";
import ChangePassword from "../pages/MyAccount/ChangePassword";

export default function AdminRoutes() {
  return (
    <AdminProvider> {/* Context is active for all Admin paths */}
      <Routes>
        
        {/* Public Admin Route (Login) */}
        <Route path="login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route index element={<Navigate to="dashboard/overview" replace />} />
            
            {/* Dashboard */}
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

            {/* Account */}
            <Route path="my-account/profile" element={<Profile />} />
            <Route path="my-account/change-password" element={<ChangePassword />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="login" replace />} />

      </Routes>
    </AdminProvider>
  );
}