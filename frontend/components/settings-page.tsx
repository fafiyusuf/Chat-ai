"use client"

import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/lib/store"
import {
    Bell,
    Lock,
    LogOut,
    Moon,
    Palette,
    Sun,
    User
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SettingsPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const { currentUser, setActivePage } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Profile Section */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Profile
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                    {currentUser?.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{currentUser?.displayName?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{currentUser?.displayName || currentUser?.username}</h3>
                    <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePage("profile")}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Palette size={20} className="text-primary" />
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Theme</h3>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      theme === 'light' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Sun size={18} />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      theme === 'dark' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Moon size={18} />
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Message Notifications</h3>
                  <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications ? 'bg-emerald-500' : 'bg-muted'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Sound</h3>
                  <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    soundEnabled ? 'bg-emerald-500' : 'bg-muted'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock size={20} className="text-primary" />
              Account
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium text-foreground">Account ID</h3>
                  <p className="text-sm text-muted-foreground font-mono">{currentUser?.id?.slice(0, 16)}...</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium text-foreground">Member Since</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card rounded-xl border border-red-200 dark:border-red-900 p-6">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <LogOut size={20} />
              Danger Zone
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
