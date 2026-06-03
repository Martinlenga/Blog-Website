import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components (Eagerly loaded - needed immediately on every page)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// 🚀 PERFORMANCE FIX: Pages (Lazy loaded - only downloaded when visited)
const Home = lazy(() => import("./pages/Home"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const Contact = lazy(() => import("./pages/Contact"));

// Sleek fallback UI while the requested page chunk downloads
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

const PublicRoutes = () => {
  return (
    // 🔹 FIX: min-h-screen flex column ensures the Footer never floats up on short pages
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <ScrollToTop />
      
      <Navbar />

      {/* Main content area pushes the footer down */}
      <main className="flex-grow flex flex-col relative w-full">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* UX FIX: Catch all bad URLs and safely send users back to the homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default PublicRoutes;