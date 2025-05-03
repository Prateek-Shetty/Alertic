"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/SpotlightCard"
import { cn } from "@/lib/utils"

interface ChatbotModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI emergency assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate API call to chatbot endpoint
    setTimeout(() => {
      // In a real app, this would be a fetch to your Flask backend
      // const response = await fetch("http://localhost:5000/chatbot?query=" + encodeURIComponent(input));
      // const data = await response.json();

      // For demo purposes, generate some responses based on keywords
      let botResponse =
        "I'm sorry, I don't have information about that. Would you like me to connect you with emergency services?"

      const lowerInput = input.toLowerCase()
      if (lowerInput.includes("flood")) {
        botResponse =
          "For flood safety: Move to higher ground immediately. Do not walk, swim, or drive through flood waters. Stay off bridges over fast-moving water. Would you like more specific advice?"
      } else if (lowerInput.includes("fire") || lowerInput.includes("wildfire")) {
        botResponse =
          "For wildfire safety: If advised to evacuate, do so immediately. If trapped, call 911. Close all doors and windows, and turn off gas, power, and water if time allows. Would you like more specific advice?"
      } else if (lowerInput.includes("hurricane")) {
        botResponse =
          "For hurricane safety: Evacuate if told to do so. Otherwise, stay indoors away from windows. Prepare an emergency kit with food, water, and medications. Would you like more specific advice?"
      } else if (lowerInput.includes("earthquake")) {
        botResponse =
          "For earthquake safety: Drop, cover, and hold on. If indoors, stay away from windows. If outdoors, move away from buildings and utility wires. Would you like more specific advice?"
      } else if (lowerInput.includes("help") || lowerInput.includes("emergency")) {
        botResponse =
          "If you're experiencing an emergency, please call 911 immediately. Would you like me to provide information about a specific type of emergency?"
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove as any)
      document.addEventListener("mouseup", handleMouseUp)
    } else {
      document.removeEventListener("mousemove", handleMouseMove as any)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  if (!isOpen) return null

  return (
    <div className="fixed z-50 w-96 h-[500px] shadow-xl" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
      <Card className="flex flex-col h-full border border-white/10 bg-black/90 backdrop-blur-lg overflow-hidden">
        <div
          className="p-3 bg-gradient-to-r from-purple-900 to-blue-900 flex justify-between items-center cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-400 animate-pulse" />
            <h3 className="font-semibold text-white">AI Emergency Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-white",
                )}
              >
                <p>{message.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-3 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for emergency help..."
              className="bg-gray-900 border-gray-700"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
