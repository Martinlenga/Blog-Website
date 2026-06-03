import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { getAdminProfile, updateAdminProfile } from "../../services/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { Lock, Camera, Save, User, Mail, Phone, FileText, Loader, X, CheckCircle } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { refreshAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [removePicture, setRemovePicture] = useState(false);
  
  const [profile, setProfile] = useState({
    username: "", email: "", first_name: "", last_name: "", bio: "", phone: "", profile_picture: "",
  });
  
  // Keep track of the raw file separately for cleanup purposes
  const [previewImage, setPreviewImage] = useState(null);

  // Helper to force re-fetch of image by adding a timestamp (Cache-Buster)
  const getImageUrl = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${profile.username || 'Admin'}&background=4f46e5&color=fff`;
    if (url.startsWith("http")) return url;
    
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    const apiBase = process.env.REACT_APP_API_URL?.replace('/api', '') || "";
    if (url.includes(apiBase)) return url;
    
    return `${apiBase}${cleanPath}`;
  };

  // 🚀 PERFORMANCE FIX: Proper Unmount Cleanup for both the API call and Blob URLs
  useEffect(() => {
    let isMounted = true;

    getAdminProfile()
      .then((res) => {
        if (isMounted) {
          setProfile(res.data);
          setPreviewImage(getImageUrl(res.data.profile_picture));
        }
      })
      .catch(() => {
        if (isMounted) navigate("/admin/login");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      // 🚀 MEMORY LEAK FIX: Clean up blob URLs when component unmounts
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, profile_picture: file }));
      
      // Clean up previous blob if it exists to save browser memory
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
      
      setPreviewImage(URL.createObjectURL(file));
      setRemovePicture(false);
    }
  };

  const handleRemoveImage = () => {
    setRemovePicture(true);
    setProfile((prev) => ({ ...prev, profile_picture: null }));
    
    // Clean up blob if we are removing a newly uploaded but unsaved image
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    
    setPreviewImage(getImageUrl(null));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    
    formData.append("first_name", profile.first_name || "");
    formData.append("last_name", profile.last_name || "");
    formData.append("email", profile.email || "");
    formData.append("bio", profile.bio || "");
    formData.append("phone", profile.phone || "");

    if (removePicture) {
        formData.append("remove_profile_picture", "true");
    } else if (profile.profile_picture instanceof File) {
        formData.append("profile_picture", profile.profile_picture, profile.profile_picture.name);
    }

    try {
      const res = await updateAdminProfile(formData);
      setProfile(res.data);
      
      // Cache-bust safely (avoiding issues with S3/Cloudinary presigned URLs if used later)
      const newImgUrl = getImageUrl(res.data.profile_picture);
      const separator = newImgUrl.includes('?') ? '&' : '?';
      setPreviewImage(`${newImgUrl}${separator}t=${Date.now()}`);
      
      await refreshAdmin();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Profile Update Error:", err.response?.data);
      alert("Error updating profile. Please check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet><title>My Account | JK Admin</title></Helmet>
      
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3 animate-in zoom-in-95 duration-200">
            <CheckCircle className="text-emerald-500 animate-bounce" size={24} />
            <span className="font-bold text-gray-900">Profile Updated Successfully!</span>
          </div>
        </div>
      )}
      
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Account</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage your administrative identity parameters.</p>
        </div>
        <button 
          onClick={() => navigate("/admin/my-account/change-password")}
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto w-full sm:w-auto shadow-sm active:scale-95"
        >
          <Lock size={14} /> Security Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Profile Avatar Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="h-20 bg-gradient-to-r from-slate-800 to-slate-900"></div>
          <div className="px-6 pb-6 text-center -mt-10">
            <div className="relative inline-block mx-auto">
               <img src={previewImage} alt="Profile avatar" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-md object-cover bg-white" />
               <label 
                 className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 shadow-md border-2 border-white transition-all active:scale-90"
                 title="Upload new picture"
               >
                  <Camera size={14} />
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/jpeg, image/png, image/webp" />
               </label>
               {previewImage && !previewImage.includes("ui-avatars") && (
                 <button 
                   type="button" 
                   onClick={handleRemoveImage} 
                   className="absolute top-0 right-0 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 border-2 border-white shadow-md transition-all active:scale-90"
                   title="Remove picture"
                 >
                    <X size={12} />
                 </button>
               )}
            </div>
            <h2 className="mt-3 text-base sm:text-lg font-bold text-gray-900 truncate tracking-tight">
              {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}` : 'Admin User'}
            </h2>
            <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mb-6">Profile Details</h3>
          
          <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* 🚀 A11Y FIX: Linked all labels to inputs using htmlFor and id */}
              <div className="space-y-1.5">
                <label htmlFor="first_name" className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer">First Name</label>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <User size={16} className="text-gray-400" />
                  <input id="first_name" name="first_name" autoComplete="first_name" value={profile.first_name || ""} onChange={handleChange} className="bg-transparent w-full outline-none text-xs sm:text-sm font-medium text-gray-900" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="last_name" className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer">Last Name</label>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <User size={16} className="text-gray-400" />
                  <input id="last_name" name="last_name" value={profile.last_name || ""} onChange={handleChange} className="bg-transparent w-full outline-none text-xs sm:text-sm font-medium text-gray-900" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer">Email Address</label>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <Mail size={16} className="text-gray-400" />
                  <input id="email" name="email" autoComplete="email" value={profile.email || ""} onChange={handleChange} type="email" className="bg-transparent w-full outline-none text-xs sm:text-sm font-medium text-gray-900" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer">Phone Number</label>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <Phone size={16} className="text-gray-400" />
                  <input id="phone" name="phone" autoComplete="phone" value={profile.phone || ""} onChange={handleChange} className="bg-transparent w-full outline-none text-xs sm:text-sm font-medium text-gray-900" />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="bio" className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer">Bio Description</label>
                <div className="flex gap-2.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <FileText size={16} className="text-gray-400 mt-0.5" />
                  <textarea id="bio" name="bio" value={profile.bio || ""} onChange={handleChange} rows={3} className="bg-transparent w-full outline-none text-xs sm:text-sm resize-none font-medium text-gray-900" placeholder="Write a short description about yourself..." />
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-gray-100 flex">
               <button 
                 type="submit" 
                 disabled={saving} 
                 className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md w-full sm:w-auto ml-auto transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} 
                 <span>{saving ? "Saving..." : "Save Changes"}</span>
               </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
}