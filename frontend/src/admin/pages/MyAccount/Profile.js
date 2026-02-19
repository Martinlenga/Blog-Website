import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { getAdminProfile, updateAdminProfile } from "../../services/adminApi";
import { Lock, Camera, Save, User, Mail, Phone, FileText, Loader } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    username: "", email: "", first_name: "", last_name: "", bio: "", phone: "", profile_picture: "",
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    getAdminProfile()
      .then((res) => {
        setProfile(res.data);
        const img = res.data.profile_picture 
          ? (res.data.profile_picture.startsWith("http") ? res.data.profile_picture : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${res.data.profile_picture}`)
          : `https://ui-avatars.com/api/?name=${res.data.username}&background=random`;
        setPreviewImage(img);
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
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    Object.keys(profile).forEach(key => {
        if (key === 'profile_picture' && profile[key] instanceof File) {
            formData.append(key, profile[key]);
        } else if (key !== 'profile_picture') {
            formData.append(key, profile[key]);
        }
    });

    try {
      const res = await updateAdminProfile(formData);
      setProfile(res.data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading profile...</div>;

  return (
    <div className="animate-fade-in-up pb-10 max-w-5xl mx-auto">

      <Helmet>
        <title>My Account | JK Admin</title>
      </Helmet>
      
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your personal information.</p>
        </div>
        <button 
          onClick={() => navigate("/admin/my-account/change-password")}
          className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
        >
          <Lock size={16} /> Security Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Identity Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900"></div>
          <div className="px-6 pb-6 text-center -mt-10">
            <div className="relative inline-block">
               <img 
                 src={previewImage} 
                 alt="Profile" 
                 className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white"
               />
               <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 shadow-md border-2 border-white transition-all">
                 <Camera size={14} />
                 <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
               </label>
            </div>
            <h2 className="mt-3 text-xl font-bold text-gray-900">{profile.first_name} {profile.last_name}</h2>
            <p className="text-sm text-gray-500">@{profile.username}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-4 text-sm text-gray-600">
               <div className="flex flex-col items-center">
                  <span className="font-bold text-gray-900">Admin</span>
                  <span className="text-xs">Role</span>
               </div>
               <div className="w-[1px] bg-gray-200"></div>
               <div className="flex flex-col items-center">
                  <span className="font-bold text-emerald-600">Active</span>
                  <span className="text-xs">Status</span>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">Profile Details</h3>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                   <User size={16} className="text-gray-400" />
                   <input 
                     name="first_name" value={profile.first_name} onChange={handleChange}
                     className="bg-transparent w-full text-sm outline-none text-gray-900"
                   />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                   <User size={16} className="text-gray-400" />
                   <input 
                     name="last_name" value={profile.last_name} onChange={handleChange}
                     className="bg-transparent w-full text-sm outline-none text-gray-900"
                   />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                   <Mail size={16} className="text-gray-400" />
                   <input 
                     name="email" value={profile.email} onChange={handleChange}
                     className="bg-transparent w-full text-sm outline-none text-gray-900"
                   />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                   <Phone size={16} className="text-gray-400" />
                   <input 
                     name="phone" value={profile.phone || ""} onChange={handleChange}
                     className="bg-transparent w-full text-sm outline-none text-gray-900"
                     placeholder="+254..."
                   />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</label>
                <div className="flex gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                   <FileText size={16} className="text-gray-400 mt-1" />
                   <textarea 
                     name="bio" value={profile.bio || ""} onChange={handleChange} rows={3}
                     className="bg-transparent w-full text-sm outline-none text-gray-900 resize-none"
                     placeholder="Tell us a little about yourself..."
                   />
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
               <button 
                 type="submit" disabled={saving}
                 className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-gray-200 transition-all disabled:opacity-50"
               >
                 {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                 Save Changes
               </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}