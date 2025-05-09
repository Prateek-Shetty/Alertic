"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  CloudSun,
  CloudRain,
  Cloud,
  Sun,
  Wind,
  Droplets,
  CloudLightning,
  CloudSnow,
  CloudFog,
  MapPin,
  Globe,
  Compass,
  RefreshCw,
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { motion } from "framer-motion"
import { GoogleGenAI } from "@google/genai"

// Define types for our weather data
interface WeatherData {
  location: string
  country: string
  currentTemp: number
  condition: string
  feelsLike: number
  humidity: number
  windSpeed: number
  uvIndex: number
  precipitation: number
  hourlyForecast: HourlyForecast[]
  dailyForecast: DailyForecast[]
}

interface HourlyForecast {
  time: string
  temp: number
  condition: string
  precipitation: number
  windSpeed: number
}

interface DailyForecast {
  day: string
  date: string
  highTemp: number
  lowTemp: number
  condition: string
  precipitation: number
  humidity: number
  windSpeed: number
  uvIndex: number
}

interface Location {
  name: string
  region: string
  country: string
  lat: number
  lon: number
}

// List of available locations
const availableLocations: Location[] = [
  { name: "New York", region: "New York", country: "USA", lat: 40.7128, lon: -74.006 },
  { name: "London", region: "England", country: "UK", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", region: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", region: "New South Wales", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Paris", region: "Île-de-France", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Berlin", region: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
  { name: "Mumbai", region: "Maharashtra", country: "India", lat: 19.076, lon: 72.8777 },
  { name: "Rio de Janeiro", region: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729 },
  { name: "Cairo", region: "Cairo Governorate", country: "Egypt", lat: 30.0444, lon: 31.2357 },
  { name: "Moscow", region: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173 },
  { name: "Toronto", region: "Ontario", country: "Canada", lat: 43.6532, lon: -79.3832 },
  { name: "Beijing", region: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
  { name: "Cape Town", region: "Western Cape", country: "South Africa", lat: -33.9249, lon: 18.4241 },
  { name: "Mexico City", region: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
  { name: "Singapore", region: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Rome", region: "Lazio", country: "Italy", lat: 41.9028, lon: 12.4964 },
  { name: "Bangkok", region: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Dubai", region: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
  { name: "Istanbul", region: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784 },
  { name: "Seoul", region: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.978 },
  { name: "Amsterdam", region: "North Holland", country: "Netherlands", lat: 52.3676, lon: 4.9041 },
  { name: "Stockholm", region: "Stockholm County", country: "Sweden", lat: 59.3293, lon: 18.0686 },
  { name: "Buenos Aires", region: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816 },
  { name: "Vienna", region: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738 },
  { name: "Auckland", region: "Auckland", country: "New Zealand", lat: -36.8509, lon: 174.7645 },
]

// Function to generate realistic weather data based on location
const generateWeatherData = (location: Location): WeatherData => {
  // Base temperature varies by latitude (rough approximation)
  const baseTemp = Math.round(30 - Math.abs(location.lat) * 0.5)

  // Seasonal adjustment (northern/southern hemisphere)
  const isNorthernHemisphere = location.lat > 0
  const currentMonth = new Date().getMonth() // 0-11
  const seasonalAdjustment = isNorthernHemisphere
    ? Math.sin((currentMonth / 12) * 2 * Math.PI) * 10
    : Math.sin(((currentMonth + 6) / 12) * 2 * Math.PI) * 10

  // Adjust base temperature by season
  const adjustedBaseTemp = baseTemp + seasonalAdjustment

  // Random daily variation
  const currentTemp = Math.round(adjustedBaseTemp + (Math.random() * 6 - 3))

  // Determine condition based on temperature and random factors
  let condition
  const rainChance = Math.random()
  if (currentTemp > 30) {
    condition = "Sunny"
  } else if (currentTemp > 20) {
    condition = rainChance > 0.8 ? "Light Rain" : "Partly Cloudy"
  } else if (currentTemp > 10) {
    condition = rainChance > 0.6 ? "Rainy" : "Cloudy"
  } else {
    condition = rainChance > 0.7 ? "Snow" : "Overcast"
  }

  // Generate hourly forecast
  const hourlyForecast: HourlyForecast[] = []
  const currentHour = new Date().getHours()

  for (let i = 0; i < 24; i++) {
    const hour = (currentHour + i) % 24
    const timeString = `${hour}:00`

    // Temperature varies throughout the day
    const hourlyVariation = Math.sin(((hour - 14) / 24) * 2 * Math.PI) * 5
    const hourlyTemp = Math.round(currentTemp + hourlyVariation)

    // Conditions can change throughout the day
    const hourlyCondition = getHourlyCondition(hour, condition, rainChance)

    hourlyForecast.push({
      time: timeString,
      temp: hourlyTemp,
      condition: hourlyCondition,
      precipitation: Math.round(rainChance * 100) / 10,
      windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10,
    })
  }

  // Generate daily forecast for 7 days
  const dailyForecast: DailyForecast[] = []
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const currentDay = new Date().getDay()

  for (let i = 0; i < 7; i++) {
    const dayIndex = (currentDay + i) % 7
    const day = days[dayIndex]

    const date = new Date()
    date.setDate(date.getDate() + i)
    const dateString = `${date.getMonth() + 1}/${date.getDate()}`

    // Temperature varies slightly day by day
    const dailyVariation = Math.random() * 6 - 3
    const highTemp = Math.round(currentTemp + dailyVariation + 3)
    const lowTemp = Math.round(currentTemp + dailyVariation - 5)

    // Conditions can change day by day
    const dailyRainChance = Math.random()
    const dailyCondition = getDailyCondition(highTemp, dailyRainChance)

    dailyForecast.push({
      day,
      date: dateString,
      highTemp,
      lowTemp,
      condition: dailyCondition,
      precipitation: Math.round(dailyRainChance * 100) / 10,
      humidity: Math.round(40 + dailyRainChance * 40),
      windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10,
      uvIndex: Math.round((10 - dailyRainChance * 8) * 10) / 10,
    })
  }

  return {
    location: location.name,
    country: location.country,
    currentTemp,
    condition,
    feelsLike: Math.round(currentTemp - (Math.random() * 4 - 2)),
    humidity: Math.round(40 + rainChance * 40),
    windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10,
    uvIndex: Math.round((10 - rainChance * 8) * 10) / 10,
    precipitation: Math.round(rainChance * 100) / 10,
    hourlyForecast,
    dailyForecast,
  }
}

// Helper function to get hourly condition
const getHourlyCondition = (hour: number, baseCondition: string, rainChance: number): string => {
  // Night hours tend to be clearer
  if (hour >= 20 || hour <= 5) {
    return rainChance > 0.8 ? "Light Rain" : "Clear"
  }

  // Morning and evening transitions
  if ((hour >= 6 && hour <= 8) || (hour >= 17 && hour <= 19)) {
    return rainChance > 0.7 ? "Light Rain" : "Partly Cloudy"
  }

  // Daytime - use base condition with some variation
  return baseCondition
}

// Helper function to get daily condition
const getDailyCondition = (temp: number, rainChance: number): string => {
  if (temp > 30) {
    return rainChance > 0.8 ? "Thunderstorms" : "Sunny"
  } else if (temp > 20) {
    return rainChance > 0.7 ? "Light Rain" : "Partly Cloudy"
  } else if (temp > 10) {
    return rainChance > 0.6 ? "Rainy" : "Cloudy"
  } else if (temp > 0) {
    return rainChance > 0.6 ? "Snow" : "Overcast"
  } else {
    return "Snow"
  }
}

// Helper function to get weather icon based on condition
const getWeatherIcon = (condition: string, size = 24) => {
  const props = { size, className: "mr-2" }

  switch (condition.toLowerCase()) {
    case "sunny":
    case "clear":
      return <Sun {...props} className="mr-2 text-yellow-500" />
    case "partly cloudy":
      return <CloudSun {...props} className="mr-2 text-blue-400" />
    case "cloudy":
    case "overcast":
      return <Cloud {...props} className="mr-2 text-gray-400" />
    case "light rain":
      return <CloudRain {...props} className="mr-2 text-blue-300" />
    case "rainy":
      return <CloudRain {...props} className="mr-2 text-blue-500" />
    case "thunderstorms":
      return <CloudLightning {...props} className="mr-2 text-purple-500" />
    case "snow":
      return <CloudSnow {...props} className="mr-2 text-blue-200" />
    case "foggy":
    case "mist":
      return <CloudFog {...props} className="mr-2 text-gray-300" />
    default:
      return <CloudSun {...props} className="mr-2 text-blue-400" />
  }
}

// Get background gradient based on condition and time
const getWeatherBackground = (condition: string, hour: number = new Date().getHours()) => {
  const isNight = hour >= 19 || hour <= 5

  if (isNight) {
    return "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900"
  }

  switch (condition.toLowerCase()) {
    case "sunny":
    case "clear":
      return "bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300"
    case "partly cloudy":
      return "bg-gradient-to-br from-blue-600 via-blue-400 to-gray-300"
    case "cloudy":
    case "overcast":
      return "bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500"
    case "light rain":
    case "rainy":
      return "bg-gradient-to-br from-gray-800 via-blue-700 to-gray-600"
    case "thunderstorms":
      return "bg-gradient-to-br from-gray-900 via-purple-800 to-gray-700"
    case "snow":
      return "bg-gradient-to-br from-gray-300 via-blue-100 to-white"
    default:
      return "bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400"
  }
}

// Get text color based on condition
const getWeatherTextColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case "snow":
      return "text-gray-800"
    default:
      return "text-white"
  }
}

// Main component
export default function WeatherForecast() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location>(availableLocations[0])
  const [aiGenerating, setAiGenerating] = useState(false)
  const [customLocation, setCustomLocation] = useState<Location | null>(null)
  const [activeTab, setActiveTab] = useState("daily")
  const [selectedHourlyDay, setSelectedHourlyDay] = useState(0)

  // Function to generate weather data with AI (using Gemini)
  const generateAIWeatherData = useCallback(async (location: Location) => {
    setAiGenerating(true)
    setLoading(true)

    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || "AIzaSyD_3T15tOy3CUHoGKRhXVsUtQZQe-Q68k0",
      })

      // Create a prompt for Gemini to generate weather data
      const prompt = `Generate a detailed 7-day weather forecast for ${location.name}, ${location.country} (latitude: ${location.lat}, longitude: ${location.lon}).
      
      Consider the current season, typical climate patterns for this region, and geographic features.
      
      Format your response as a JSON object with this structure:
      {
        "location": "${location.name}",
        "country": "${location.country}",
        "currentTemp": [current temperature in Celsius],
        "condition": [current weather condition: Sunny, Partly Cloudy, Cloudy, Light Rain, Rainy, Thunderstorms, Snow, or Overcast],
        "feelsLike": [feels like temperature],
        "humidity": [humidity percentage],
        "windSpeed": [wind speed in km/h],
        "uvIndex": [UV index from 1-11],
        "precipitation": [precipitation in mm],
        "hourlyForecast": [
          {
            "time": [hour in 24h format],
            "temp": [temperature],
            "condition": [weather condition],
            "precipitation": [precipitation in mm],
            "windSpeed": [wind speed in km/h]
          },
          ... 24 hours
        ],
        "dailyForecast": [
          {
            "day": [day of week],
            "date": [date in MM/DD format],
            "highTemp": [high temperature],
            "lowTemp": [low temperature],
            "condition": [weather condition],
            "precipitation": [precipitation chance in percentage],
            "humidity": [humidity percentage],
            "windSpeed": [wind speed in km/h],
            "uvIndex": [UV index]
          },
          ... 7 days
        ]
      }
      
      Return ONLY the JSON object, no explanations or other text.`

      // Call Gemini API
      const model = genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      })

      const response = await model
      const responseText = response?.text || ""

      // Extract JSON from response
      let weatherData
      try {
        // Find JSON in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          weatherData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error("No valid JSON found in response")
        }
      } catch (jsonError) {
        console.error("Error parsing JSON from Gemini response:", jsonError)
        throw new Error("Failed to parse weather data")
      }

      // Validate and process the data
      if (!weatherData || !weatherData.dailyForecast || !weatherData.hourlyForecast) {
        throw new Error("Invalid weather data format")
      }

      setWeatherData(weatherData)
      return weatherData
    } catch (error) {
      console.error("Error generating AI weather data:", error)
      // Fallback to algorithmic generation
      const data = generateWeatherData(location)
      setWeatherData(data)
      return data
    } finally {
      setAiGenerating(false)
      setLoading(false)
    }
  }, [])

  // Initialize with default location
  useEffect(() => {
    generateAIWeatherData(selectedLocation)
  }, [selectedLocation, generateAIWeatherData])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const query = searchQuery.toLowerCase()
    const results = availableLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(query) ||
        location.country.toLowerCase().includes(query) ||
        location.region.toLowerCase().includes(query),
    )

    setSearchResults(results)
    setShowSearchResults(true)
  }, [searchQuery])

  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setSearchQuery("")
    setShowSearchResults(false)
    setLoading(true)
    generateAIWeatherData(location)
  }

  // Handle custom location search
  const handleCustomLocationSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      // Use a geocoding API to get coordinates for the location
      // For demo purposes, we'll create a mock location
      const customLoc: Location = {
        name: searchQuery,
        region: "Custom Region",
        country: "Unknown",
        lat: Math.random() * 180 - 90, // Random latitude between -90 and 90
        lon: Math.random() * 360 - 180, // Random longitude between -180 and 180
      }

      setCustomLocation(customLoc)
      setSelectedLocation(customLoc)
      setSearchQuery("")
      setShowSearchResults(false)
      setLoading(true)
      generateAIWeatherData(customLoc)
    } catch (error) {
      console.error("Error searching for custom location:", error)
    }
  }

  // Format temperature with degree symbol
  const formatTemp = (temp: number) => `${temp}°C`

  // Get hourly forecast for selected day
  const getHourlyForecastForDay = (dayIndex: number) => {
    if (!weatherData?.hourlyForecast) return []

    // For simplicity, we'll just return a subset of the hourly forecast
    const startHour = (dayIndex * 24) % weatherData.hourlyForecast.length
    return weatherData.hourlyForecast.slice(startHour, startHour + 24)
  }

  return (
    <div className="space-y-6">
      {/* Weather Background */}
      {weatherData && (
        <div className={`fixed inset-0 -z-10 opacity-20 ${getWeatherBackground(weatherData.condition)}`}></div>
      )}

      {/* Search Bar */}
      <Card className="bg-black/60 border-white/10 overflow-visible">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Search Any Location
          </CardTitle>
          <CardDescription>Enter a city name to get AI-generated weather predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search for any location in the world..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCustomLocationSearch()
                    }
                  }}
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-black border border-gray-700 shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {searchResults.map((location, index) => (
                        <motion.li
                          key={index}
                          className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                          onClick={() => handleLocationSelect(location)}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="font-medium">{location.name}</div>
                          <div className="text-xs text-gray-400">
                            {location.region}, {location.country}
                          </div>
                        </motion.li>
                      ))}
                      <li className="px-4 py-2 hover:bg-blue-900 cursor-pointer border-t border-gray-700">
                        <div className="font-medium text-blue-400">Search for "{searchQuery}"</div>
                        <div className="text-xs text-gray-400">Try to find this location using AI</div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <Button onClick={handleCustomLocationSearch} className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                onClick={() => {
                  setLoading(true)
                  generateAIWeatherData(selectedLocation)
                }}
                variant="outline"
                className="bg-purple-900/30 text-purple-300 border-purple-700 hover:bg-purple-800/50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Popular Locations</h3>
            <div className="flex flex-wrap gap-2">
              {availableLocations.slice(0, 8).map((location) => (
                <Badge
                  key={location.name}
                  variant={selectedLocation.name === location.name ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedLocation.name === location.name ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-800"
                  }`}
                  onClick={() => handleLocationSelect(location)}
                >
                  {location.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Weather */}
      <Card
        className={`border-white/10 overflow-hidden ${
          weatherData
            ? `${getWeatherBackground(weatherData.condition)} ${getWeatherTextColor(weatherData.condition)}`
            : "bg-black/60"
        }`}
      >
        <CardHeader className="pb-2 backdrop-blur-sm bg-black/30">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center">
                {loading ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  <>
                    <MapPin className="h-5 w-5 mr-2 text-red-400" />
                    {weatherData?.location}
                  </>
                )}
              </CardTitle>
              <CardDescription className={weatherData ? getWeatherTextColor(weatherData.condition) : ""}>
                {loading ? <Skeleton className="h-4 w-24 mt-1" /> : weatherData?.country}
              </CardDescription>
            </div>
            {aiGenerating && (
              <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="mr-1"
                >
                  <RefreshCw className="h-3 w-3" />
                </motion.div>
                AI Generating
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="backdrop-blur-sm bg-black/20">
          {loading ? (
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-16 w-32" />
              <div className="flex space-x-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mr-4"
                >
                  {getWeatherIcon(weatherData?.condition || "", 64)}
                </motion.div>
                <div>
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl font-bold"
                  >
                    {formatTemp(weatherData?.currentTemp || 0)}
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-xl"
                  >
                    {weatherData?.condition}
                  </motion.div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm opacity-80">Feels Like</div>
                  <div className="text-2xl font-semibold">{formatTemp(weatherData?.feelsLike || 0)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/20 p-4 rounded-lg">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center"
                >
                  <Droplets className="h-6 w-6 mr-3 text-blue-400" />
                  <div>
                    <div className="text-sm opacity-80">Humidity</div>
                    <div className="text-lg font-medium">{weatherData?.humidity}%</div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex items-center"
                >
                  <Wind className="h-6 w-6 mr-3 text-teal-400" />
                  <div>
                    <div className="text-sm opacity-80">Wind</div>
                    <div className="text-lg font-medium">{weatherData?.windSpeed} km/h</div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex items-center"
                >
                  <CloudRain className="h-6 w-6 mr-3 text-blue-500" />
                  <div>
                    <div className="text-sm opacity-80">Precipitation</div>
                    <div className="text-lg font-medium">{weatherData?.precipitation} mm</div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="flex items-center"
                >
                  <Sun className="h-6 w-6 mr-3 text-yellow-500" />
                  <div>
                    <div className="text-sm opacity-80">UV Index</div>
                    <div className="text-lg font-medium">{weatherData?.uvIndex}</div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Forecast Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="daily" className="data-[state=active]:bg-blue-600">
            7-Day Forecast
          </TabsTrigger>
          <TabsTrigger value="hourly" className="data-[state=active]:bg-blue-600">
            Hourly Forecast
          </TabsTrigger>
        </TabsList>

        {/* Daily Forecast */}
        <TabsContent value="daily">
          <Card className="bg-black/60 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-500" />
                7-Day Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {weatherData?.dailyForecast.map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index === 0 ? "bg-blue-900/30 border border-blue-800" : "hover:bg-gray-800/50"
                        }`}
                        onClick={() => {
                          setSelectedHourlyDay(index)
                          setActiveTab("hourly")
                        }}
                      >
                        <div className="w-24">
                          <div className="font-medium">{day.day}</div>
                          <div className="text-xs text-gray-400">{day.date}</div>
                        </div>
                        <div className="flex items-center">
                          {getWeatherIcon(day.condition)}
                          <span>{day.condition}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-blue-400">{formatTemp(day.lowTemp)}</div>
                          <div className="font-medium">{formatTemp(day.highTemp)}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Temperature Chart */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Temperature Trend</h3>
                    <div className="h-64 bg-black/30 p-4 rounded-lg">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={weatherData?.dailyForecast}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="day" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#111", borderColor: "#333" }}
                            formatter={(value) => [`${value}°C`]}
                          />
                          <Area
                            type="monotone"
                            dataKey="highTemp"
                            stroke="#f97316"
                            fill="rgba(249, 115, 22, 0.2)"
                            name="High"
                            activeDot={{ r: 8 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="lowTemp"
                            stroke="#3b82f6"
                            fill="rgba(59, 130, 246, 0.2)"
                            name="Low"
                            activeDot={{ r: 6 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hourly Forecast */}
        <TabsContent value="hourly">
          <Card className="bg-black/60 border-white/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Hourly Forecast - {weatherData?.dailyForecast[selectedHourlyDay]?.day || "Today"}</CardTitle>
                <div className="flex gap-2">
                  {weatherData?.dailyForecast.slice(0, 3).map((day, index) => (
                    <Badge
                      key={index}
                      variant={selectedHourlyDay === index ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedHourlyDay === index ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-800"
                      }`}
                      onClick={() => setSelectedHourlyDay(index)}
                    >
                      {day.day}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <>
                  {/* Hourly Temperature Chart */}
                  <div className="h-64 mb-6 bg-black/30 p-4 rounded-lg">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={getHourlyForecastForDay(selectedHourlyDay)}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="time" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#111", borderColor: "#333" }}
                          formatter={(value, name) => [
                            name === "temp" ? `${value}°C` : name === "precipitation" ? `${value} mm` : `${value} km/h`,
                            name === "temp" ? "Temperature" : name === "precipitation" ? "Precipitation" : "Wind Speed",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="temp"
                          stroke="#f97316"
                          fill="rgba(249, 115, 22, 0.2)"
                          name="temp"
                          activeDot={{ r: 8 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Precipitation Chart */}
                  <div className="h-64 mb-6 bg-black/30 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Precipitation</h3>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart
                        data={getHourlyForecastForDay(selectedHourlyDay)}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="time" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#111", borderColor: "#333" }}
                          formatter={(value) => [`${value} mm`, "Precipitation"]}
                        />
                        <Bar dataKey="precipitation" fill="#3b82f6" name="precipitation" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Hourly Details */}
                  <div className="overflow-x-auto bg-black/30 p-4 rounded-lg">
                    <div className="inline-flex space-x-4 min-w-full pb-4">
                      {getHourlyForecastForDay(selectedHourlyDay).map((hour, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex flex-col items-center p-3 rounded-lg bg-gray-800/30 min-w-[90px] hover:bg-gray-700/30 transition-colors"
                        >
                          <div className="text-sm font-medium">{hour.time}</div>
                          {getWeatherIcon(hour.condition, 28)}
                          <div className="font-medium text-lg">{formatTemp(hour.temp)}</div>
                          <div className="text-xs text-blue-400 flex items-center mt-1">
                            <Droplets className="h-3 w-3 mr-1" />
                            {hour.precipitation} mm
                          </div>
                          <div className="text-xs text-teal-400 flex items-center mt-1">
                            <Wind className="h-3 w-3 mr-1" />
                            {hour.windSpeed} km/h
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
