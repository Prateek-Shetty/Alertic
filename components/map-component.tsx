"use client"

import { useEffect, useState, useRef } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { AlertTriangle, FileText } from "lucide-react"
import axios from "axios"

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
  user_id?: number
  description: string
  lat: number
  lon: number
  latitude?: number
  longitude?: number
  category: string
  reportType?: string
  image_url?: string
  timestamp?: string
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

// Custom report icons based on type
const localWeatherIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const disasterReportIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Category-specific icons
const fireIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const floodIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const infrastructureIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const medicalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Get icon based on category
const getCategoryIcon = (category: string) => {
  const lowerCategory = category.toLowerCase()
  if (lowerCategory.includes("fire")) return fireIcon
  if (lowerCategory.includes("flood") || lowerCategory.includes("water") || lowerCategory.includes("weather"))
    return floodIcon
  if (lowerCategory.includes("infrastructure") || lowerCategory.includes("utility")) return infrastructureIcon
  if (lowerCategory.includes("medical")) return medicalIcon
  return localWeatherIcon
}

// Get circle color based on category
const getCategoryColor = (category: string): string => {
  const lowerCategory = category.toLowerCase()
  if (lowerCategory.includes("fire")) return "#ff8c00" // Dark Orange
  if (lowerCategory.includes("flood") || lowerCategory.includes("water")) return "#1e90ff" // Dodger Blue
  if (lowerCategory.includes("weather")) return "#4169e1" // Royal Blue
  if (lowerCategory.includes("infrastructure") || lowerCategory.includes("utility")) return "#708090" // Slate Gray
  if (lowerCategory.includes("medical")) return "#2e8b57" // Sea Green
  return "#9370db" // Medium Purple (default)
}

// Get circle radius based on severity or report type
const getCircleRadius = (severity: string | undefined, reportType: string | undefined): number => {
  if (severity === "Extreme") return 1500
  if (severity === "High" || reportType === "Disaster") return 1000
  if (severity === "Medium") return 700
  return 500 // Low severity or Localised Weather
}

// Get pulse effect class based on severity
const getPulseEffect = (severity: string | undefined, reportType: string | undefined): string => {
  if (severity === "Extreme" || reportType === "Disaster") return "map-pulse-fast"
  if (severity === "High") return "map-pulse-medium"
  return "map-pulse-slow"
}

export default function MapComponent({ alerts, reports }: MapComponentProps) {
  // Default center position (can be adjusted based on user location or data)
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]) // Default center set to India
  const [fetchedReports, setFetchedReports] = useState<ReportData[]>([])
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

  // Fetch reports from API
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/get_reports")
      .then((response) => {
        setFetchedReports(response.data.reports)
      })
      .catch((error) => {
        console.error("Error fetching reports:", error)
      })
  }, [])

  // Adjust center based on alerts if available
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      setCenter([alerts[0].lat, alerts[0].lon])
    }
  }, [alerts])

  // Add CSS for pulse effect
  useEffect(() => {
    // Add CSS for pulse effect if it doesn't exist
    if (!document.getElementById("map-pulse-css")) {
      const style = document.createElement("style")
      style.id = "map-pulse-css"
      style.innerHTML = `
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 0.3; }
          100% { opacity: 0.7; }
        }
        .map-pulse-fast {
          animation: pulse 1s infinite;
        }
        .map-pulse-medium {
          animation: pulse 2s infinite;
        }
        .map-pulse-slow {
          animation: pulse 3s infinite;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return (
    <MapContainer center={center} zoom={10} style={{ height: "70vh", width: "100%", borderRadius: "0.5rem" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render Alert Markers with Circles */}
      {alerts.map((alert) => (
        <div key={`alert-${alert.id}`}>
          {/* Outer effect circle */}
          <Circle
            center={[alert.lat, alert.lon]}
            radius={getCircleRadius(alert.severity, undefined)}
            pathOptions={{
              color: getCategoryColor(alert.type),
              fillColor: getCategoryColor(alert.type),
              fillOpacity: 0.2,
              weight: 1,
              className: getPulseEffect(alert.severity, undefined),
            }}
          />

          {/* Inner circle */}
          <CircleMarker
            center={[alert.lat, alert.lon]}
            radius={10}
            pathOptions={{
              color: getCategoryColor(alert.type),
              fillColor: getCategoryColor(alert.type),
              fillOpacity: 0.6,
              weight: 2,
            }}
          />

          {/* Marker with popup */}
          <Marker position={[alert.lat, alert.lon]} icon={alertIcon}>
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
        </div>
      ))}

      {/* Render Report Markers with Circles */}
      {reports.map((report) => {
        // Handle different data structures
        const lat = report.lat || report.latitude
        const lon = report.lon || report.longitude
        const isDisaster = report.reportType === "Disaster"
        const categoryIcon = getCategoryIcon(report.category)
        const categoryColor = getCategoryColor(report.category)

        return (
          <div key={`report-${report.id}`}>
            {/* Effect circle */}
            <Circle
              center={[lat ?? 0, lon ?? 0]}
              radius={getCircleRadius(undefined, report.reportType)}
              pathOptions={{
                color: categoryColor,
                fillColor: categoryColor,
                fillOpacity: 0.15,
                weight: 1,
                className: getPulseEffect(undefined, report.reportType),
              }}
            />

            {/* Marker with popup */}
            <Marker position={[lat ?? 0, lon ?? 0]} icon={categoryIcon}>
              <Popup>
                <div className="p-1">
                  <div
                    className={`flex items-center gap-1 font-bold mb-1 ${isDisaster ? "text-red-600" : "text-blue-600"}`}
                  >
                    <FileText className="h-4 w-4" />
                    Community Report: {report.category}
                    {report.reportType && (
                      <span
                        className={`text-xs px-1 py-0.5 rounded ${isDisaster ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
                      >
                        {report.reportType}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-1">{report.description}</p>
                  {report.image_url && (
                    <img
                      src={report.image_url || "/placeholder.svg"}
                      alt="Report image"
                      className="w-full h-20 object-cover rounded my-1"
                    />
                  )}
                  <p className="text-xs text-gray-500">
                    {report.timestamp ? new Date(report.timestamp).toLocaleString() : "Recent report"}
                  </p>
                </div>
              </Popup>
            </Marker>
          </div>
        )
      })}

      {/* Render Fetched Report Markers with Circles */}
      {fetchedReports.map((report) => {
        const categoryColor = getCategoryColor(report.category || "Other")

        return (
          <div key={`fetched-report-${report.id}`}>
            {/* Effect circle */}
            <Circle
              center={[report.latitude ?? 0, report.longitude ?? 0]}
              radius={500}
              pathOptions={{
                color: categoryColor,
                fillColor: categoryColor,
                fillOpacity: 0.15,
                weight: 1,
                className: "map-pulse-slow",
              }}
            />

            {/* Marker with popup */}
            <Marker
              position={[report.latitude ?? 0, report.longitude ?? 0]}
              icon={getCategoryIcon(report.category || "Other")}
            >
              <Popup>
                <div className="p-1">
                  <div className="flex items-center gap-1 font-bold mb-1 text-blue-600">
                    <FileText className="h-4 w-4" />
                    Community Report: {report.category}
                  </div>
                  <p className="text-sm mb-1">{report.description}</p>
                </div>
              </Popup>
            </Marker>
          </div>
        )
      })}
    </MapContainer>
  )
}
