"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  CalendarDays,
  MapPin,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

// Weather condition types
type WeatherCondition =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "rainy"
  | "heavy-rain"
  | "thunderstorm"
  | "snowy"
  | "foggy"

// Weather forecast data structure
interface WeatherData {
  date: string
  day: string
  condition: WeatherCondition
  tempHigh: number
  tempLow: number
  precipitation: number
  humidity: number
  windSpeed: number
  windDirection: string
  uvIndex: number
  hourlyForecast: {
    time: string
    temp: number
    condition: WeatherCondition
    precipitation: number
  }[]
}

// Location data structure
interface LocationData {
  name: string
  region: string
  country: string
  lat: number
  lon: number
  localTime: string
}

// Dummy data for weather forecasts
const dummyLocations: LocationData[] = [
  {
    name: "New York",
    region: "New York",
    country: "United States",
    lat: 40.7128,
    lon: -74.006,
    localTime: "2023-05-08 14:30",
  },
  {
    name: "London",
    region: "Greater London",
    country: "United Kingdom",
    lat: 51.5074,
    lon: -0.1278,
    localTime: "2023-05-08 19:30",
  },
  {
    name: "Tokyo",
    region: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lon: 139.6503,
    localTime: "2023-05-09 03:30",
  },
  {
    name: "Sydney",
    region: "New South Wales",
    country: "Australia",
    lat: -33.8688,
    lon: 151.2093,
    localTime: "2023-05-09 04:30",
  },
  {
    name: "Mumbai",
    region: "Maharashtra",
    country: "India",
    lat: 19.076,
    lon: 72.8777,
    localTime: "2023-05-09 00:00",
  },
]

// Generate dummy weather data for a location
const generateDummyWeatherData = (location: LocationData): WeatherData[] => {
  const conditions: WeatherCondition[] = [
    "sunny",
    "partly-cloudy",
    "cloudy",
    "rainy",
    "heavy-rain",
    "thunderstorm",
    "snowy",
    "foggy",
  ]

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const currentDate = new Date()

  return Array.from({ length: 7 }, (_, i) => {
    const forecastDate = new Date()
    forecastDate.setDate(currentDate.getDate() + i)
    const dayName = days[forecastDate.getDay()]
    const dateString = forecastDate.toISOString().split("T")[0]

    // Base temperature on latitude (colder toward poles)
    const baseTempHigh = Math.round(30 - Math.abs(location.lat) * 0.4)
    const baseTempLow = Math.round(baseTempHigh - 8 - Math.random() * 4)

    // Random condition with some weather patterns
    const conditionIndex = Math.floor(Math.random() * conditions.length)
    const condition = conditions[conditionIndex]

    // Precipitation based on condition
    let precipitation = 0
    if (condition === "rainy") precipitation = Math.round(Math.random() * 30 + 20)
    else if (condition === "heavy-rain") precipitation = Math.round(Math.random() * 40 + 50)
    else if (condition === "thunderstorm") precipitation = Math.round(Math.random() * 50 + 40)
    else if (condition === "snowy") precipitation = Math.round(Math.random() * 20 + 10)
    else if (condition === "partly-cloudy") precipitation = Math.round(Math.random() * 10)
    else if (condition === "cloudy") precipitation = Math.round(Math.random() * 20)

    // Generate hourly forecast
    const hourlyForecast = Array.from({ length: 24 }, (_, hour) => {
      // Temperature varies throughout the day
      let hourTemp
      if (hour >= 0 && hour < 6) {
        // Early morning (coldest)
        hourTemp = baseTempLow + Math.random() * 2
      } else if (hour >= 6 && hour < 12) {
        // Morning to noon (warming up)
        hourTemp = baseTempLow + (baseTempHigh - baseTempLow) * ((hour - 6) / 6) + Math.random() * 2
      } else if (hour >= 12 && hour < 18) {
        // Afternoon (warmest)
        hourTemp = baseTempHigh - ((hour - 12) / 6) * 2 + Math.random() * 2
      } else {
        // Evening (cooling down)
        hourTemp = baseTempLow + 4 - ((hour - 18) / 6) * 4 + Math.random() * 2
      }

      // Hourly condition might be different from daily
      const hourlyConditionIndex = Math.abs((conditionIndex + (hour % 3) - 1) % conditions.length)
      const hourlyCondition = conditions[hourlyConditionIndex]

      // Hourly precipitation
      let hourlyPrecipitation = 0
      if (hourlyCondition === "rainy") hourlyPrecipitation = Math.round(Math.random() * 3 + 1)
      else if (hourlyCondition === "heavy-rain") hourlyPrecipitation = Math.round(Math.random() * 5 + 3)
      else if (hourlyCondition === "thunderstorm") hourlyPrecipitation = Math.round(Math.random() * 7 + 5)
      else if (hourlyCondition === "snowy") hourlyPrecipitation = Math.round(Math.random() * 2 + 1)

      return {
        time: `${hour}:00`,
        temp: Math.round(hourTemp),
        condition: hourlyCondition,
        precipitation: hourlyPrecipitation,
      }
    })

    return {
      date: dateString,
      day: dayName,
      condition,
      tempHigh: baseTempHigh,
      tempLow: baseTempLow,
      precipitation,
      humidity: Math.round(Math.random() * 40 + 40),
      windSpeed: Math.round(Math.random() * 30 + 5),
      windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
      uvIndex: Math.round(Math.random() * 10 + 1),
      hourlyForecast,
    }
  })
}

// Get weather icon based on condition
const getWeatherIcon = (condition: WeatherCondition) => {
  switch (condition) {
    case "sunny":
      return <Sun className="h-8 w-8 text-yellow-500" />
    case "partly-cloudy":
      return (
        <div className="relative">
          <Sun className="h-8 w-8 text-yellow-500" />
          <Cloud className="h-6 w-6 text-gray-400 absolute -bottom-1 -right-1" />
        </div>
      )
    case "cloudy":
      return <Cloud className="h-8 w-8 text-gray-400" />
    case "rainy":
      return <CloudRain className="h-8 w-8 text-blue-400" />
    case "heavy-rain":
      return <CloudRain className="h-8 w-8 text-blue-600" />
    case "thunderstorm":
      return <CloudLightning className="h-8 w-8 text-purple-500" />
    case "snowy":
      return <CloudSnow className="h-8 w-8 text-blue-200" />
    case "foggy":
      return <CloudFog className="h-8 w-8 text-gray-300" />
    default:
      return <Cloud className="h-8 w-8 text-gray-400" />
  }
}

// Get condition text
const getConditionText = (condition: WeatherCondition): string => {
  switch (condition) {
    case "sunny":
      return "Sunny"
    case "partly-cloudy":
      return "Partly Cloudy"
    case "cloudy":
      return "Cloudy"
    case "rainy":
      return "Rainy"
    case "heavy-rain":
      return "Heavy Rain"
    case "thunderstorm":
      return "Thunderstorm"
    case "snowy":
      return "Snowy"
    case "foggy":
      return "Foggy"
    default:
      return "Unknown"
  }
}

// Get condition color
const getConditionColor = (condition: WeatherCondition): string => {
  switch (condition) {
    case "sunny":
      return "text-yellow-500"
    case "partly-cloudy":
      return "text-blue-300"
    case "cloudy":
      return "text-gray-400"
    case "rainy":
      return "text-blue-400"
    case "heavy-rain":
      return "text-blue-600"
    case "thunderstorm":
      return "text-purple-500"
    case "snowy":
      return "text-blue-200"
    case "foggy":
      return "text-gray-300"
    default:
      return "text-gray-400"
  }
}

// Get badge color based on temperature
const getTempBadgeColor = (temp: number): string => {
  if (temp >= 30) return "bg-red-500"
  if (temp >= 25) return "bg-orange-500"
  if (temp >= 20) return "bg-yellow-500"
  if (temp >= 15) return "bg-green-500"
  if (temp >= 10) return "bg-blue-400"
  if (temp >= 5) return "bg-blue-500"
  return "bg-blue-700"
}

export default function WeatherForecast() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(dummyLocations[0])
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDay, setSelectedDay] = useState(0)

  // Simulate API call to get weather data
  useEffect(() => {
    setLoading(true)

    // Simulate network delay
    const timer = setTimeout(() => {
      const data = generateDummyWeatherData(selectedLocation)
      setWeatherData(data)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [selectedLocation])

  // Handle location search
  const handleSearch = () => {
    if (!searchQuery) return

    const foundLocation = dummyLocations.find((loc) => loc.name.toLowerCase().includes(searchQuery.toLowerCase()))

    if (foundLocation) {
      setSelectedLocation(foundLocation)
      setSearchQuery("")
    }
  }

  // Prepare data for temperature chart
  const prepareTemperatureData = () => {
    if (!weatherData.length || !weatherData[selectedDay]) return []

    return weatherData[selectedDay].hourlyForecast.map((hour) => ({
      time: hour.time,
      temperature: hour.temp,
    }))
  }

  // Prepare data for precipitation chart
  const preparePrecipitationData = () => {
    if (!weatherData.length || !weatherData[selectedDay]) return []

    return weatherData[selectedDay].hourlyForecast.map((hour) => ({
      time: hour.time,
      precipitation: hour.precipitation,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Location search and selection */}
      <Card className="bg-black/60 border-white/10">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Weather Location
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border-gray-700"
            />
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {dummyLocations.map((location) => (
              <Button
                key={location.name}
                variant={selectedLocation.name === location.name ? "default" : "outline"}
                className={selectedLocation.name === location.name ? "bg-blue-600 hover:bg-blue-700" : ""}
                onClick={() => setSelectedLocation(location)}
              >
                {location.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current weather */}
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card className="bg-black/60 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">{selectedLocation.name}</CardTitle>
                <CardDescription>
                  {selectedLocation.region}, {selectedLocation.country}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Local Time</div>
                <div>{selectedLocation.localTime}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="text-6xl font-bold">{weatherData[0]?.tempHigh}°</div>
                <div className="text-center">
                  {getWeatherIcon(weatherData[0]?.condition)}
                  <div className={`mt-1 ${getConditionColor(weatherData[0]?.condition)}`}>
                    {getConditionText(weatherData[0]?.condition)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <span>High: {weatherData[0]?.tempHigh}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-blue-500" />
                  <span>Low: {weatherData[0]?.tempLow}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-400" />
                  <span>Humidity: {weatherData[0]?.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-blue-300" />
                  <span>Precipitation: {weatherData[0]?.precipitation}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-gray-400" />
                  <span>
                    Wind: {weatherData[0]?.windSpeed} km/h {weatherData[0]?.windDirection}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <span>UV Index: {weatherData[0]?.uvIndex}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-day forecast */}
      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <Card className="bg-black/60 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              7-Day Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {weatherData.map((day, index) => (
                <Card
                  key={day.date}
                  className={`bg-black/40 border-white/10 cursor-pointer transition-all hover:bg-black/60 ${
                    selectedDay === index ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedDay(index)}
                >
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium">{day.day}</CardTitle>
                    <CardDescription className="text-xs">{day.date}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-2 text-center">
                    {getWeatherIcon(day.condition)}
                    <div className="mt-2 flex justify-between text-sm">
                      <Badge className={getTempBadgeColor(day.tempHigh)}>{day.tempHigh}°</Badge>
                      <span className="text-gray-400">{day.tempLow}°</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hourly forecast */}
      {loading ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <Card className="bg-black/60 border-white/10">
          <CardHeader>
            <CardTitle>
              Hourly Forecast - {weatherData[selectedDay]?.day}, {weatherData[selectedDay]?.date}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="temperature" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="temperature">Temperature</TabsTrigger>
                <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
              </TabsList>

              <TabsContent value="temperature">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={prepareTemperatureData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="time" tick={{ fill: "#aaa" }} tickFormatter={(value) => value.split(":")[0]} />
                      <YAxis tick={{ fill: "#aaa" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111", borderColor: "#333" }}
                        labelStyle={{ color: "#fff" }}
                        formatter={(value) => [`${value}°C`, "Temperature"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ff4d4d"
                        fillOpacity={1}
                        fill="url(#tempGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="precipitation">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={preparePrecipitationData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="time" tick={{ fill: "#aaa" }} tickFormatter={(value) => value.split(":")[0]} />
                      <YAxis tick={{ fill: "#aaa" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111", borderColor: "#333" }}
                        labelStyle={{ color: "#fff" }}
                        formatter={(value) => [`${value}mm`, "Precipitation"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="precipitation"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#precipGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 overflow-x-auto">
              <div className="flex space-x-4 min-w-max">
                {weatherData[selectedDay]?.hourlyForecast.map((hour, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-gray-400">{hour.time}</div>
                    <div className="my-2">{getWeatherIcon(hour.condition)}</div>
                    <div className="font-medium">{hour.temp}°</div>
                    {hour.precipitation > 0 && (
                      <div className="flex items-center justify-center mt-1 text-xs text-blue-400">
                        <Droplets className="h-3 w-3 mr-1" />
                        {hour.precipitation}mm
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
