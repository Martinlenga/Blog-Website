import { useState, useRef, useEffect } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import { googleLogin } from "../publicSite/services/api"; 
import { useAuth } from "./PublicAuthContext";
import { FiLoader, FiExternalLink } from "react-icons/fi"; // 🚀 Added FiExternalLink
import { FcGoogle } from "react-icons/fc"; 

// 🚀 HELPER: Detects if the user is trapped inside Facebook, Instagram, TikTok, etc.
const isInAppBrowser = () => {
  if (typeof window === "undefined" || !window.navigator) return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return (
    ua.indexOf("FBAV") > -1 || 
    ua.indexOf("FBIOS") > -1 || 
    ua.indexOf("Instagram") > -1 ||
    ua.indexOf("Snapchat") > -1 ||
    ua.indexOf("LinkedInApp") > -1 ||
    ua.indexOf("BytedanceWebview") > -1
  );
};

const GoogleLoginButton = ({ onSuccess, onError, variant = "navbar" }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [inAppTrapped, setInAppTrapped] = useState(false); // 🚀 STATE: Tracks if they are trapped
  const timeoutRef = useRef(null);

  useEffect(() => {
    // 🚀 Check for the in-app browser the moment the button loads
    if (isInAppBrowser()) {
      setInAppTrapped(true);
    }
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      
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
    flow: 'implicit'
  });

  const handleClick = () => {
    setIsLoading(true);
    timeoutRef.current = setTimeout(() => setIsLoading(false), 3000);
    handleGoogleSignIn();
  };

  // ==========================================
  // 🚀 THE ESCAPE HATCH UI (Shows ONLY if inside Facebook/Insta)
  // ==========================================
  if (inAppTrapped) {
    if (variant === "unlock") {
      return (
        <div className="w-full p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl shadow-inner text-sm text-center">
          <p className="font-bold mb-1 flex items-center justify-center gap-2">
            <FiExternalLink /> Google Login Blocked
          </p>
          <p className="text-amber-700 text-xs leading-relaxed">
            Social media browsers block secure logins. Tap the <strong>three dots (•••)</strong> at the top right and select <strong>"Open in system browser"</strong> to unlock.
          </p>
        </div>
      );
    }
    
    // Navbar trapped variant
    return (
      <button 
        onClick={() => alert('Please tap the three dots (•••) at the top right and select "Open in system browser" to sign in securely.')}
        className="inline-flex items-center gap-2 py-1.5 px-3 bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
      >
        <FiExternalLink /> Open in Browser
      </button>
    );
  }

  // ==========================================
  // NORMAL BUTTONS (Shows in Chrome, Safari, Firefox)
  // ==========================================
  
  // 🚀 VARIANT 1: The Massive 'Unlock' Button for PostDetail
  if (variant === "unlock") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="relative w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg hover:-translate-y-0.5 text-sm overflow-hidden flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
      >
        <div className={`flex items-center gap-2 transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          <FcGoogle className="text-xl bg-white rounded-full p-0.5" />
          <span>Sign in with Google to Unlock</span>
        </div>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FiLoader className="animate-spin text-xl text-white" /> 
          </div>
        )}
      </button>
    );
  }

  // 🚀 VARIANT 2: The Default Small Button for Navbar
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="relative inline-flex items-center justify-center gap-2 md:gap-2.5 py-1.5 px-3 md:py-2 md:px-4 bg-white text-gray-600 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed whitespace-nowrap overflow-hidden"
    >
      <div className={`flex items-center gap-2 transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <FcGoogle className="text-base md:text-lg shrink-0" /> 
        <span className="hidden md:inline text-[13px] md:text-sm">Continue with Google</span>
        <span className="md:hidden text-xs tracking-wide">Sign In</span>
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FiLoader className="animate-spin text-lg text-indigo-600" /> 
        </div>
      )}
    </button>
  );
};

export default GoogleLoginButton;