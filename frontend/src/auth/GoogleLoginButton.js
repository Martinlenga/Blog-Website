import { useEffect, useCallback } from "react";
import { googleLogin } from "../publicSite/services/api";
import { useAuth } from "./PublicAuthContext";

const GoogleLoginButton = () => {
  const { login } = useAuth();

  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) return;

      try {
        const res = await googleLogin(response.credential);

        if (res.access && res.user) {
          // ✅ Update auth context immediately
          login(res.access, {
            id: res.user.id,
            email: res.user.email,
            name: res.user.name,
          }, res.refresh);
        } else {
          console.error("Unexpected server response:", res);
          alert("Login failed: Invalid server response");
        }
      } catch (err) {
        console.error("Google login error:", err);
        alert("Google login failed. Check console for details.");
      }
    },
    [login]
  );

  useEffect(() => {
    if (document.getElementById("google-signin-script")) return;

    if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      console.error("Missing REACT_APP_GOOGLE_CLIENT_ID environment variable");
      return;
    }

    const script = document.createElement("script");
    script.id = "google-signin-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.google?.accounts?.id) {
        console.error("Google Sign-In SDK failed to load");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          width: 280,
          text: "signin_with",
        }
      );
    };

    return () => document.body.removeChild(script);
  }, [handleCredentialResponse]);

  return <div id="google-signin-button" />;
};

export default GoogleLoginButton;
