import { useEffect, useCallback, useRef } from "react";
import { googleLogin } from "../publicSite/services/api";
import { useAuth } from "./PublicAuthContext";

const GoogleLoginButton = ({ elementId = "google-signin-button", size = "large" }) => {
  const { login } = useAuth();
  const renderRef = useRef(false);

  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) return;
      try {
        const res = await googleLogin(response.credential);
        if (res.access && res.user) {
          login(res.access, {
            id: res.user.id,
            email: res.user.email,
            name: res.user.name,
          }, res.refresh);
        }
      } catch (err) {
        console.error("Google login error:", err);
      }
    },
    [login]
  );

  const renderGoogleButton = useCallback(() => {
    const buttonDiv = document.getElementById(elementId);
    if (!window.google?.accounts?.id || !buttonDiv) return;

    if (!window.google_initialized) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google_initialized = true;
    }

    // Clear any leftover artifacts inside this container before rendering
    buttonDiv.innerHTML = "";

    window.google.accounts.id.renderButton(buttonDiv, {
      theme: "outline",
      size: size, // Dynamic styling handling ('medium' on header, 'large' on overlay)
      type: "standard",
      shape: "pill",
      width: size === "medium" ? "140" : "240", 
      text: "signin_with",
      logo_alignment: "left"
    });
  }, [elementId, handleCredentialResponse, size]);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      document.body.appendChild(script);
    }
  }, [renderGoogleButton]);

  return <div id={elementId} className="flex justify-center items-center min-h-[40px]" />;
};

export default GoogleLoginButton;