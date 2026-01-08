import { useEffect, useState } from "react";
import { getPosts } from "../services/api";
import PostCard from "../components/PostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts().then(data => setPosts(data)).catch(() => setPosts([]));
  }, []);

  if (!posts.length) return <p>Loading posts...</p>;

  const featured = posts.find(p => p.featured);
  const otherPosts = posts.filter(p => !p.featured);

  return (
    <div className="container">
      {featured && <PostCard post={featured} isFeatured={true} />}
      {otherPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Home;
