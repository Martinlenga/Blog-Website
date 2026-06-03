import React, { Suspense, lazy } from "react";
// 🔹 FIX: Import Outlet
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AdminProvider } from "../context/AdminContext";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layout/AdminLayout";

// Auth
import AdminLogin from "../../auth/AdminLogin";

// Code Splitting / Lazy Loading
const Overview = lazy(() => import("../pages/Dashboard/Overview"));
const AllPosts = lazy(() => import("../pages/Posts/AllPosts"));
const PostAccess = lazy(() => import("../pages/Posts/PostAccess"));
const Transactions = lazy(() => import("../pages/Payments/Transactions"));
const FinancialTrends = lazy(() => import("../pages/Payments/FinancialTrends"));
const Reviews = lazy(() => import("../pages/Feedback/Reviews"));
const FeedbackAnalytics = lazy(() => import("../pages/Feedback/Analytics"));
const AuditLogs = lazy(() => import("../pages/System/AuditLogs"));
const Profile = lazy(() => import("../pages/MyAccount/Profile"));
const ChangePassword = lazy(() => import("../pages/MyAccount/ChangePassword"));

const PageSuspenseFallback = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

export default function AdminRoutes() {
  return (
    <AdminProvider>
      <Routes>
        
        <Route path="login" element={<AdminLogin />} />

        <Route element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
            <Route index element={<Navigate to="dashboard/overview" replace />} />
            
            {/* 🔹 FIX: Added <Outlet /> inside Suspense so child routes can render */}
            <Route element={
              <Suspense fallback={<PageSuspenseFallback />}>
                <Outlet />
              </Suspense>
            }>
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
        </Route>

        <Route path="*" element={<Navigate to="dashboard/overview" replace />} />

      </Routes>
    </AdminProvider>
  );
}