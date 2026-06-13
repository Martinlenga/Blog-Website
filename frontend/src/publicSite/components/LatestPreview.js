import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";
import { FiClock, FiUser, FiCalendar } from "react-icons/fi";
import { Layers } from "lucide-react"; 

const getImageUrl = (imagePath) => {
  if (!imagePath) return placeholder;

  const rawApiUrl = process.env.REACT_APP_API_URL || "https://api.ithaguru.co.ke/api";
  const apiBase = rawApiUrl.replace(/\/api\/?$/, "");

  let safePath = String(imagePath);
  if (safePath.includes("localhost:8000")) {
    safePath = safePath.replace("http://localhost:8000", "");
  }

  if (safePath.startsWith("http")) return safePath;

  const cleanPath = safePath.startsWith("/") ? safePath : `/${safePath}`;
  return `${apiBase}${cleanPath}`;
};

const LatestPreview = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      
      <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
              Discover
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-none tracking-tight">
            Latest Articles
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {posts.map((post) => {
          
          const imageUrl = getImageUrl(post.banner_image);
          const categoryName = post.category 
            ? (typeof post.category === 'object' ? post.category.name : post.category) 
            : "Editorial";

          const priceValue = parseFloat(post.price || 0);
          const isFree = isNaN(priceValue) || priceValue <= 0;

          return (
            <Link 
              to={`/post/${post.slug}`} 
              key={post.id} 
              className="group relative block h-[420px] lg:h-[380px] w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              
              <div className="absolute inset-0 bg-gray-900">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 lg:via-gray-900/60 to-transparent opacity-90 lg:opacity-80 lg:group-hover:via-gray-900/90 transition-all duration-500" />

              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                  {categoryName}
                </span>
                
                {!isFree && (
                  <span className="bg-white text-gray-900 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded shadow-lg">
                    KES {priceValue.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 z-30">

                <div className="transform transition-all duration-500 translate-y-0 lg:translate-y-6 lg:group-hover:translate-y-0">

                  <div className="mb-3">
                    
                    {/* 🚀 THE FIX: A sleek, editorial typography overline for the series */}
                    {post.series_name && (
                      <div className="flex items-center gap-1.5 text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-2 drop-shadow-sm">
                        <Layers size={10} />
                        {post.series_name} {post.part_number && `• PT ${post.part_number}`}
                      </div>
                    )}

                    <h3 className="font-serif text-2xl font-bold text-white leading-snug drop-shadow-md">
                      {post.title}
                    </h3>

                    {/* Moved reading time below the title for cleaner flow */}
                    <div className="flex items-center gap-1.5 text-gray-300 text-[10px] font-bold uppercase tracking-widest mt-3">
                      <FiClock className="text-indigo-400" />
                      {post.reading_time || "5 Min Read"}
                    </div>
                  </div>

                  <div
                    className="
                      max-h-[180px] opacity-100 mt-3
                      lg:mt-0 lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-[180px] lg:group-hover:opacity-100
                      overflow-hidden transition-all duration-500 ease-in-out flex flex-col gap-3
                    "
                  >
                    <div className="w-10 h-1 bg-indigo-500 rounded-full hidden lg:block"></div>

                    <p className="text-gray-300 text-sm line-clamp-2">
                      {post.content_preview}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-gray-300 text-[10px] font-bold uppercase">
                          <FiUser className="text-indigo-400" />
                          {post.author_name || "JK Team"}
                        </div>

                        <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                          <FiCalendar />
                          {post.published_at || "Recent"}
                        </div>
                      </div>

                      <span className="text-white text-[10px] font-extrabold uppercase bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-500 transition-colors">
                        Read →
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default LatestPreview;