import { useEffect, useState } from "react";
import { getPosts } from "../services/api";
import PostCard from "../components/PostCard";

const Blog = () => {
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    getPosts().then(data => {
      const combined = data.featured ? [data.featured, ...data.posts] : data.posts;
      setAllPosts(combined);
    });
  }, []);

  if (!allPosts || allPosts.length === 0) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>No articles available.</p>;
  }

  return (
    <div className="container">
      <h1 className="page-title">My Articles</h1>
      {allPosts.map(post => (
        <PostCard key={post.id || Math.random()} post={post} isFeatured={post.featured} />
      ))}
    </div>
  );
};

export default Blog;
