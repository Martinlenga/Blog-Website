import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import FeaturedPost from "../components/FeaturedPost";
import LatestPreview from "../components/LatestPreview"; // upgraded Reviews
import { getPosts } from "../services/api";
import { Helmet } from "react-helmet";
import Reviews from "./Reviews";

const Home = () => {
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getPosts();
        setFeatured(data.featured || null);
        setLatest(data.posts || []);
      } catch (err) {
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Home | My Blog</title>
        <meta name="description" content="Thoughtful writing on life, creativity, growth, and modern living." />
        <meta name="keywords" content="blog, stories, creativity, life lessons, reflections" />
        <meta property="og:title" content="Stories That Make You Pause | My Blog" />
        <meta property="og:description" content="Thoughtful writing on life, creativity, growth, and modern living." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Stories That Make You Pause</h1>
          <p className="hero-subtitle">
            Thoughtful writing on life, creativity, growth, and modern living. Slow down. Read deeply.
          </p>
          <div className="hero-actions">
            <Link to="/blog" className="btn">Read the Blog</Link>
            <Link to="/contact" className="btn btn-outline">Get in Touch</Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container home-content">
        {loading && <p style={{ textAlign: "center", marginTop: 50 }}>Loading posts…</p>}
        {error && <p style={{ color: "red", textAlign: "center", marginTop: 50 }}>{error}</p>}

        {!loading && !error && (
          <>
            {featured && <FeaturedPost post={featured} />}
            <LatestPreview posts={latest} />
          </>
        )}
      </div>

      {/* Testimonials / Reviews */}
      <Reviews />
    </>
  );
};

export default Home;
