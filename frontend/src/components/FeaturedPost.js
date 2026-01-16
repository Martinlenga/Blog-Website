import PostCard from "./PostCard";

const FeaturedPost = ({ post }) => {
  if (!post) return null;

  return (
    <section className="featured-section">
      <h2 className="section-title">Featured Article</h2>
      <PostCard post={post} isFeatured />
    </section>
  );
};

export default FeaturedPost;
