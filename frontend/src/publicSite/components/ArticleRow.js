import { Link } from "react-router-dom";
import placeholder from "../../assets/article-placeholder.jpg";
import { FiClock, FiChevronRight, FiUserCheck } from "react-icons/fi";
import { useAuth } from "../../auth/PublicAuthContext";


const ArticleRow = ({ post }) => {
  const { user } = useAuth();

  const imageUrl = post.banner_image
  ? (post.banner_image.startsWith("http") 
      ? post.banner_image 
      : `${process.env.REACT_APP_API_URL.replace('/api', '')}${post.banner_image.startsWith('/') ? '' : '/'}${post.banner_image}`)
  : placeholder;


  const categoryName = post.category 
    ? (typeof post.category === 'object' ? post.category.name : post.category) 
    : "Article";

  const isAuthor = user && (user.name === post.author_name || user.id === post.author);

  return (
    <article className="group flex flex-col md:flex-row gap-6 md:gap-8 py-10 border-b border-gray-100 last:border-0 items-start">
      
      {/* IMAGE CONTAINER */}
      {/* Added 'border border-gray-200' for that slight borderline */}
      <Link 
        to={`/post/${post.slug}`} 
        className="w-full md:w-72 h-56 md:h-48 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 relative transition-all duration-300"
      >
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* CONTENT SIDE */}
      <div className="flex-1 flex flex-col h-full justify-center w-full">
        
        {/* Header Tags */}
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest mb-2">
            <span className="text-indigo-600">{categoryName}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400 flex items-center gap-1">
               <FiClock className="text-indigo-400"/> {post.reading_time || "5 Min"}
            </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors">
          <Link to={`/post/${post.slug}`}>
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-500 text-base leading-relaxed line-clamp-2 mb-4 max-w-2xl">
          {post.meta_description}
        </p>

        {/* Footer Info Row */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-50 md:border-none md:pt-0">
           
           {/* AUTHOR SECTION */}
           <div className="flex items-center gap-2">
             <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">By:</span>
             <span className="text-sm font-bold text-gray-900">
               {post.author_name || "JK Team"}
             </span>
             {isAuthor && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                   <FiUserCheck /> You
                </span>
             )}
           </div>

           {/* PRICE & ACTION */}
           <div className="flex items-center gap-4">
             {post.price ? (
                <span className="text-gray-900 font-bold text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  KES {post.price}
                </span>
             ) : (
                <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                  Free
                </span>
             )}

             <Link
               to={`/post/${post.slug}`}
               className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:gap-2 transition-all"
             >
               Read <FiChevronRight />
             </Link>
           </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleRow;