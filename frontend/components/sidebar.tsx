"use client"

import { useAuth } from "@/lib/auth-context"
import { useAppStore, type PageType } from "@/lib/store"
import { Folder, Home, LogOut, MessageCircle, Phone, Settings, Sparkles, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Sidebar() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const { activePage, setActivePage, setCurrentUser } = useAppStore()
  const [showDropdown, setShowDropdown] = useState(false)

  // Sync user from auth to store
  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.id,
        email: user.email,
        username: user.username || user.email.split('@')[0],
        displayName: user.displayName || user.email,
        avatarUrl: user.avatarUrl || undefined,
        status: user.status,
        createdAt: new Date().toISOString(),
      })
    } else {
      setCurrentUser(null)
    }
  }, [user, setCurrentUser])

  const handleNavigation = (page: PageType) => {
    setActivePage(page)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const navItems: { page: PageType; icon: typeof Home; label: string }[] = [
    { page: "home", icon: Home, label: "Home" },
    { page: "calls", icon: Phone, label: "Calls" },
    { page: "files", icon: Folder, label: "Files" },
  ]

  return (
    <div className="w-20 bg-[#F3F3EE] dark:bg-gray-800 rounded-2xl flex flex-col items-center py-4 gap-4 ">
      {/* Logo */}
      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 transition-opacity">
        <MessageCircle size={24} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map(({ page, icon: Icon, label }) => (
          <button
            key={page}
            onClick={() => handleNavigation(page)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activePage === page
                ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-200"
                : "hover:bg-muted text-sidebar-foreground"
            }`}
            title={label}
          >
            <Icon size={24} />
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* AI Chat Button */}
      <button
        onClick={() => handleNavigation("ai-chat")}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          activePage === "ai-chat"
            ? "bg-emerald-100 text-emerald-600"
            : "hover:bg-muted text-sidebar-foreground"
        }`}
        title="AI Chat"
      >
        <Sparkles size={24} />
      </button>

      {/* User Profile */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer overflow-hidden"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
          ) : (
            <span>{getInitials(user?.displayName || user?.email || "U")}</span>
          )}
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 w-56 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-white">{user?.displayName || "User"}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button 
                  onClick={() => {
                    setShowDropdown(false)
                    handleNavigation("profile")
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <User size={18} />
                  Profile
                </button>
                <button 
                  onClick={() => {
                    setShowDropdown(false)
                    handleNavigation("settings")
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <Settings size={18} />
                  Settings
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 flex items-center gap-3"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
