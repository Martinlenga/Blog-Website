// src/admin/pages/MyAccount/Profile.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProfile, updateAdminProfile } from "../../services/adminApi";
import { Lock } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    bio: "",
    phone: "",
    profile_picture: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminProfile()
      .then((res) => {
        setProfile(res.data);
        setPreviewImage(
          res.data.profile_picture
            ? `http://127.0.0.1:8000${res.data.profile_picture}`
            : `https://ui-avatars.com/api/?name=${res.data.username}&background=0D8ABC&color=fff`
        );
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
    formData.append("username", profile.username);
    formData.append("first_name", profile.first_name || "");
    formData.append("last_name", profile.last_name || "");
    formData.append("email", profile.email || "");
    formData.append("phone", profile.phone || "");
    formData.append("bio", profile.bio || "");

    if (profile.profile_picture instanceof File) {
      formData.append("profile_picture", profile.profile_picture);
    }

    try {
      const res = await updateAdminProfile(formData);
      setProfile(res.data);

      if (res.data.profile_picture) {
        setPreviewImage(`http://127.0.0.1:8000${res.data.profile_picture}`);
      }

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err.response || err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full p-6 text-gray-500 text-lg">
        Loading...
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">My Account</h1>
        <p className="text-gray-500 mt-1">
          Update your profile information and manage your account
        </p>
      </div>

      <div className="relative bg-gradient-to-r from-white via-gray-50 to-white shadow-2xl rounded-3xl p-10 pt-24">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <img
            src={previewImage}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
          />
          <label className="mt-4 cursor-pointer text-blue-600 font-medium hover:text-blue-800">
            Change Photo
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" name="username" value={profile.username} onChange={handleChange} className="hidden" />
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Username</label>
              <input type="text" name="username" value={profile.username} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">First Name</label>
              <input type="text" name="first_name" value={profile.first_name} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Last Name</label>
              <input type="text" name="last_name" value={profile.last_name} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Phone</label>
              <input type="text" name="phone" value={profile.phone || ""} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Bio</label>
              <textarea name="bio" value={profile.bio || ""} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
            <button type="submit" disabled={saving} className={`px-10 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all ${saving ? "opacity-50 cursor-not-allowed" : ""}`}>
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button type="button" onClick={() => navigate("/admin/my-account/change-password")} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 underline font-semibold">
              <Lock size={16} /> Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
