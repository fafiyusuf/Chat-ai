"use client"

import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/lib/store"
import {
    Calendar,
    Camera,
    Edit2,
    Mail,
    MapPin,
    Phone,
    Save,
    Shield,
    User as UserIcon,
    X
} from "lucide-react"
import { useState } from "react"

export function ProfilePage() {
  const { user } = useAuth()
  const { currentUser } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || "",
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    phone: "",
    location: "",
    bio: "",
  })

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      displayName: currentUser?.displayName || "",
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      phone: "",
      location: "",
      bio: "",
    })
    setIsEditing(false)
  }

  const getInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return currentUser?.username?.charAt(0).toUpperCase() || "U"
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your profile information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Avatar Section */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials()}</span>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                    <Camera size={20} />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">{currentUser?.displayName || currentUser?.username}</h2>
                <p className="text-muted-foreground">@{currentUser?.username}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Active now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <UserIcon size={20} className="text-primary" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Display Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-foreground">{currentUser?.displayName || "Not set"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-foreground">@{currentUser?.username}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </label>
                <p className="text-foreground">{currentUser?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Phone size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-foreground">{formData.phone || "Not set"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-foreground">{formData.location || "Not set"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">About</h3>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            ) : (
              <p className="text-foreground">{formData.bio || "No bio yet"}</p>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Member since</span>
                <span className="text-foreground font-medium">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "Recently"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account ID</span>
                <span className="text-foreground font-mono text-sm">{currentUser?.id?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Shield size={16} />
                  Status
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
