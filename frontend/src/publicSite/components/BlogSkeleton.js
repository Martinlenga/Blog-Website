import ArticleRowSkeleton from "./ArticleRowSkeleton";

const BlogSkeleton = () => {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <ArticleRowSkeleton key={i} />
      ))}
    </div>
  );
};

export default BlogSkeleton;
