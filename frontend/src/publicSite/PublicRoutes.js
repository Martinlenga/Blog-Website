import { Routes, Route } from "react-router-dom";

// Components & Pages
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import PostDetail from "./pages/PostDetail";
import Contact from "./pages/Contact";
import About from "./pages/About";

const PublicRoutes = () => {
  return (
    <Routes>
      {/* Home */}
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Home />
            <Footer />
          </>
        }
      />

      {/* Blog */}
      <Route
        path="/blog"
        element={
          <>
            <Navbar />
            <Blog />
            <Footer />
          </>
        }
      />

      {/* Single Post */}
      <Route
        path="/post/:slug"
        element={
          <>
            <Navbar />
            <PostDetail />
            <Footer />
          </>
        }
      />

      {/* Contact */}
      <Route
        path="/contact"
        element={
          <>
            <Navbar />
            <Contact />
            <Footer />
          </>
        }
      />

      {/* About */}
      <Route
        path="/about"
        element={
          <>
            <Navbar />
            <About />
            <Footer />
          </>
        }
      />
    </Routes>
  );
};

export default PublicRoutes;
