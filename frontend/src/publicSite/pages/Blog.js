import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { getPosts } from "../services/api";
import { useAuth } from "../../auth/PublicAuthContext";

import BlogFeaturedRow from "../components/BlogFeaturedRow";
import ArticleRow from "../components/ArticleRow";
import BlogSearch from "../components/BlogSearch";
import SectionHeader from "../components/SectionHeader";
import BlogSkeleton from "../components/BlogSkeleton";

const Blog = () => {
  const { jwt } = useAuth();
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPosts(jwt);
        const normalized = [
          ...(data?.featured ? [data.featured] : []),
          ...(Array.isArray(data?.posts) ? data.posts : []),
        ];
        setPosts(normalized);
      } catch {
        setError("Failed to load articles.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [jwt]);

  const featuredPost = useMemo(
    () => posts.find((p) => p?.featured),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        !p?.featured &&
        (
          p?.title?.toLowerCase().includes(q) ||
          p?.excerpt?.toLowerCase().includes(q) ||
          p?.category?.toLowerCase().includes(q)
        )
    );
  }, [posts, query]);

  return (
    <main className="bg-white min-h-screen pt-24 pb-16"> 
      <Helmet>
        <title>Blog | My Blog</title>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Articles & Stories
          </h1>
          <p className="mt-2 text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Thoughtful stories, premium insights, and carefully crafted reads.
          </p>
        </header>

        <div className="mt-2 mb-6 max-w-xl mx-auto">
          <BlogSearch value={query} onChange={setQuery} />
        </div>

        {loading && <BlogSkeleton />}

        {!loading && error && (
          <p className="text-center text-red-500 mt-6">{error}</p>
        )}

        {!loading && !error && (
          <>
            {featuredPost && (
              <section className="mb-6">
                <SectionHeader
                  title="Trending"
                  subtitle="What readers are engaging with right now"
                  className="mb-2"
                />
                <BlogFeaturedRow post={featuredPost} />
                <div className="border-t border-gray-200 mt-4 mb-6" />
              </section>
            )}

            <section>
              <SectionHeader
                title="Latest Articles"
                subtitle="Freshly published stories and insights"
                className="mb-2"
              />

              <div className="divide-y divide-gray-200">
                {filteredPosts.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">
                    No articles match your search.
                  </p>
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
