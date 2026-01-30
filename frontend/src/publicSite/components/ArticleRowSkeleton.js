const ArticleRowSkeleton = () => {
  return (
    <div className="flex gap-6 py-8 border-b animate-pulse">
      <div className="w-48 h-32 bg-gray-200 rounded-lg" />

      <div className="flex-1 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />

        <div className="flex gap-4">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
};

export default ArticleRowSkeleton;
