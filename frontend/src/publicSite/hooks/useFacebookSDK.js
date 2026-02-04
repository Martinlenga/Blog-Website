import { useEffect, useState } from "react";

const useFacebookSDK = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.FB) {
      setLoaded(true);
      return;
    }

    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.prepend(fbRoot);
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src =
      "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";

    script.onload = () => {
      setLoaded(true);
      if (window.FB) window.FB.XFBML.parse();
    };

    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, []);

  return loaded; // we return if FB SDK is ready
};

export default useFacebookSDK;
