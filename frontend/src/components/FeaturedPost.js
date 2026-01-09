import { useEffect, useState } from "react";
import { getPosts } from "../services/api";
import PostCard from "./PostCard";

const FeaturedPost = () => {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    getPosts().then(data => setFeatured(data.featured || null));
  }, []);

  if (!featured) return null;

  return (
    <section className="featured-section">
        <h2 className="section-title">Featured Article</h2>
        <PostCard post={featured} isFeatured />
    </section>
  );
};

export default FeaturedPost;
