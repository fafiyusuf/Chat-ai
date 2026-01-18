"use client"

import { usersApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useAppStore, User } from "@/lib/store"
import { Archive, BellOff, Download, Info, Loader2, MailOpen, MoreVertical, Search, Trash2, UserPlus, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { TouchEvent, useEffect, useRef, useState } from "react"

// Context menu state type
interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  sessionId: string | null
}

// Swipe state type
interface SwipeState {
  sessionId: string | null
  offsetX: number
  startX: number
  isSwiping: boolean
}

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
    createSession,
  } = useAppStore()
  const { theme, setTheme } = useTheme()
  
  const newMessageButtonRef = useRef<HTMLButtonElement>(null)
  const [searchMode, setSearchMode] = useState<'conversations' | 'users'>('conversations')
  const [userSearchResults, setUserSearchResults] = useState<User[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    sessionId: null
  })
  
  // Swipe state
  const [swipeState, setSwipeState] = useState<SwipeState>({
    sessionId: null,
    offsetX: 0,
    startX: 0,
    isSwiping: false
  })

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      sessionId
    })
  }

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, sessionId: null })
  }

  // Handle context menu actions
  const handleContextAction = (action: string) => {
    console.log(`Action: ${action} for session: ${contextMenu.sessionId}`)
    // These are UI placeholders - functionality can be added later
    closeContextMenu()
  }

  // Touch handlers for swipe
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>, sessionId: string) => {
    setSwipeState({
      sessionId,
      startX: e.touches[0].clientX,
      offsetX: 0,
      isSwiping: true
    })
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>, sessionId: string) => {
    if (!swipeState.isSwiping || swipeState.sessionId !== sessionId) return
    
    const currentX = e.touches[0].clientX
    const diff = currentX - swipeState.startX
    
    // Limit swipe distance
    const maxSwipe = 80
    const clampedOffset = Math.max(-maxSwipe, Math.min(maxSwipe, diff))
    
    setSwipeState(prev => ({
      ...prev,
      offsetX: clampedOffset
    }))
  }

  const handleTouchEnd = (sessionId: string) => {
    // If swiped enough, trigger action
    if (Math.abs(swipeState.offsetX) > 60) {
      if (swipeState.offsetX < 0) {
        console.log('Mark as unread:', sessionId)
      } else {
        console.log('Archive:', sessionId)
      }
    }
    
    // Reset swipe state
    setSwipeState({
      sessionId: null,
      offsetX: 0,
      startX: 0,
      isSwiping: false
    })
  }

  // Mouse handlers for swipe (desktop support)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, sessionId: string) => {
    // Prevent if clicking on the more button
    if ((e.target as HTMLElement).closest('button')) return
    
    setSwipeState({
      sessionId,
      startX: e.clientX,
      offsetX: 0,
      isSwiping: true
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, sessionId: string) => {
    if (!swipeState.isSwiping || swipeState.sessionId !== sessionId) return
    
    const diff = e.clientX - swipeState.startX
    
    // Limit swipe distance
    const maxSwipe = 80
    const clampedOffset = Math.max(-maxSwipe, Math.min(maxSwipe, diff))
    
    setSwipeState(prev => ({
      ...prev,
      offsetX: clampedOffset
    }))
  }

  const handleMouseUp = (sessionId: string) => {
    if (!swipeState.isSwiping) return
    
    // If swiped enough, trigger action
    if (Math.abs(swipeState.offsetX) > 60) {
      if (swipeState.offsetX < 0) {
        console.log('Mark as unread:', sessionId)
      } else {
        console.log('Archive:', sessionId)
      }
    }
    
    // Reset swipe state
    setSwipeState({
      sessionId: null,
      offsetX: 0,
      startX: 0,
      isSwiping: false
    })
  }

  const handleMouseLeave = () => {
    if (swipeState.isSwiping) {
      setSwipeState({
        sessionId: null,
        offsetX: 0,
        startX: 0,
        isSwiping: false
      })
    }
  }

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => closeContextMenu()
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu.visible])

  // Keyboard support for swipe actions on selected session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only work when a session is selected and no modal/context menu is open
      if (!selectedSessionId || contextMenu.visible) return
      
      // Arrow Left = swipe left (Unread)
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setSwipeState({
          sessionId: selectedSessionId,
          offsetX: -80,
          startX: 0,
          isSwiping: false
        })
        
        // Auto-reset after animation
        setTimeout(() => {
          console.log('Mark as unread:', selectedSessionId)
          setSwipeState({
            sessionId: null,
            offsetX: 0,
            startX: 0,
            isSwiping: false
          })
        }, 800)
      }
      
      // Arrow Right = swipe right (Archive)
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setSwipeState({
          sessionId: selectedSessionId,
          offsetX: 80,
          startX: 0,
          isSwiping: false
        })
        
        // Auto-reset after animation
        setTimeout(() => {
          console.log('Archive:', selectedSessionId)
          setSwipeState({
            sessionId: null,
            offsetX: 0,
            startX: 0,
            isSwiping: false
          })
        }, 800)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedSessionId, contextMenu.visible])

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

  // Search for users when in user search mode
  useEffect(() => {
    if (searchMode === 'users' && searchQuery.trim().length > 0) {
      // Debounce the search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearchingUsers(true)
        try {
          console.log('Searching for users:', searchQuery)
          const results = await usersApi.search(searchQuery)
          console.log('Search results:', results)
          // Filter out current user from results - backend returns array directly
          const userList = Array.isArray(results) ? results : (results.users || [])
          const filtered = userList.filter(
            (u: User) => u.id !== currentUser?.id
          )
          console.log('Filtered results:', filtered)
          setUserSearchResults(filtered)
        } catch (error) {
          console.error('User search failed:', error)
          setUserSearchResults([])
        } finally {
          setIsSearchingUsers(false)
        }
      }, 300)
    } else if (searchMode === 'users') {
      setUserSearchResults([])
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, searchMode, currentUser?.id])

  // Handle starting a conversation with a user
  const handleStartConversation = async (userId: string) => {
    try {
      await createSession([userId])
      setSearchQuery('')
      setSearchMode('conversations')
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

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
              placeholder={searchMode === 'users' ? "Search users..." : "Search conversations..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('')
                  setUserSearchResults([])
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={() => {
              setSearchMode(searchMode === 'conversations' ? 'users' : 'conversations')
              setSearchQuery('')
              setUserSearchResults([])
            }}
            className={`px-3 py-2 border rounded-lg transition-colors flex items-center gap-1 ${
              searchMode === 'users' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-input border-input hover:bg-muted'
            }`}
            title={searchMode === 'users' ? 'Search conversations' : 'Search users'}
          >
            <UserPlus size={18} />
          </button>
        </div>
        
        {/* Search Mode Indicator */}
        {searchMode === 'users' && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <UserPlus size={12} />
            <span>Searching for users to start a conversation</span>
          </div>
        )}
      </div>

      {/* User Search Results */}
      {searchMode === 'users' && (
        <div className="flex-1 overflow-y-auto">
          {isSearchingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6 text-primary" />
            </div>
          ) : searchQuery.trim() === '' ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <UserPlus size={32} className="mb-2 opacity-50" />
              <p>Type to search for users</p>
            </div>
          ) : userSearchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p>No users found</p>
            </div>
          ) : (
            userSearchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => handleStartConversation(user.id)}
                className="px-4 py-3 border-b border-border cursor-pointer hover:bg-[#F3F3EE] dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.displayName || user.username || 'U').slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {user.displayName || user.username}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    @{user.username || user.email?.split('@')[0]}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${user.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Conversation List */}
      {searchMode === 'conversations' && (
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
            const isSwipingThis = swipeState.sessionId === session.id
            const swipeOffset = isSwipingThis ? swipeState.offsetX : 0
            
            return (
              <div
                key={session.id}
                className="relative overflow-hidden"
              >
                {/* Swipe Action Buttons (background) */}
                <div className="absolute inset-0 flex">
                  {/* Archive button (swipe right reveals this on left) */}
                  <div 
                    className={`flex items-center justify-center bg-emerald-500 text-white transition-all ${
                      swipeOffset > 30 ? 'w-20' : 'w-0'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Archive size={20} />
                      <span className="text-xs">Archive</span>
                    </div>
                  </div>
                  
                  <div className="flex-1" />
                  
                  {/* Unread button (swipe left reveals this on right) */}
                  <div 
                    className={`flex items-center justify-center bg-emerald-500 text-white transition-all ${
                      swipeOffset < -30 ? 'w-20' : 'w-0'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <MailOpen size={20} />
                      <span className="text-xs">Unread</span>
                    </div>
                  </div>
                </div>

                {/* Session Item (foreground) */}
                <div
                  onClick={() => !swipeState.isSwiping && selectSession(session.id)}
                  onContextMenu={(e) => handleContextMenu(e, session.id)}
                  onTouchStart={(e) => handleTouchStart(e, session.id)}
                  onTouchMove={(e) => handleTouchMove(e, session.id)}
                  onTouchEnd={() => handleTouchEnd(session.id)}
                  onMouseDown={(e) => handleMouseDown(e, session.id)}
                  onMouseMove={(e) => handleMouseMove(e, session.id)}
                  onMouseUp={() => handleMouseUp(session.id)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    transform: `translateX(${swipeOffset}px)`,
                    transition: swipeState.isSwiping ? 'none' : 'transform 0.3s ease-out',
                    userSelect: 'none'
                  }}
                  className={`px-4 py-3 border-b border-border cursor-pointer hover:bg-[#F3F3EE] dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 ${
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
                        handleContextMenu(e as unknown as React.MouseEvent, session.id)
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeContextMenu}
          />
          <div 
            className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 w-56"
            style={{ 
              left: contextMenu.x, 
              top: contextMenu.y,
              transform: 'translate(-50%, 0)'
            }}
          >
            <button 
              onClick={() => handleContextAction('unread')}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <MailOpen size={18} />
              Mark as unread
            </button>
            <button 
              onClick={() => handleContextAction('archive')}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <Archive size={18} />
              Archive
            </button>
            <button 
              onClick={() => handleContextAction('mute')}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <BellOff size={18} />
              Mute
            </button>
            
            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
            
            <button 
              onClick={() => handleContextAction('contact-info')}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <Info size={18} />
              Contact info
            </button>
            <button 
              onClick={() => handleContextAction('export')}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <Download size={18} />
              Export chat
            </button>
            
            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
            
            <button 
              onClick={() => handleContextAction('clear')}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-red-500"
            >
              <Trash2 size={18} />
              Clear chat
            </button>
            <button 
              onClick={() => handleContextAction('delete')}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-red-500"
            >
              <Trash2 size={18} />
              Delete chat
            </button>
          </div>
        </>
      )}
    </div>
  )
}