import PostCard from "./PostCard";

const CategoryRow = ({ title, posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="mb-16 container mx-auto px-4 md:px-8">
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center border-b-2 border-indigo-600 pb-2">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

    </div>
  );
};

export default CategoryRow;
