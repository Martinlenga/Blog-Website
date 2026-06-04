import { useState, useRef, useEffect } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import { googleLogin } from "../publicSite/services/api"; 
import { useAuth } from "./PublicAuthContext";
import { FiLoader } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc"; 

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Failsafe timer to prevent the button from getting stuck forever
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      
      // Emergency failsafe: If Django takes longer than 10 seconds, unfreeze the button
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        if (onError) onError("Connection timed out. Please try again.");
      }, 10000);

      try {
        const res = await googleLogin(tokenResponse.access_token);
        if (res?.access) {
          login(res.access, res.user, res.refresh);
          if (onSuccess) onSuccess(res.user);
        }
      } catch (err) {
        console.error("Django Exchange Failed:", err);
        if (onError) onError("Failed to authenticate.");
      } finally {
        clearTimeout(timeoutRef.current);
        setIsLoading(false);
      }
    },
    onError: () => {
      setIsLoading(false);
      if (onError) onError("Google auth closed or failed.");
    },
    // Explicitly declare implicit flow to help the library handle popups better
    flow: 'implicit'
  });

  const handleClick = () => {
    setIsLoading(true);
    
    // If the popup gets blocked by the browser instantly, reset after 3 seconds
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    handleGoogleSignIn();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      // 🚀 UX FIX: Static width strategy so the button doesn't jitter or change shape when loading
      className="relative inline-flex items-center justify-center gap-2 md:gap-2.5 py-1.5 px-3 md:py-2 md:px-4 bg-white text-gray-600 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed whitespace-nowrap overflow-hidden"
    >
      {/* 🚀 UX FIX: We removed "Securing...". The text never changes now! */}
      <div className={`flex items-center gap-2 transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <FcGoogle className="text-base md:text-lg shrink-0" /> 
        <span className="hidden md:inline text-[13px] md:text-sm">Continue with Google</span>
        <span className="md:hidden text-xs tracking-wide">Sign In</span>
      </div>

      {/* 🚀 UX FIX: The spinner just overlays on top subtly */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FiLoader className="animate-spin text-lg text-indigo-600" /> 
        </div>
      )}
    </button>
  );
};

export default GoogleLoginButton;