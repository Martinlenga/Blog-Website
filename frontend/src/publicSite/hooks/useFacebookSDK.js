import { useEffect, useState } from "react";

const useFacebookSDK = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 1. If it's already on the window object, we're good.
    if (window.FB) {
      setLoaded(true);
      try {
        window.FB.XFBML.parse(); // Force re-parse for dynamic route switches
      } catch (e) {
        console.warn("FB parse error:", e);
      }
      return;
    }

    // 2. Prevent duplicate script injections if React re-renders quickly
    const existingScript = document.getElementById("facebook-jssdk");
    if (existingScript) {
      // Script tag exists, wait for it to load completely if window.FB isn't ready
      const handleScriptLoad = () => {
        setLoaded(true);
        if (window.FB) window.FB.XFBML.parse();
      };
      existingScript.addEventListener("load", handleScriptLoad);
      return () => existingScript.removeEventListener("load", handleScriptLoad);
    }

    // 3. Create the required fb-root element if missing
    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.prepend(fbRoot);
    }

    // 4. Inject the script safely with standard App configurations
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    
    // Included standard SDK configuration injection format
    script.src = "https://connect.facebook.net/en_US/sdk.js";

    script.onload = () => {
      if (window.FB) {
        window.FB.init({
          appId: process.env.REACT_APP_FACEBOOK_APP_ID || "", // Optional: Your Meta App ID links comments to your profile dashboard
          xfbml: true,
          version: 'v18.0'
        });
        setLoaded(true);
        window.FB.XFBML.parse();
      }
    };

    document.body.appendChild(script);
  }, []);

  return loaded;
};

export default useFacebookSDK;