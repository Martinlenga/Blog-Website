import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";
import { FiClock, FiArrowRight, FiUserCheck } from "react-icons/fi";
import { useAuth } from "../../auth/PublicAuthContext";


const BlogFeaturedRow = ({ post }) => {
  const { user } = useAuth();
  
  if (!post) return null;

  const imageUrl = post.banner_image
  ? (post.banner_image.startsWith("http") 
      ? post.banner_image 
      : `${process.env.REACT_APP_API_URL.replace('/api', '')}${post.banner_image.startsWith('/') ? '' : '/'}${post.banner_image}`)
  : placeholder;

  const categoryName = post.category 
    ? (typeof post.category === 'object' ? post.category.name : post.category) 
    : "Spotlight";

  const isAuthor = user && (user.name === post.author_name || user.id === post.author);

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300">
      
      <div className="flex flex-col md:flex-row items-stretch">
        
        {/* IMAGE (Left, 50% width) */}
        <div className="md:w-1/2 relative overflow-hidden h-[320px] md:h-auto">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
        </div>

        {/* CONTENT (Right, 50% width) */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          
          {/* HEADER: Category & Price Badge */}
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded">
                  {categoryName}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <FiClock className="text-indigo-400" /> {post.reading_time || "5 Min"}
                </span>
             </div>

             {/* PRICE BADGE (Moved here) */}
             {post.price ? (
                <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded border border-gray-700 shadow-sm">
                  KES {post.price}
                </span>
             ) : (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded border border-emerald-200">
                  Free
                </span>
             )}
          </div>

          <h3 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
            {post.title}
          </h3>

          <p className="text-gray-500 text-lg leading-relaxed line-clamp-2 mb-8">
            {post.meta_description}
          </p>

          {/* FOOTER: Author & Button */}
          <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                  Written By
                </span>
                <div className="flex items-center gap-2">
                   <span className="text-sm font-bold text-gray-900">
                     {post.author_name || "JK Team"}
                   </span>
                   {isAuthor && (
                     <span className="text-indigo-600 text-xs" title="You wrote this"><FiUserCheck /></span>
                   )}
                </div>
             </div>

             <Link
              to={`/post/${post.slug}`}
              className="flex items-center gap-2 text-gray-900 font-bold hover:text-indigo-600 transition-colors group/btn"
            >
              Read Now <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogFeaturedRow;