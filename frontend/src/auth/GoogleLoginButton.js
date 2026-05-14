import { useEffect, useCallback, useRef } from "react";
import { googleLogin } from "../publicSite/services/api";
import { useAuth } from "./PublicAuthContext";

const GoogleLoginButton = ({ elementId = "google-signin-button" }) => {
  const { login } = useAuth();
  const renderRef = useRef(false); // Prevents re-rendering the button on the same element

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
    if (!window.google?.accounts?.id || renderRef.current) return;

    // 🔹 FIX: Check if already initialized globally to stop the "Multiple Calls" warning
    if (!window.google_initialized) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google_initialized = true; // Set a global flag
    }

    const buttonDiv = document.getElementById(elementId);
    if (buttonDiv) {
      window.google.accounts.id.renderButton(
        buttonDiv,
        {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          width: "250", // 🔹 FIX: Changed from "100%" to a number string
          text: "signin_with",
          logo_alignment: "left"
        }
      );
      renderRef.current = true;
    }
  }, [elementId, handleCredentialResponse]);

  useEffect(() => {
    const scriptUrl = "https://accounts.google.com/gsi/client";
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      script.onload = () => renderGoogleButton();
      document.body.appendChild(script);
    } else {
      // If script exists but isn't loaded yet
      existingScript.addEventListener("load", renderGoogleButton);
    }
    
    return () => {
      renderRef.current = false;
    };
  }, [renderGoogleButton]);

  return (
    <div className="w-full flex justify-center">
      <div id={elementId} className="min-h-[44px]" />
    </div>
  );
};

export default GoogleLoginButton;