"use client"

import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatbotButtonProps {
  onClick: () => void
}

export function ChatbotButton({ onClick }: ChatbotButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="rounded-full w-12 h-12 p-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-glow"
      aria-label="Open AI Assistant"
    >
      <Bot className="h-5 w-5" />
    </Button>
  )
}
