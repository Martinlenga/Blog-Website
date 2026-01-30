import { useEffect } from "react";

const useFacebookSDK = () => {
  useEffect(() => {
    // Avoid loading twice
    if (window.FB) {
      window.FB.XFBML.parse();
      return;
    }

    // Add fb-root div if not present
    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }

    // Load SDK script
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src =
      "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";

    script.onload = () => {
      if (window.FB) {
        window.FB.XFBML.parse();
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
};

export default useFacebookSDK;
