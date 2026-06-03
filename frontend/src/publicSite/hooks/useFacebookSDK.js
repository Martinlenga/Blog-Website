import { useEffect, useState, useRef } from "react";

// 🚀 BULLETPROOF ENV VAR HANDLER
const getFacebookAppId = () => {
  if (typeof process !== "undefined" && process.env?.REACT_APP_FACEBOOK_APP_ID) return process.env.REACT_APP_FACEBOOK_APP_ID;
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FACEBOOK_APP_ID) return process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  try { return import.meta.env.VITE_FACEBOOK_APP_ID; } catch (e) {}
  return ""; 
};

const useFacebookSDK = () => {
  const [loaded, setLoaded] = useState(false);
  const initializing = useRef(false); // 🚀 FIX: Prevents React StrictMode race conditions

  useEffect(() => {
    // SSR Safety Check
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // 1. Facebook requires <div id="fb-root"></div> in the body
    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.prepend(fbRoot);
    }

    // 2. If SDK is already completely loaded, just parse and exit
    if (window.FB) {
      setLoaded(true);
      window.FB.XFBML.parse();
      return;
    }

    // 3. Prevent duplicate script injection if already injecting
    if (document.getElementById("facebook-jssdk") || initializing.current) return;
    initializing.current = true;

    const appId = getFacebookAppId();
    if (!appId) {
      console.warn("JK Ithaguru: Facebook App ID is missing from environment variables. Social plugins may not work.");
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    
    script.onload = () => {
      if (window.FB) {
        window.FB.init({
          appId: appId, 
          autoLogAppEvents: true, // 🚀 Best practice for modern FB SDK
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