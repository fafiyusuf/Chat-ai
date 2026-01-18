"use client"

import { usersApi } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface User {
  id: string
  displayName: string | null
  username: string | null
  email: string
  avatarUrl: string | null
  status: string
}

interface ModalPosition {
  top?: number
  left?: number
  right?: number
}

export function Modals() {
  const { activeModal, closeModal, createSession, selectSession, fetchSessions, modalPosition } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeModal === "newMessage") {
      loadUsers()
    }
  }, [activeModal])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (error) {
      console.error("Failed to load users:", error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const name = user.displayName || user.username || user.email
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleSelectUser = async (user: User) => {
    setIsCreating(true)
    try {
      // Create a new chat session with this user
      const session = await createSession([user.id])
      if (session) {
        // Refresh sessions list and select the new session
        await fetchSessions()
        await selectSession(session.id)
      }
      closeModal()
      setSearchQuery("")
    } catch (error) {
      console.error("Failed to create chat:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "bg-emerald-500"
      case "AWAY":
        return "bg-yellow-500"
      case "BUSY":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  if (activeModal !== "newMessage") return null

  // Determine positioning style
  const getModalStyle = (): React.CSSProperties => {
    if (modalPosition) {
      return {
        position: 'fixed',
        top: modalPosition.top,
        left: modalPosition.left,
        right: modalPosition.right,
        bottom: modalPosition.bottom,
      }
    }
    return {}
  }

  const isPositioned = !!modalPosition

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50" 
        onClick={() => closeModal()}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        style={getModalStyle()}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-95 max-h-120 overflow-hidden z-50 ${
          isPositioned ? 'fixed' : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Message</h2>
            <button
              onClick={() => closeModal()}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="overflow-y-auto max-h-80">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {users.length === 0 ? "No users available" : "No users found"}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const displayName = user.displayName || user.username || user.email
              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  disabled={isCreating}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {/* Avatar with status indicator */}
                  <div className="relative">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                          {getInitials(displayName)}
                        </span>
                      </div>
                    )}
                    {/* Online status dot */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(user.status)}`} />
                  </div>
                  
                  {/* User info */}
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{displayName}</p>
                    {user.username && user.displayName && (
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
