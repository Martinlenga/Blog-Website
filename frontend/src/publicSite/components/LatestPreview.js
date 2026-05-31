import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";
import { FiClock, FiArrowRight, FiUser } from "react-icons/fi";

const API_BASE = process.env.REACT_APP_API_URL.replace('/api', '');

const LatestPreview = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-16">
      
      {/* HEADER */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-indigo-600 font-bold tracking-widest text-xs uppercase mb-1 block">
            Discover
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
            Latest Articles
          </h2>
        </div>
        <Link 
          to="/" 
          className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
        >
          View Archive <FiArrowRight />
        </Link>
      </div>

      {/* THE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {posts.map((post) => {
          
          const imageUrl = post.banner_image
            ? post.banner_image.startsWith("http")
              ? post.banner_image
              : `${API_BASE}${post.banner_image}`
            : placeholder;

          const categoryName = post.category 
            ? (typeof post.category === 'object' ? post.category.name : post.category) 
            : "Editorial";

          return (
            <Link 
              to={`/post/${post.slug}`} 
              key={post.id} 
              className="group relative block h-[400px] w-full rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
            >
              
              {/* 1. BACKGROUND IMAGE */}
              <div className="absolute inset-0 bg-gray-900">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                />
              </div>

              {/* 2. THE CURTAIN (Dark Gradient) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:via-black/50 transition-all duration-500" />

              {/* 3. TOP TAGS (Category & Price) */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                  {categoryName}
                </span>
                {post.price && (
                  <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
                    KES {post.price}
                  </span>
                )}
              </div>

              {/* 4. CONTENT CONTAINER */}
              {/* FIXED: 'translate-y-[88px]' pushes the description down initially */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-30 transition-transform duration-500 transform translate-y-[88px] group-hover:translate-y-0">
                
                {/* TITLE AREA (Always Visible) */}
                <div className="mb-2">
                   
                   {/* READING TIME - Always starts at the exact same pixel height */}
                   <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2">
                    <FiClock className="text-indigo-400" /> 
                    {post.reading_time || "5 Min"}
                  </div>

                  {/* FIXED HEIGHT TITLE */}
                  {/* h-[3.6rem] forces exactly 2 lines of space. 
                      flex items-start ensures title text starts from TOP of this box.
                      This guarantees the 'Reading Time' badge above sits at the same spot for everyone. */}
                  <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-lg h-[3.6rem] line-clamp-2 flex items-start">
                    {post.title}
                  </h3>
                </div>

                {/* HIDDEN DETAILS (Only visible on hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex flex-col gap-3">
                  
                  {/* Divider Line */}
                  <div className="w-12 h-1 bg-indigo-500 mt-2 mb-2 rounded-full"></div>

                  {/* Fixed Height Description to prevent jumping */}
                  <p className="text-gray-200 text-sm line-clamp-2 leading-relaxed font-medium drop-shadow-sm h-[2.5rem]">
                    {post.meta_description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-gray-300 text-xs font-semibold">
                      <FiUser className="text-indigo-400"/>
                      {post.author_name || "JK Team"}
                    </div>
                    <span className="text-white text-xs font-bold flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors">
                      Read Now <FiArrowRight />
                    </span>
                  </div>
                </div>

              </div>
            </Link>
          );
        })}
      </div>

       {/* Mobile View All */}
       <div className="mt-8 text-center md:hidden">
        <Link to="/blog" className="inline-block border border-gray-300 text-gray-600 px-6 py-2 rounded-full font-bold text-sm">
          View All Articles
        </Link>
      </div>

    </div>
  );
};

export default LatestPreview;