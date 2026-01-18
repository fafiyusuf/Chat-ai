"use client"

import { aiApi } from "@/lib/api"
import { Loader2, Plus, Send, Sparkles, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface AIMessage {
  id: string
  role: "USER" | "ASSISTANT"
  content: string
  createdAt: string
}

interface AISession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  _count?: { messages: number }
}

export function AIChatPage() {
  const [sessions, setSessions] = useState<AISession[]>([])
  const [selectedSession, setSelectedSession] = useState<AISession | null>(null)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id)
    }
  }, [selectedSession])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const data = await aiApi.getSessions()
      setSessions(data)
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0])
      }
    } catch (error) {
      console.error("Failed to load AI sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (sessionId: string) => {
    try {
      const data = await aiApi.getMessages(sessionId)
      setMessages(data)
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const createSession = async () => {
    try {
      const session = await aiApi.createSession("New AI Chat")
      setSessions([session, ...sessions])
      setSelectedSession(session)
      setMessages([])
    } catch (error) {
      console.error("Failed to create session:", error)
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await aiApi.deleteSession(sessionId)
      setSessions(sessions.filter((s) => s.id !== sessionId))
      if (selectedSession?.id === sessionId) {
        setSelectedSession(sessions[0] || null)
        setMessages([])
      }
    } catch (error) {
      console.error("Failed to delete session:", error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !selectedSession || isSending) return

    const content = input.trim()
    setInput("")
    setIsSending(true)

    // Optimistically add user message
    const tempUserMsg: AIMessage = {
      id: `temp-${Date.now()}`,
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages([...messages, tempUserMsg])

    try {
      const response = await aiApi.sendMessage(selectedSession.id, content)
      // Replace temp message and add AI response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        response.userMessage,
        response.aiMessage,
      ])
    } catch (error) {
      console.error("Failed to send message:", error)
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex-1 flex gap-2">
      {/* Sessions Sidebar */}
      <div className="w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              AI Chat
            </h2>
            <button
              onClick={createSession}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="New Chat"
            >
              <Plus size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p className="mb-2">No conversations yet</p>
              <button
                onClick={createSession}
                className="text-emerald-600 hover:text-emerald-700"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors group ${
                  selectedSession?.id === session.id ? "bg-emerald-50" : ""
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 text-sm truncate flex-1">
                    {session.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {session._count?.messages || 0} messages
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {selectedSession ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Start a conversation
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Ask me anything! I'm powered by Google Gemini.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "USER" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.role === "USER"
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span className="text-gray-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={isSending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isSending}
                  className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to AI Chat
              </h2>
              <p className="text-gray-500 mb-6">
                Chat with AI powered by Google Gemini
              </p>
              <button
                onClick={createSession}
                className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
