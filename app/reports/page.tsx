"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import { ChatbotButton } from "@/components/chatbot-button"
import { ChatbotModal } from "@/components/chatbot-modal"
import { ReportForm } from "@/components/report-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"

export default function ReportsPage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen)
  }

  return (
    <BackgroundBeamsWithCollision
      beamColor1="rgba(76, 29, 149, 0.15)"
      beamColor2="rgba(59, 130, 246, 0.15)"
      beamColor3="rgba(16, 185, 129, 0.15)"
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
          <h1 className="text-3xl font-bold mb-6">Community Reporting</h1>

          <Tabs defaultValue="submit" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="submit">Submit Report</TabsTrigger>
              <TabsTrigger value="view">View Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="submit">
              <Card className="bg-black/60 border-white/10">
                <CardHeader>
                  <CardTitle>Submit a New Report</CardTitle>
                  <CardDescription>
                    Help your community by reporting disasters, hazards, or emergency situations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="view">
              <Card className="bg-black/60 border-white/10">
                <CardHeader>
                  <CardTitle>Recent Community Reports</CardTitle>
                  <CardDescription>View recent reports submitted by community members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* This would be populated from the API in a real app */}
                    <div className="p-4 border border-gray-800 rounded-lg bg-black/40">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">Road Blocked by Fallen Trees</h3>
                          <p className="text-sm text-gray-400">Infrastructure</p>
                        </div>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <p className="text-sm mb-2">
                        Multiple trees down blocking Main Street after the storm. No power lines affected.
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <span className="mr-2">Location:</span>
                        <span>40.7282, -73.9942</span>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-800 rounded-lg bg-black/40">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">Power Outage</h3>
                          <p className="text-sm text-gray-400">Utility</p>
                        </div>
                        <span className="text-xs text-gray-500">5 hours ago</span>
                      </div>
                      <p className="text-sm mb-2">
                        Entire neighborhood without power after lightning strike. Utility company has been notified.
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <span className="mr-2">Location:</span>
                        <span>34.0622, -118.2537</span>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-800 rounded-lg bg-black/40">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">Flash Flooding</h3>
                          <p className="text-sm text-gray-400">Weather</p>
                        </div>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                      <p className="text-sm mb-2">
                        Flash flooding in downtown area. Water level rising quickly. Several cars stranded.
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <span className="mr-2">Location:</span>
                        <span>40.7128, -74.0060</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </BackgroundBeamsWithCollision>
  )
}
