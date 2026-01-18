"use client"

import { useAppStore } from "@/lib/store"
import { MessageCircle } from "lucide-react"
import Image from "next/image"

export function HomePage() {
  const { openModal } = useAppStore()

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm gap-8">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Image src="/logo.svg" alt="Chat AI" width={40} height={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Chat AI</h1>
        <p className="text-muted-foreground mb-8">Select a conversation or start a new one</p>
        <button
          onClick={() => openModal("newMessage")}
          className="px-6 py-3 bg-[#1E9A80] text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          New Message
        </button>
      </div>
    </div>
  )
}
