"use client"

import { useState, useEffect } from "react"
import  Sidebar  from "@/components/sidebar"
import { ChatbotButton } from "@/components/chatbot-button"
import { ChatbotModal } from "@/components/chatbot-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, Flame, Droplets, Wind } from "lucide-react"

interface AlertData {
  id: number
  type: string
  severity: string
  description: string
  lat: number
  lon: number
  timestamp: string
}

export default function AlertsPage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // In a real app, this would be an actual API call to your Flask backend
        const response = await fetch("http://localhost:5000/alerts")

        if (!response.ok) {
          throw new Error("Failed to fetch alerts")
        }

        const data = await response.json()
        setAlerts(data)
      } catch (err) {
        console.error("Error fetching alerts:", err)
        setError("Failed to load alerts. Please try again later.")

        // For demo purposes, set some sample data
        setAlerts([
          {
            id: 1,
            type: "Flood",
            severity: "High",
            description: "Flash flooding in downtown area. Multiple streets closed. Avoid downtown if possible.",
            lat: 40.7128,
            lon: -74.006,
            timestamp: new Date().toISOString(),
          },
          {
            id: 2,
            type: "Wildfire",
            severity: "Extreme",
            description:
              "Rapidly spreading wildfire near residential areas. Evacuation orders in place for zones A, B, and C.",
            lat: 34.0522,
            lon: -118.2437,
            timestamp: new Date().toISOString(),
          },
          {
            id: 3,
            type: "Hurricane",
            severity: "High",
            description:
              "Hurricane approaching coastline. Expected landfall in 24 hours. Prepare for strong winds and heavy rainfall.",
            lat: 25.7617,
            lon: -80.1918,
            timestamp: new Date().toISOString(),
          },
          {
            id: 4,
            type: "Tornado",
            severity: "Medium",
            description: "Tornado warning in effect until 8:00 PM. Seek shelter immediately if in the affected area.",
            lat: 41.8781,
            lon: -87.6298,
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen)
  }

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "flood":
        return <Droplets className="h-5 w-5 text-blue-500" />
      case "wildfire":
        return <Flame className="h-5 w-5 text-orange-500" />
      case "hurricane":
      case "tornado":
        return <Wind className="h-5 w-5 text-teal-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

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
        <h1 className="text-3xl font-bold mb-6">Active Alerts</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  alert.severity === "Extreme"
                    ? "border-l-red-600"
                    : alert.severity === "High"
                      ? "border-l-orange-600"
                      : "border-l-yellow-600"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <CardTitle>{alert.type} Alert</CardTitle>
                    </div>
                    <Badge
                      variant={
                        alert.severity === "Extreme" ? "destructive" : alert.severity === "High" ? "default" : "outline"
                      }
                    >
                      {alert.severity} Severity
                    </Badge>
                  </div>
                  <CardDescription>Issued: {new Date(alert.timestamp).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{alert.description}</p>
                  <div className="mt-2 text-sm text-gray-400">
                    Location: {alert.lat.toFixed(4)}, {alert.lon.toFixed(4)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p>There are no active alerts in your area at this time.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
