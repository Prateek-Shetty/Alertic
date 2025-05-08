"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import { ChatbotButton } from "@/components/chatbot-button"
import { ChatbotModal } from "@/components/chatbot-modal"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"
import WeatherForecast from "@/components/weather-forecast"

export default function WeatherPage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen)
  }

  return (
    <BackgroundBeamsWithCollision
      beamColor1="rgba(59, 130, 246, 0.15)"
      beamColor2="rgba(16, 185, 129, 0.15)"
      beamColor3="rgba(139, 92, 246, 0.15)"
    >
      <main className="flex min-h-screen relative bg-black/50 backdrop-blur-sm">
        {/* Chatbot Button */}
        <div className="absolute top-6 left-6 z-50">
          <ChatbotButton onClick={toggleChatbot} />
        </div>

        {/* Chatbot Modal */}
        {isChatbotOpen && <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />}

        {/* Sidebar Navigation */}
        <div className="absolute right-0 top-0 h-full z-40">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 ml-0 mr-16">
          <h1 className="text-3xl font-bold mb-6">Weather Prediction</h1>
          <WeatherForecast />
        </div>
      </main>
    </BackgroundBeamsWithCollision>
  )
}
