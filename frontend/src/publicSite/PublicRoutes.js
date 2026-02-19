import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop"; // Import the helper

// Pages
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import PostDetail from "./pages/PostDetail";
import Contact from "./pages/Contact";
import About from "./pages/About";

const PublicRoutes = () => {
  return (
    <>
      {/* 1. Logic to force scroll to top on route change */}
      <ScrollToTop />

      {/* 2. Navbar sits here (Persistent across all public pages) */}
      <Navbar />

      {/* 3. The Page Content changes here */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>

      {/* 4. Footer sits here (Persistent) */}
      <Footer />
    </>
  );
};

export default PublicRoutes;