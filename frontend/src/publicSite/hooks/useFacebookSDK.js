import { useEffect, useState } from "react";

const useFacebookSDK = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 1. If it's already on the window object, we're good.
    if (window.FB) {
      setLoaded(true);
      window.FB.XFBML.parse(); // Force a re-parse for dynamically loaded components
      return;
    }

    // 2. Prevent duplicate script injections if React re-renders quickly
    if (document.getElementById("facebook-jssdk")) {
      return;
    }

    // 3. Create the required fb-root element if missing
    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.prepend(fbRoot);
    }

    // 4. Inject the script safely
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";

    script.onload = () => {
      setLoaded(true);
      if (window.FB) {
        window.FB.init({
          xfbml: true,
          version: 'v18.0'
        });
        window.FB.XFBML.parse();
      }
    };

    document.body.appendChild(script);
  }, []);

  return loaded;
};

export default useFacebookSDK;