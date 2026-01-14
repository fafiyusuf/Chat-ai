"use client"

import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/lib/store"
import { Filter, MoreVertical, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export function MessageList() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()
  const {
    sessions,
    selectedSessionId,
    selectSession,
    fetchSessions,
    isLoadingSessions,
    openModal,
    searchQuery,
    setSearchQuery,
    currentUser,
    setActivePage,
  } = useAppStore()
  const { theme, setTheme } = useTheme()
  
  const newMessageButtonRef = useRef<HTMLButtonElement>(null)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Fetch sessions when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions()
    }
  }, [isAuthenticated, fetchSessions])

  // Helper to get the other participant's info for 1:1 chats
  const getSessionDisplayInfo = (session: typeof sessions[0]) => {
    if (session.isGroup) {
      return {
        name: session.name || "Group Chat",
        avatar: null,
        status: null,
      }
    }
    
    // Backend returns 'users' not 'participants'
    const otherUser = session.users?.find(
      u => u.userId !== currentUser?.id
    )
    
    return {
      name: otherUser?.user?.displayName || otherUser?.user?.username || "Unknown",
      avatar: otherUser?.user?.avatarUrl || null,
      status: otherUser?.user?.status || "offline",
    }
  }

  // Format timestamp for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return "Yesterday"
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const filteredSessions = sessions.filter((s) => {
    const info = getSessionDisplayInfo(s)
    const lastMsg = s.messages?.[0] // Backend returns messages array with most recent first
    return (
      info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMsg?.content?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="w-96 bg-white dark:bg-gray-800 rounded-2xl flex flex-col shadow-sm overflow-hidden">
      {/* User Info Section */}
      
        {/* <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold overflow-hidden">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <span>{currentUser?.displayName?.charAt(0) || currentUser?.username?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{currentUser?.displayName || currentUser?.username}</h3>
            <p className="text-sm text-muted-foreground truncate">{currentUser?.email}</p>
          </div>
        </div> */}

        {/* Credits Info - matching Figma
        <div className="bg-background rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Credits</span>
            <button className="text-emerald-500 hover:underline text-xs">+25 tomorrow</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">20 left</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>5 of 25 used today</span>
            <span>Renews in: 6h 24m</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '20%' }}></div>
          </div>
          <button className="w-full mt-2 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <span>⭐</span>
            Win free credits
          </button>
        </div> */}

        {/* Action Buttons
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setActivePage("profile")}
            className="flex-1 py-2 px-3 bg-background hover:bg-muted rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
            title="Rename file"
          >
            <User size={16} />
            <span className="hidden xl:inline">Rename file</span>
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex-1 py-2 px-3 bg-background hover:bg-muted rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
            title="Theme Style"
          >
            <Palette size={16} />
            <span className="hidden xl:inline">Theme Style</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2 px-3 bg-background hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
            title="Log out"
          >
            <LogOut size={16} />
            <span className="hidden xl:inline">Log out</span>
          </button>
        </div> */}
  

      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">All Message</h2>
          <button
            ref={newMessageButtonRef}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              openModal("newMessage", {
                top: rect.bottom + 8,
                left: rect.left,
              })
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>✎</span> New Message
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in message"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="px-3 py-2 bg-input border border-input rounded-lg hover:bg-muted transition-colors">
            <Filter size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingSessions ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p>No conversations yet</p>
            <button 
              onClick={() => openModal("newMessage")}
              className="mt-2 text-primary hover:underline"
            >
              Start a new chat
            </button>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const displayInfo = getSessionDisplayInfo(session)
            
            return (
              <div
                key={session.id}
                onClick={() => selectSession(session.id)}
                className={`px-4 py-3 border-b border-border cursor-pointer hover:bg-[#F3F3EE] dark:hover:bg-gray-700 transition-colors ${
                  selectedSessionId === session.id ? "bg-[#F3F3EE] dark:bg-gray-700" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {displayInfo.avatar ? (
                      <img
                        src={displayInfo.avatar}
                        alt={displayInfo.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {displayInfo.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {displayInfo.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{displayInfo.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {session.messages?.[0] ? formatTime(session.messages[0].createdAt) : formatTime(session.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.messages?.[0]?.content || "No messages yet"}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Context menu functionality
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
