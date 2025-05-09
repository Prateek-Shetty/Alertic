"use client"

import { useState } from "react"
import { CloudSun } from "lucide-react" // Ensure this is the correct library or path for CloudSun
import { motion } from "framer-motion"
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
      <main className="flex min-h-screen relative backdrop-blur-sm z-10">
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <CloudSun className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">AI Weather Prediction</h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 mb-6 max-w-3xl"
          >
            Get AI-powered weather forecasts for any location in the world. Our system uses advanced AI to analyze
            climate patterns and provide accurate predictions.
          </motion.p>

          <WeatherForecast />
        </div>
      </main>
    </BackgroundBeamsWithCollision>
  )
}
