import React, { useEffect, useRef } from "react";

const FacebookComments = ({ url }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.FB && containerRef.current) {
        try {
          // This forces FB to re-scan the container now that we've forced a width
          window.FB.XFBML.parse(containerRef.current);
        } catch (e) {
          console.warn("Facebook error:", e);
        }
      }
    }, 500); // Increased to 500ms to be absolutely safe

    return () => clearTimeout(timer);
  }, [url]);

  return (
    // 🚀 We added 'w-full' and a hardcoded min-width to prevent the '0' issue
    <div 
      ref={containerRef} 
      className="w-full min-w-[300px] min-h-[400px] bg-white rounded-xl overflow-hidden"
    >
      <div 
        className="fb-comments" 
        data-href={url} 
        data-width="100%" 
        data-numposts="5"
        data-lazy="false"
        data-colorscheme="light"
      ></div>
    </div>
  );
};

export default FacebookComments;