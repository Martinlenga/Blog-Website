import { useEffect, useRef } from "react";
import { googleLogin } from "../publicSite/services/api";
import { useAuth } from "./PublicAuthContext";

const GoogleLoginButton = ({ elementId = "google-signin-button" }) => {
  const { login } = useAuth();
  const initialized = useRef(false); // Ref tracks the lifecycle

  useEffect(() => {
    // Prevent double-init from StrictMode
    if (initialized.current) return;
    initialized.current = true;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          const res = await googleLogin(response.credential);
          if (res?.access) login(res.access, res.user, res.refresh);
        },
        ux_mode: "popup",
      });

      const buttonDiv = document.getElementById(elementId);
      if (buttonDiv) {
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: "outline",
          size: "large",
          shape: "pill",
        });
      }
    };
  }, [login, elementId]);

  return <div id={elementId} className="h-[40px] w-full min-w-[120px]" />;
};

export default GoogleLoginButton;