"use client"

import { Archive, BellOff, Circle, Info, Trash2, Upload, XCircle } from "lucide-react"

// Simplified context menu - functionality can be added as needed
// For now, this is a placeholder that doesn't break the app

interface ContextMenuProps {
  isOpen?: boolean
  position?: { x: number; y: number }
  sessionId?: string
  onClose?: () => void
}

export function ContextMenu({ isOpen = false, position = { x: 0, y: 0 }, sessionId, onClose }: ContextMenuProps) {
  // If no props are passed, this component won't render
  // This allows backward compatibility with existing code that imports it
  
  if (!isOpen) return null

  const handleAction = (action: string) => {
    console.log(`Action: ${action} for session: ${sessionId}`)
    // TODO: Implement actions with backend API
    onClose?.()
  }

  return (
    <>
      {/* Click outside to close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Context Menu */}
      <div
        className="fixed bg-card border border-border rounded-lg shadow-lg z-50 py-2 w-48"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <button
          onClick={() => handleAction("mark-unread")}
          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2 text-foreground"
        >
          <Circle size={16} />
          Mark as unread
        </button>
        <button
          onClick={() => handleAction("archive")}
          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2 text-foreground"
        >
          <Archive size={16} />
          Archive
        </button>
        <button
          onClick={() => handleAction("mute")}
          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2 text-foreground"
        >
          <BellOff size={16} />
          Mute
        </button>
        <button
          onClick={() => handleAction("info")}
          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2 text-foreground"
        >
          <Info size={16} />
          Contact info
        </button>
        <button
          onClick={() => handleAction("export")}
          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2 text-foreground"
        >
          <Upload size={16} />
          Export chat
        </button>
        <button
          onClick={() => handleAction("clear")}
          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2 text-foreground"
        >
          <XCircle size={16} />
          Clear chat
        </button>
        <div className="border-t border-border my-2" />
        <button
          onClick={() => handleAction("delete")}
          className="w-full text-left px-4 py-2 hover:bg-destructive/10 transition-colors flex items-center gap-2 text-destructive"
        >
          <Trash2 size={16} />
          Delete chat
        </button>
      </div>
    </>
  )
}
