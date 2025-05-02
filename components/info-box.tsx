import type { ReactNode } from "react"

interface InfoBoxProps {
  icon: ReactNode
  title: string
  description: string
}

export function InfoBox({ icon, title, description }: InfoBoxProps) {
  return (
    <div className="flex flex-col items-center p-6 bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-black/70 hover:border-white/20 transition-all cursor-pointer">
      <div className="mb-4 p-3 bg-white/5 rounded-full">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm text-center">{description}</p>
    </div>
  )
}
