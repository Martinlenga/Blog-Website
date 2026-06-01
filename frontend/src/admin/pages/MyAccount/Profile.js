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
  const [previewImage, setPreviewImage] = useState(null);

  // Helper to force re-fetch of image by adding a timestamp (Cache-Buster)
  const getImageUrl = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${profile.username || 'Admin'}&background=4f46e5&color=fff`;
    if (url.startsWith("http")) return url;
    return `${process.env.REACT_APP_API_URL?.replace('/api', '')}${url}?t=${new Date().getTime()}`;
  };

  useEffect(() => {
    getAdminProfile()
      .then((res) => {
        setProfile(res.data);
        setPreviewImage(getImageUrl(res.data.profile_picture));
      })
      .catch(() => navigate("/admin/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, profile_picture: file }));
      setPreviewImage(URL.createObjectURL(file));
      setRemovePicture(false);
    }
  };

  const handleRemoveImage = () => {
    setRemovePicture(true);
    setProfile((prev) => ({ ...prev, profile_picture: null }));
    setPreviewImage(getImageUrl(null));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    
    formData.append("username", profile.username || "");
    formData.append("first_name", profile.first_name || "");
    formData.append("last_name", profile.last_name || "");
    formData.append("email", profile.email || "");
    formData.append("bio", profile.bio || "");
    formData.append("phone", profile.phone || "");

    if (removePicture) {
        formData.append("remove_profile_picture", "true");
    } else if (profile.profile_picture instanceof File) {
        formData.append("profile_picture", profile.profile_picture);
    }

    try {
      const res = await updateAdminProfile(formData);
      
      // Update local state and preview immediately
      setProfile(res.data);
      setPreviewImage(getImageUrl(res.data.profile_picture));
      
      // Update Context (Topbar)
      await refreshAdmin();
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400 text-sm">Loading profile components...</div>;

  return (
    <div className="animate-fade-in-up pb-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet><title>My Account | JK Admin</title></Helmet>
      
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <CheckCircle className="text-emerald-500" />
            <span className="font-bold">Profile Updated Successfully!</span>
          </div>
        </div>
      )}
      
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Account</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage your structural administrative identity parameters.</p>
        </div>
        <button 
          onClick={() => navigate("/admin/my-account/change-password")}
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto w-full sm:w-auto shadow-2xs active:scale-95"
        >
          <Lock size={14} /> Security Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="h-20 bg-gradient-to-r from-slate-800 to-slate-900"></div>
          <div className="px-6 pb-6 text-center -mt-10">
            <div className="relative inline-block mx-auto">
               <img src={previewImage} alt="Profile avatar" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-md object-cover bg-white" />
               <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 shadow-md border border-white transition-all active:scale-90">
                  <Camera size={12} />
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
               </label>
               {previewImage && !previewImage.includes("ui-avatars") && (
                 <button type="button" onClick={handleRemoveImage} className="absolute top-0 right-0 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 border border-white shadow-md">
                    <X size={12} />
                 </button>
               )}
            </div>
            <h2 className="mt-3 text-base sm:text-lg font-bold text-gray-900 truncate tracking-tight">{profile.first_name} {profile.last_name}</h2>
            <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mb-6">Profile Details</h3>
          <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fields kept exactly as original */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">First Name</label>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"><User size={14} className="text-gray-400" /><input name="first_name" value={profile.first_name || ""} onChange={handleChange} className="bg-transparent w-full outline-none text-xs sm:text-sm" /></div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Last Name</label>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"><User size={14} className="text-gray-400" /><input name="last_name" value={profile.last_name || ""} onChange={handleChange} className="bg-transparent w-full outline-none text-xs sm:text-sm" /></div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"><Mail size={14} className="text-gray-400" /><input name="email" value={profile.email || ""} onChange={handleChange} type="email" className="bg-transparent w-full outline-none text-xs sm:text-sm" /></div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"><Phone size={14} className="text-gray-400" /><input name="phone" value={profile.phone || ""} onChange={handleChange} className="bg-transparent w-full outline-none text-xs sm:text-sm" /></div>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Bio Description</label>
                <div className="flex gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"><FileText size={14} className="text-gray-400 mt-1" /><textarea name="bio" value={profile.bio || ""} onChange={handleChange} rows={3} className="bg-transparent w-full outline-none text-xs sm:text-sm resize-none" /></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex">
               <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md w-full sm:w-auto ml-auto">
                 {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />} <span>Save Changes</span>
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}