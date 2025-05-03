"use client"

import { useEffect, useRef, useState } from "react"
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatbotButtonProps {
  onClick: () => void
}

export function ChatbotButton({ onClick }: ChatbotButtonProps) {
  const ballRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 20, y: 80 }) // initial position
  const [dragging, setDragging] = useState(false)
  const offset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return
      const newX = e.clientX - offset.current.x
      const newY = e.clientY - offset.current.y
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setDragging(false)
      snapToEdge()
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = ballRef.current?.getBoundingClientRect()
    if (rect) {
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
      setDragging(true)
    }
  }

  const snapToEdge = () => {
    if (!ballRef.current) return
    const { innerWidth, innerHeight } = window
    const ball = ballRef.current
    const rect = ball.getBoundingClientRect()

    const margin = 20
    const closestX =
      rect.left + rect.width / 2 < innerWidth / 2
        ? margin
        : innerWidth - rect.width - margin

    let newY = rect.top
    if (newY < margin) newY = margin
    if (newY > innerHeight - rect.height - margin)
      newY = innerHeight - rect.height - margin

    setPosition({ x: closestX, y: newY })
  }

  return (
    <div
      ref={ballRef}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      className={cn(
        "fixed z-50 cursor-pointer transition-transform active:scale-95",
        "shadow-[0_0_20px_5px_rgba(128,0,255,0.6)] bg-gradient-to-br from-purple-700 to-indigo-600",
        "backdrop-blur-lg border border-white/20 rounded-full w-14 h-14 flex items-center justify-center",
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <Bot className="h-6 w-6 text-white" />
    </div>
  )
}
