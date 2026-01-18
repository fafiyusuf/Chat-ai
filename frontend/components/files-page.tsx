"use client"

import { FileText } from "lucide-react"

export function FilesPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileText size={40} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Files</h1>
        <p className="text-muted-foreground">Coming soon</p>
      </div>
    </div>
  )
}
