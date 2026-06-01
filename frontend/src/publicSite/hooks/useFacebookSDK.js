import { useEffect, useState } from "react";

const useFacebookSDK = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 1. Facebook requires <div id="fb-root"></div> in the body
    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.prepend(fbRoot);
    }

    // 2. If SDK is already loaded, just parse
    if (window.FB) {
      setLoaded(true);
      window.FB.XFBML.parse();
      return;
    }

    // 3. Prevent duplicate script
    if (document.getElementById("facebook-jssdk")) return;

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    
    script.onload = () => {
      window.FB.init({
        // Ensure REACT_APP_FACEBOOK_APP_ID is in your production environment
        appId: process.env.REACT_APP_FACEBOOK_APP_ID, 
        xfbml: true,
        version: 'v18.0'
      });
      setLoaded(true);
      window.FB.XFBML.parse();
    };

    document.body.appendChild(script);
  }, []);

  return loaded;
};

export default useFacebookSDK;