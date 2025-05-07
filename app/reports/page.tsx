"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import { ChatbotButton } from "@/components/chatbot-button"
import { ChatbotModal } from "@/components/chatbot-modal"
import { ReportForm } from "@/components/report-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Define TypeScript types for reports
interface Report {
  description: string
  category: string
  latitude: number
  longitude: number
  image?: string
  details?: string
  createdAt: string
}

export default function ReportsPage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen)
  }

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/get_reports")
        const data = await response.json()
        setReports(data.reports || [])
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  return (
    <main className="flex min-h-screen relative bg-black">
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
            <CardHeader>
              <CardTitle>Submit a New Report</CardTitle>
              <CardDescription>
                Help your community by reporting disasters, hazards, or emergency situations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportForm />
            </CardContent>
          </TabsContent>

          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>Recent Community Reports</CardTitle>
                <CardDescription>View recent reports submitted by community members</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading reports...</p>
                ) : reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report, index) => (
                      <div key={index} className="p-4 border border-gray-800 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{report.description}</h3>
                            <p className="text-sm text-gray-400">{report.category}</p>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm mb-2">{report.details}</p>
                        <div className="flex items-center text-xs text-gray-400">
                          <span className="mr-2">Location:</span>
                          <span>{report.latitude}, {report.longitude}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No reports available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}