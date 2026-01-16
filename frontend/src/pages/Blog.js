import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { getPosts } from "../services/api";
import { Helmet } from "react-helmet";

const Blog = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getPosts();
        const combined = data.featured ? [data.featured, ...data.posts] : data.posts;
        setAllPosts(combined);
      } catch (err) {
        setError(err.message || "Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="container blog-page">
      <Helmet>
        <title>Blog | My Blog</title>
        <meta name="description" content="Explore our articles and stories. Unlock premium content per article." />
        <meta name="keywords" content="blog, articles, stories, premium content, Kenyan blog" />
        <meta property="og:title" content="Explore Our Articles | My Blog" />
        <meta property="og:description" content="Unlock premium articles and stories on creativity, life, and growth." />
        <meta property="og:type" content="website" />
      </Helmet>

      <h1 className="page-title">Articles</h1>

      {loading && <p style={{ textAlign: "center", marginTop: 50 }}>Loading articles…</p>}
      {error && <p style={{ color: "red", textAlign: "center", marginTop: 50 }}>{error}</p>}
      {!loading && !error && allPosts.length === 0 && (
        <p style={{ textAlign: "center", marginTop: 50 }}>No articles available.</p>
      )}

      {!loading && !error && allPosts.length > 0 && (
        <div className="posts-grid">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} isFeatured={post.featured} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;
