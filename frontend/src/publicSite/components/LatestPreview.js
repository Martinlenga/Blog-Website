import CategoryRow from "./CategoryRow";

const LatestPreview = ({ posts }) => {
  if (!posts || posts.length === 0)
    return <p className="text-center text-slate-400 mt-8">No articles available.</p>;

  return <CategoryRow title="Latest Articles" posts={posts} />;
};

export default LatestPreview;
