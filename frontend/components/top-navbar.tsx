"use client"

import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/lib/store"
import { Bell, MessageCircle, Moon, Search, Settings, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

export function TopNavbar() {
  const { user } = useAuth()
  const { currentUser, openModal, activePage, setActivePage } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)

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

  const getPageTitle = () => {
    switch (activePage) {
      case "home":
        return "Message"
      case "calls":
        return "Calls"
      case "files":
        return "Files"
      case "settings":
        return "Settings"
      case "profile":
        return "Profile"
      case "ai-chat":
        return "AI Chat"
      default:
        return "Message"
    }
  }

  return (
    <div className="h-14 bg-white dark:bg-gray-800 flex items-center justify-between px-6 rounded-2xl shadow-sm">
      {/* Left side - Page Title */}
      <div className="flex items-center gap-3">
        <MessageCircle size={24} className="text-emerald-500" />
        <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} className="text-muted-foreground" /> : <Moon size={20} className="text-muted-foreground" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} className="text-muted-foreground" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>
          
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="overflow-y-auto max-h-80">
                  <div className="p-8 text-center text-gray-400">
                    No new notifications
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => setActivePage("settings")}
          className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          title="Settings"
        >
          <Settings size={20} className="text-muted-foreground" />
        </button>

        {/* User Avatar */}
        <button
          onClick={() => setActivePage("profile")}
          className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          title="Profile"
        >
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" />
          ) : (
            <span>{getInitials()}</span>
          )}
        </button>
      </div>
    </div>
  )
}
