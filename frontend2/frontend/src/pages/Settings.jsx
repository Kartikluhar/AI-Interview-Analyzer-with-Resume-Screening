import React, { useState, useEffect } from "react";
import { User, Mail, Save, Loader2, UserCircle } from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });

  // Fetch API Base URL - Adjust this to match your backend port/URL
  const API_BASE_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await fetch(`${API_BASE_URL}/profile/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          username: data.data.username || "",
          email: data.data.email || "",
          first_name: data.data.first_name || "",
          last_name: data.data.last_name || "",
        });
      } else {
        toast.error(data.message || "Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Network error while loading profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- NEW VALIDATION: Prevent blank or whitespace-only submissions ---
    if (!formData.first_name.trim()) {
      toast.error("First name cannot be blank.");
      return;
    }
    if (!formData.last_name.trim()) {
      toast.error("Last name cannot be blank.");
      return;
    }
    if (!formData.username.trim()) {
      toast.error("Username cannot be blank.");
      return;
    }
    // --------------------------------------------------------------------

    setIsSaving(true);

    try {
      const token = localStorage.getItem("access");
      const response = await fetch(`${API_BASE_URL}/profile/update/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Use .trim() here to ensure clean data is sent to the backend
        body: JSON.stringify({
          username: formData.username.trim(),
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile updated successfully!");

        // Update local storage so the Layout top-bar reflects the new username
        if (formData.username.trim()) {
          localStorage.setItem("username", formData.username.trim());
          // Dispatch a custom event to force layout refresh without reload
          window.dispatchEvent(new Event("storage"));
        }
      } else {
        // Handle validation errors from backend
        const errorMsg = data.username
          ? data.username[0]
          : "Failed to update profile";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Network error while updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-secondary-text bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-secondary-text mt-2">
          Manage your profile information and account preferences.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="glass-panel border border-border-custom rounded-2xl overflow-hidden bg-secondary-bg/50 backdrop-blur-sm">
        {/* Profile Avatar Header */}
        <div className="p-6 md:p-8 border-b border-border-custom bg-black/20 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center text-white font-bold text-3xl border border-white/10 shadow-lg">
            {formData.username
              ? formData.username.charAt(0).toUpperCase()
              : "U"}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {formData.first_name || formData.last_name
                ? `${formData.first_name} ${formData.last_name}`
                : formData.username}
            </h2>
            <p className="text-secondary-text">{formData.email}</p>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-text flex items-center gap-2">
                <UserCircle size={16} /> First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full bg-black/20 border border-border-custom rounded-xl px-4 py-3 text-white placeholder-secondary-text/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-text flex items-center gap-2">
                <UserCircle size={16} /> Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full bg-black/20 border border-border-custom rounded-xl px-4 py-3 text-white placeholder-secondary-text/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-text flex items-center gap-2">
                <User size={16} /> Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter username"
                className="w-full bg-black/20 border border-border-custom rounded-xl px-4 py-3 text-white placeholder-secondary-text/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-text flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full bg-black/40 border border-border-custom/50 rounded-xl px-4 py-3 text-secondary-text cursor-not-allowed opacity-70"
                title="Email cannot be changed directly"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-border-custom flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-accent/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
