import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { FiSearch, FiLoader } from "react-icons/fi"; 

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
  
  const [isLoading, setIsLoading] = useState(true);
  
  // 🚀 REF for auto-scroll functionality
  const resultsRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setFeatured(data.featured || null);
        setLatest(data.posts || []);
        setFilteredPosts(data.posts || []);
      } catch (err) {
        console.error("Failed to load articles", err);
      } finally {
        setIsLoading(false); 
      }
    };
    fetchPosts();
  }, []);

  // 🚀 SEARCH FILTERING & AUTO-SCROLL
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPosts(latest);
      return;
    }
    
    const allSearchablePosts = featured ? [featured, ...latest] : latest;
    
    const filtered = allSearchablePosts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredPosts(filtered);

    // Auto-scroll to results if searching
    if (resultsRef.current) {
      const yOffset = -80; 
      const element = resultsRef.current;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [searchTerm, latest, featured]);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 overflow-x-hidden">
      <Helmet>
        <title>JK Ithaguru | Premium Reads</title>
      </Helmet>

      {/* HERO SECTION */}
      <section className="relative w-full h-[75vh] md:h-[85vh] rounded-b-[3rem] md:rounded-b-[5rem] overflow-hidden shadow-2xl mb-12">
        <img
          src={HeroImage}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 mt-8 md:mt-12">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            Stories that <br className="md:hidden" /> stay with you.
          </h1>
          <p className="mt-6 text-base md:text-xl font-medium text-white/95 bg-black/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
            Exclusive articles by JK Ithaguru.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="absolute bottom-8 md:bottom-12 left-0 right-0 px-6 flex justify-center z-20">
          <div className="relative w-full max-w-md md:max-w-lg group animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <label htmlFor="article-search" className="sr-only">
              Search articles
            </label>

            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
              <FiSearch size={20} />
            </div>

            <input
              id="article-search"
              name="article-search"
              type="text"
              placeholder="Search for articles today..."
              className="w-full pl-12 pr-5 py-3.5 md:py-4 rounded-full bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-gray-900 text-sm md:text-base font-medium placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* DYNAMIC CONTENT AREA */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <FiLoader className="animate-spin text-4xl text-indigo-600" />
          <p className="text-gray-500 font-medium animate-pulse">Curating articles...</p>
        </div>
      ) : (
        <>
          {/* FEATURED POST */}
          {featured && !searchTerm && (
            <section className="px-4 sm:px-6 md:px-12 mb-10 max-w-7xl mx-auto animate-in fade-in duration-700">
              <FeaturedPost post={featured} />
            </section>
          )}

          {/* LATEST / SEARCH RESULTS */}
          <section ref={resultsRef} className="mb-8 min-h-[400px] pt-4">
            {filteredPosts.length > 0 ? (
              <div className="animate-in fade-in duration-500">
                <LatestPreview posts={filteredPosts} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <FiSearch size={28} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-500 max-w-md">
                  We couldn't find any publications matching "{searchTerm}". Try adjusting your search terms.
                </p>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="mt-6 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {/* REVIEWS */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-24">
        <Reviews jwt={null} />
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
        <FAQ />
      </section>
    </div>
  );
};

export default Home;