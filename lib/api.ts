// API utility functions for Alertic

/**
 * Fetches all reports from the API
 */
export async function getReports() {
  try {
    const response = await fetch("/api/get_reports")

    if (!response.ok) {
      throw new Error("Failed to fetch reports")
    }

    const data = await response.json()
    return data.reports || []
  } catch (error) {
    console.error("Error fetching reports:", error)
    return []
  }
}

/**
 * Submits a new report to the API
 */
export async function submitReport(reportData: any) {
  try {
    const response = await fetch("/api/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    })

    if (!response.ok) {
      throw new Error("Failed to submit report")
    }

    return await response.json()
  } catch (error) {
    console.error("Error submitting report:", error)
    throw error
  }
}

/**
 * Formats report data for display
 */
export function formatReportData(reports: any[]) {
  return reports.map((report) => ({
    id: report.id,
    user_id: 1, // Default user ID
    description: report.description,
    lat: report.latitude,
    lon: report.longitude,
    category: report.category,
    reportType: report.reportType || "Localised Weather", // Default to Localised Weather if not specified
    timestamp: new Date().toISOString(),
  }))
}

/**
 * Converts a file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      resolve(base64.split(",")[1] || "")
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
