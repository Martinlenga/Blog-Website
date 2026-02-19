import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { getPosts } from "../services/api";

import BlogFeaturedRow from "../components/BlogFeaturedRow";
import ArticleRow from "../components/ArticleRow";
import BlogSearch from "../components/BlogSearch";
import SectionHeader from "../components/SectionHeader";
import BlogSkeleton from "../components/BlogSkeleton";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPosts(); 
        const normalized = [
          ...(data?.featured ? [data.featured] : []),
          ...(Array.isArray(data?.posts) ? data.posts : []),
        ];
        // Remove duplicates just in case
        const unique = normalized.filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);
        setPosts(unique);
      } catch (err) {
        console.error(err);
        setError("Failed to load articles.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const featuredPost = useMemo(() => posts.find((p) => p?.featured), [posts]);

  const filteredPosts = useMemo(() => {
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        !p?.featured &&
        (
          p?.title?.toLowerCase().includes(q) ||
          p?.meta_description?.toLowerCase().includes(q) ||
          (typeof p?.category === 'string' && p.category.toLowerCase().includes(q)) ||
          (typeof p?.category === 'object' && p?.category?.name?.toLowerCase().includes(q))
        )
    );
  }, [posts, query]);

  return (
    <main className="bg-white min-h-screen pt-28 pb-20">
      <Helmet>
        <title>Library | JK Ithaguru</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* HEADER */}
        <header className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-indigo-600 font-bold tracking-widest uppercase text-xs mb-4">
            The Archives
          </p>

          <h1 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Stories & Insights
          </h1>

          <p className="text-xl text-gray-500 leading-relaxed font-light">
            Explore our collection of thoughtful writing, premium insights, and carefully crafted reads.
          </p>
        </header>

        {/* SEARCH */}
        <div className="mb-20">
          <BlogSearch value={query} onChange={setQuery} />
        </div>

        {/* CONTENT */}
        {loading && <BlogSkeleton />}

        {!loading && error && (
          <div className="text-center py-20 bg-red-50 rounded-3xl">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Featured Section */}
            {featuredPost && !query && (
              <section className="mb-24">
                <div className="flex items-center gap-4 mb-8">
                   <h2 className="font-serif text-2xl font-bold text-gray-900">Trending Now</h2>
                   <div className="h-[1px] flex-1 bg-gray-100"></div>
                </div>
                <BlogFeaturedRow post={featuredPost} />
              </section>
            )}

            {/* List Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                 <h2 className="font-serif text-2xl font-bold text-gray-900">
                   {query ? `Search Results for "${query}"` : "Latest Publications"}
                 </h2>
                 <div className="h-[1px] flex-1 bg-gray-100"></div>
              </div>

              <div className="flex flex-col">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl">
                    <p className="text-gray-400 text-lg">No articles found matching your criteria.</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <ArticleRow key={post.id} post={post} />
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default Blog;