import { useEffect, useState } from "react";
import { getPosts } from "../services/api";
import PostCard from "./PostCard";

const LatestPreview = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts().then(data => setPosts(data.posts || []));
  }, []);

  if (!posts || posts.length === 0) return null;

  return (
    <section className="home-section latest-section">
      <h2 className="section-title">Latest Articles</h2>
      {posts.map(post => (
        <PostCard key={post.id || Math.random()} post={post} />
      ))}
    </section>
  );
};

export default LatestPreview;
