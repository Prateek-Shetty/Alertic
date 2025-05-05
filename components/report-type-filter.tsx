"use client"

import { Button } from "@/components/ui/button"

interface ReportTypeFilterProps {
  activeFilter: string | null
  onFilterChange: (filter: string | null) => void
  className?: string
}

export function ReportTypeFilter({ activeFilter, onFilterChange, className }: ReportTypeFilterProps) {
  return (
    <div className={`flex gap-2 ${className || ""}`}>
      <Button variant={activeFilter === null ? "default" : "outline"} size="sm" onClick={() => onFilterChange(null)}>
        All
      </Button>
      <Button
        variant={activeFilter === "Localised Weather" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("Localised Weather")}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Localised Weather
      </Button>
      <Button
        variant={activeFilter === "Disaster" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("Disaster")}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        Disaster
      </Button>
    </div>
  )
}
