import { useEffect, useCallback } from "react";
import { googleLogin } from "../publicSite/services/api";
import { useAuth } from "./PublicAuthContext";

// FIX: Added 'elementId' prop to support multiple buttons (mobile + desktop)
const GoogleLoginButton = ({ elementId = "google-signin-button" }) => {
  const { login } = useAuth();

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
        } else {
          console.error("Unexpected server response:", res);
        }
      } catch (err) {
        console.error("Google login error:", err);
        alert("Google login failed. Please try again.");
      }
    },
    [login]
  );

  const renderGoogleButton = useCallback(() => {
    if (!window.google?.accounts?.id) return;

    // Initialize only once if possible, or just re-init safely
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    const buttonDiv = document.getElementById(elementId);
    if (buttonDiv) {
      window.google.accounts.id.renderButton(
        buttonDiv,
        {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          width: "100%", // Responsive width
          text: "signin_with",
          logo_alignment: "left"
        }
      );
    }
  }, [elementId, handleCredentialResponse]);

  useEffect(() => {
    // If script is already loaded, render immediately
    if (window.google?.accounts?.id) {
       renderGoogleButton();
       return;
    }

    // Otherwise, load script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      renderGoogleButton();
    };
  }, [renderGoogleButton]);

  return (
    <div className="w-full flex justify-center">
      {/* Use the dynamic ID here */}
      <div id={elementId} className="w-full" />
    </div>
  );
};

export default GoogleLoginButton;