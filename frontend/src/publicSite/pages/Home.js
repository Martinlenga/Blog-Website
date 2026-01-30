import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { getPosts } from "../services/api";
import { useAuth } from "../../auth/PublicAuthContext";
import { Link } from "react-router-dom";

import FeaturedPost from "../components/FeaturedPost";
import LatestPreview from "../components/LatestPreview";
import Reviews from "./Reviews";
import FAQ from "./FAQ";
import HeroImage from "../../assets/hero1.jpg";

const Home = () => {
  const { jwt } = useAuth();
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getPosts(jwt); // pass JWT here
        setFeatured(data.featured || null);
        setLatest(data.posts || []);
        setFilteredPosts(data.posts || []);
      } catch (err) {
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [jwt]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPosts(latest);
      return;
    }
    const filtered = latest.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchTerm, latest]);

  return (
    <>
      <Helmet>
        <title>Home | YourBlog</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <img
          src={HeroImage}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35"></div>

        <div className="z-10 text-center px-4 md:px-8 text-white pt-28 md:pt-36">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
            Stories That Make You Pause
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md">
            Thoughtful writing on life, creativity, growth, and modern living. Slow down. Read deeply.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/blog"
              className="bg-indigo-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition shadow-lg"
            >
              Read the Blog
            </Link>
            <Link
              to="/contact"
              className="border border-white px-7 py-3 rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition shadow-lg"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="container mx-auto px-4 md:px-8 py-14 flex justify-center">
        <input
          type="text"
          placeholder="Search articles by title..."
          className="
            w-full 
            sm:w-5/6 
            md:w-2/3 
            lg:w-1/2 
            xl:w-[45%]
            px-5 py-4
            rounded-xl
            border border-gray-300
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-indigo-500
            transition
            placeholder-gray-400
            text-gray-800
            font-medium
          "
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Featured Post */}
      {featured && (
        <div className="container mx-auto px-4 md:px-8 mb-14">
          <FeaturedPost post={featured} />
        </div>
      )}

      {/* Latest Articles */}
      <div className="container mx-auto px-4 md:px-8 mb-14">
        <LatestPreview posts={filteredPosts} />
      </div>

      {/* Reviews */}
      <section className="bg-gray-50">
        <Reviews jwt={jwt} />
      </section>

      {/* FAQ Section */}
      <section className="relative bg-orange-50/40 py-14 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative">
          <FAQ />
        </div>
      </section>
    </>
  );
};

export default Home;
