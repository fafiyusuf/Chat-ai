"use client"

import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/lib/store"
import { Info, Mic, MoreVertical, Paperclip, Phone, Search, Send, Smile, Video } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function ChatInterface() {
  const { user } = useAuth()
  const { 
    sessions,
    selectedSessionId, 
    messages, 
    isLoadingMessages,
    sendMessage: sendMessageAction, 
    toggleInfoPanel,
    currentUser,
  } = useAppStore()
  
  const [messageInput, setMessageInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get current session
  const selectedSession = sessions.find(s => s.id === selectedSessionId)

  // Get display info for the chat header
  const getHeaderInfo = () => {
    if (!selectedSession) return { name: "", avatar: null, status: "" }
    
    if (selectedSession.isGroup) {
      return {
        name: selectedSession.name || "Group Chat",
        avatar: null,
        status: `${selectedSession.users.length} members`,
      }
    }
    
    const otherUser = selectedSession.users.find(
      (u: { userId: string; user: any }) => u.userId !== currentUser?.id
    )
    
    return {
      name: otherUser?.user?.displayName || otherUser?.user?.username || "Unknown",
      avatar: otherUser?.user?.avatarUrl || null,
      status: otherUser?.user?.status === "ONLINE" ? "Online" : "Offline",
    }
  }

  const headerInfo = getHeaderInfo()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!selectedSession) {
    return (
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
        <p className="text-muted-foreground">Select a conversation to start messaging</p>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (messageInput.trim() && !isSending) {
      setIsSending(true)
      try {
        await sendMessageAction(messageInput)
        setMessageInput("")
      } catch (error) {
        console.error("Failed to send message:", error)
      } finally {
        setIsSending(false)
      }
    }
  }

  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Check if message is from current user
  const isOwnMessage = (senderId: string) => {
    return senderId === currentUser?.id || senderId === user?.id
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl flex flex-col shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between">
        <button 
          onClick={toggleInfoPanel}
          className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -ml-2 transition-colors"
        >
          {headerInfo.avatar ? (
            <img
              src={headerInfo.avatar}
              alt={headerInfo.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {headerInfo.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="text-left">
            <h2 className="font-semibold text-foreground">{headerInfo.name}</h2>
            <p className={`text-xs ${headerInfo.status === "Online" ? "text-green-500" : "text-muted-foreground"}`}>
              {headerInfo.status}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground">
            <Search size={20} />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground">
            <Video size={20} />
          </button>
          <button 
            onClick={toggleInfoPanel}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <Info size={20} />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area - Inner box with light green background */}
      <div className="flex-1 overflow-hidden mx-4 mb-4">
        <div className="h-full bg-[#F3F3EE] dark:bg-emerald-950/20 rounded-2xl overflow-y-auto p-6 space-y-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {/* Today divider */}
              <div className="flex items-center justify-center">
                <span className="px-4 py-1 bg-white dark:bg-gray-800 rounded-full text-xs text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700">
                  Today
                </span>
              </div>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${isOwnMessage(message.senderId) ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col max-w-[70%]">
                    {!isOwnMessage(message.senderId) && (
                      <div className="flex items-end gap-2">
                        <div
                          className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-800 text-foreground shadow-sm"
                        >
                          {!isOwnMessage(message.senderId) && selectedSession.isGroup && (
                            <p className="text-xs font-semibold mb-1 opacity-70">
                              {message.sender?.displayName || "Unknown"}
                            </p>
                          )}
                          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    )}
                    {isOwnMessage(message.senderId) && (
                      <div className="flex items-end gap-2 justify-end">
                        <div
                          className="px-4 py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-gray-800 dark:text-gray-100 shadow-sm"
                        >
                          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    )}
                    <p className={`text-xs mt-1 text-gray-400 ${isOwnMessage(message.senderId) ? "text-right" : "text-left"}`}>
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 bg-[#F3F3EE] dark:bg-gray-700 rounded-xl px-4 py-2">
          <input
            type="text"
            placeholder="Type any message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={isSending}
            className="flex-1 bg-transparent text-foreground placeholder-gray-400 focus:outline-none disabled:opacity-50 text-sm"
          />
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-500">
            <Mic size={18} />
          </button>
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-500">
            <Smile size={18} />
          </button>
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-500">
            <Paperclip size={18} />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
