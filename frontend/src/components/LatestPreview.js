import PostCard from "./PostCard";

const LatestPreview = ({ posts = [] }) => {
  if (!posts || posts.length === 0) return <p>No articles available.</p>;

  return (
    <section className="home-section latest-section">
      <h2 className="section-title">Latest Articles</h2>
      <div className="latest-grid">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default LatestPreview;
