"use client"

import { AIChatPage } from "@/components/ai-chat-page"
import { CallsPage } from "@/components/calls-page"
import { ChatInterface } from "@/components/chat-interface"
import { ContactInfoPanel } from "@/components/contact-info-panel"
import { ContextMenu } from "@/components/context-menu"
import { FilesPage } from "@/components/files-page"
import { HomePage } from "@/components/home-page"
import { MessageList } from "@/components/message-list"
import { Modals } from "@/components/modals"
import { ProfilePage } from "@/components/profile-page"
import { SettingsPage } from "@/components/settings-page"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { useSocket } from "@/hooks/use-socket"
import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/lib/store"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { activePage, selectedSessionId } = useAppStore()
  
  // Initialize socket for real-time updates
  useSocket()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect will happen via useEffect
  if (!isAuthenticated) {
    return null
  }

  const renderContent = () => {
    switch (activePage) {
      case "calls":
        return <CallsPage />
      case "files":
        return <FilesPage />
      case "settings":
        return <SettingsPage />
      case "profile":
        return <ProfilePage />
      case "ai-chat":
        return <AIChatPage />
      case "home":
      default:
        // Home page shows message list + chat interface
        return (
          <>
            <MessageList />
            {selectedSessionId ? (
              <>
                <ChatInterface />
                <ContactInfoPanel />
              </>
            ) : (
              <HomePage />
            )}
          </>
        )
    }
  }

  return (
    <div className="h-screen flex bg-[#F3F3EE] dark:bg-gray-900 p-2 gap-2">
      {/* Sidebar on the left */}
      <Sidebar />
      
      {/* Main content area with navbar on top */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        <TopNavbar />
        <div className="flex-1 flex overflow-hidden gap-2">
          {renderContent()}
        </div>
      </div>

      <Modals />
      <ContextMenu />
    </div>
  )
}
