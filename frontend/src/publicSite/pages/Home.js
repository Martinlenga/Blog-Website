import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FiSearch } from "react-icons/fi";
import { getPosts } from "../services/api";

import FeaturedPost from "../components/FeaturedPost";
import LatestPreview from "../components/LatestPreview";
import Reviews from "./Reviews"; 
import FAQ from "./FAQ"; 
import HeroImage from "../../assets/hero1.jpg";

const Home = () => {
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setFeatured(data.featured || null);
        setLatest(data.posts || []);
        setFilteredPosts(data.posts || []);
      } catch (err) {
        console.error("Failed to load posts", err);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPosts(latest);
      return;
    }
    const filtered = latest.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchTerm, latest]);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 overflow-x-hidden">
      <Helmet>
        <title>JK Ithaguru | Premium Reads</title>
      </Helmet>

      {/* --- THE BOLD HERO --- */}
      <section className="relative w-full h-[75vh] md:h-[85vh] rounded-b-[3rem] md:rounded-b-[5rem] overflow-hidden shadow-2xl mb-12">
        <img
          src={HeroImage}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 mt-12">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-lg leading-tight">
            Think <br className="md:hidden"/> Deeper.
          </h1>
          <p className="mt-4 text-lg md:text-xl font-medium text-white/90 bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
            Exclusive articles by JK Ithaguru.
          </p>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute bottom-10 left-0 right-0 px-6 flex justify-center z-20">
          <div className="relative w-full max-w-2xl group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
              <FiSearch size={24} />
            </div>
            <input
              type="text"
              placeholder="Which article do you want to read today?"
              className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all text-gray-900 text-lg font-medium placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* --- FEATURED SECTION --- */}
      {featured && (
        <section className="px-6 md:px-12 mb-20 max-w-7xl mx-auto">
          <FeaturedPost post={featured} />
        </section>
      )}

      {/* --- LATEST PREVIEW --- */}
      <section className="mb-8">
        <LatestPreview posts={filteredPosts} />
      </section>

      {/* --- REVIEWS --- */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-24">
         <Reviews jwt={null} />
      </section>

      {/* --- FAQ SECTION (Added Here) --- */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
         <FAQ />
      </section>

    </div>
  );
};

export default Home;