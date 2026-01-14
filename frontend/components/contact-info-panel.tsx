"use client"

import { useAppStore } from "@/lib/store"
import { FileText, Image, Link as LinkIcon, Phone, Video, X } from "lucide-react"
import { useState } from "react"

// File type icon component matching Figma design
function FileIcon({ type }: { type: string }) {
  const baseClasses = "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase"
  
  switch (type) {
    case 'pdf':
      return (
        <div className={`${baseClasses} bg-red-500 text-white`}>
          PDF
        </div>
      )
    case 'fig':
      return (
        <div className={`${baseClasses} bg-purple-500 text-white`}>
          FIG
        </div>
      )
    case 'ai':
      return (
        <div className={`${baseClasses} bg-orange-500 text-white`}>
          AI
        </div>
      )
    default:
      return (
        <div className={`${baseClasses} bg-gray-400 text-white`}>
          <FileText size={18} />
        </div>
      )
  }
}

export function ContactInfoPanel() {
  const { selectedContactInfo, toggleInfoPanel, isInfoPanelOpen, sessions, selectedSessionId, currentUser } = useAppStore()
  const [activeTab, setActiveTab] = useState<"Media" | "Link" | "Docs">("Docs")

  if (!isInfoPanelOpen) return null

  // Get the selected session to extract user info
  const selectedSession = sessions.find(s => s.id === selectedSessionId)
  
  // Get the other user from the session
  const otherUser = selectedSession?.users?.find(
    (u: { userId: string; user: any }) => u.userId !== currentUser?.id
  )

  const contactInfo = otherUser?.user || selectedContactInfo

  if (!contactInfo) return null

  // Mock documents for demo - matching Figma design
  const todayDocuments = [
    {
      name: "Document Requirement.pdf",
      pages: "10 pages",
      size: "16 MB",
      type: "pdf",
    },
    {
      name: "User Flow.pdf",
      pages: "7 pages",
      size: "32 MB",
      type: "pdf",
    },
    {
      name: "Existing App.fig",
      pages: "",
      size: "213 MB",
      type: "fig",
    },
  ]

  const mayDocuments = [
    {
      name: "Product Illustrations.ai",
      pages: "",
      size: "22 MB",
      type: "ai",
    },
    {
      name: "Quotation-Hikanworks-May.pdf",
      pages: "7 pages",
      size: "520 KB",
      type: "pdf",
    }
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50" 
        onClick={toggleInfoPanel}
      />
      
      {/* Modal - matching Figma: white bg, subtle shadow, rounded corners */}
      <div className="fixed right-4 top-4 bottom-4 w-[320px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header - clean with just title and close */}
        <div className="px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Contact Info</h3>
          <button 
            onClick={toggleInfoPanel} 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Section - centered with avatar, name, email, status */}
        <div className="px-5 py-6 text-center">
          {contactInfo.avatarUrl ? (
            <img
              src={contactInfo.avatarUrl}
              alt={('displayName' in contactInfo ? contactInfo.displayName : contactInfo.name) || contactInfo.username}
              className="w-20 h-20 rounded-full mx-auto mb-3 object-cover ring-4 ring-gray-100 dark:ring-gray-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-4 ring-gray-50 dark:ring-gray-600">
              <span className="text-gray-500 dark:text-gray-400 text-2xl font-semibold">
                {(('displayName' in contactInfo ? contactInfo.displayName : contactInfo.name) || contactInfo.username || "U").slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{('displayName' in contactInfo ? contactInfo.displayName : contactInfo.name) || contactInfo.username}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{contactInfo.email}</p>
          {contactInfo.username && (
            <p className="text-sm text-gray-400 dark:text-gray-500">@{contactInfo.username}</p>
          )}
          <p className={`text-sm mt-1 font-medium ${
            contactInfo.status === "ONLINE" 
              ? "text-emerald-500" 
              : contactInfo.status === "AWAY" 
                ? "text-yellow-500"
                : "text-gray-400"
          }`}>
            {contactInfo.status === "ONLINE" 
              ? "Online" 
              : contactInfo.status === "AWAY"
                ? "Away"
                : "Offline"}
          </p>

          {/* Action Buttons - matching Figma with outlined style */}
          <div className="flex gap-3 mt-5">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium">
              <Phone size={16} />
              Audio
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium">
              <Video size={16} />
              Video
            </button>
          </div>
        </div>

        {/* Tabs - matching Figma with underline indicator */}
        <div className="px-5 flex gap-6 border-b border-gray-100 dark:border-gray-700">
          {["Media", "Link", "Docs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "Media" | "Link" | "Docs")}
              className={`text-sm font-medium pb-3 transition-colors relative ${
                activeTab === tab
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/30">
          {activeTab === "Link" && (
            <div className="p-6">
              <div className="text-center text-gray-400 py-8">
                <LinkIcon size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No shared links yet</p>
              </div>
            </div>
          )}

          {activeTab === "Media" && (
            <div className="p-6">
              <div className="text-center text-gray-400 py-8">
                <Image size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No shared media yet</p>
              </div>
            </div>
          )}

          {activeTab === "Docs" && (
            <div>
              {/* Today Section Header */}
              <div className="px-5 py-2.5 bg-gray-100/80 dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Today</p>
              </div>
              {/* Today Documents */}
              <div className="bg-white dark:bg-gray-800">
                {todayDocuments.map((doc, idx) => (
                  <div key={idx} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <FileIcon type={doc.type} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.pages && `${doc.pages} • `}{doc.size} • {doc.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* May Section Header */}
              <div className="px-5 py-2.5 bg-gray-100/80 dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">May</p>
              </div>
              {/* May Documents */}
              <div className="bg-white dark:bg-gray-800">
                {mayDocuments.map((doc, idx) => (
                  <div key={idx} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <FileIcon type={doc.type} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.pages && `${doc.pages} • `}{doc.size} • {doc.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map/Contact Details Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Map</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Joined</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {('createdAt' in contactInfo && contactInfo.createdAt)
                ? new Date(contactInfo.createdAt).toLocaleDateString() 
                : ('joinedDate' in contactInfo ? new Date(contactInfo.joinedDate).toLocaleDateString() : 'Recently')}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
