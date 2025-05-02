"use client"

import { useEffect, useState, useRef } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { AlertTriangle, FileText } from "lucide-react"

interface AlertData {
  id: number
  type: string
  severity: string
  description: string
  lat: number
  lon: number
  timestamp: string
}

interface ReportData {
  id: number
  user_id: number
  description: string
  lat: number
  lon: number
  category: string
  image_url?: string
  timestamp: string
}

interface MapComponentProps {
  alerts: AlertData[]
  reports: ReportData[]
}

// Custom alert icon
const alertIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Custom report icon
const reportIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function MapComponent({ alerts, reports }: MapComponentProps) {
  // Default center position (can be adjusted based on user location or data)
  const [center, setCenter] = useState<[number, number]>([40.7128, -74.006])
  const leafletInitialized = useRef(false)

  // Fix for Leaflet marker icons in Next.js
  useEffect(() => {
    if (!leafletInitialized.current) {
      delete (L.Icon.Default.prototype as any)._getIconUrl

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })
      leafletInitialized.current = true
    }
  }, [])

  // Adjust center based on alerts if available
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      setCenter([alerts[0].lat, alerts[0].lon])
    }
  }, [alerts])

  return (
    <MapContainer center={center} zoom={10} style={{ height: "70vh", width: "100%", borderRadius: "0.5rem" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render Alert Markers */}
      {alerts.map((alert) => (
        <Marker key={`alert-${alert.id}`} position={[alert.lat, alert.lon]} icon={alertIcon}>
          <Popup>
            <div className="p-1">
              <div className="flex items-center gap-1 font-bold text-red-600 mb-1">
                <AlertTriangle className="h-4 w-4" />
                {alert.type} Alert - {alert.severity}
              </div>
              <p className="text-sm mb-1">{alert.description}</p>
              <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render Report Markers */}
      {reports.map((report) => (
        <Marker key={`report-${report.id}`} position={[report.lat, report.lon]} icon={reportIcon}>
          <Popup>
            <div className="p-1">
              <div className="flex items-center gap-1 font-bold text-blue-600 mb-1">
                <FileText className="h-4 w-4" />
                Community Report: {report.category}
              </div>
              <p className="text-sm mb-1">{report.description}</p>
              {report.image_url && (
                <img
                  src={report.image_url || "/placeholder.svg"}
                  alt="Report image"
                  className="w-full h-20 object-cover rounded my-1"
                />
              )}
              <p className="text-xs text-gray-500">{new Date(report.timestamp).toLocaleString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
