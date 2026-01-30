import React, { useEffect } from "react";
import { googleLogin } from "../publicSite/services/api";
import { useAuth } from "../auth/PublicAuthContext";

const GoogleLoginButton = () => {
  const { login } = useAuth();

  useEffect(() => {
    // load the Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      /* global google */
      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" }
      );
    };

    // clean up
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // called when user signs in with Google
  const handleCredentialResponse = async (response) => {
    try {
      const idToken = response.credential; // Google JWT
      const res = await googleLogin(idToken); // your backend
      login(res.jwt, res.user);
      alert("Logged in successfully!");
    } catch (err) {
      console.error(err);
      alert("Google login failed. Try again.");
    }
  };

  return <div id="google-signin-button"></div>;
};

export default GoogleLoginButton;
