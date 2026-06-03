import { useState } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import { googleLogin } from "../publicSite/services/api"; 
import { useAuth } from "./PublicAuthContext";
import { FiLoader } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc"; 

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    },
    onError: () => {
      if (onError) onError("Google auth closed or failed.");
    }
  });

  return (
    <button
      onClick={() => handleGoogleSignIn()}
      disabled={isLoading}
      // 🚀 UX FIX: Official Google styling (white bg, gray border, dark text) and tighter desktop padding
      className="inline-flex items-center justify-center gap-2 md:gap-2.5 py-1.5 px-3 md:py-2 md:px-4 bg-white text-gray-600 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {isLoading ? (
        <>
          <FiLoader className="animate-spin text-sm md:text-base text-gray-500" /> 
          <span className="hidden md:inline text-[13px] md:text-sm">Securing...</span>
        </>
      ) : (
        <>
          <FcGoogle className="text-base md:text-lg shrink-0" /> 
          <span className="hidden md:inline text-[13px] md:text-sm">Continue with Google</span>
          <span className="md:hidden text-xs tracking-wide">Sign In</span>
        </>
      )}
    </button>
  );
};

export default GoogleLoginButton;