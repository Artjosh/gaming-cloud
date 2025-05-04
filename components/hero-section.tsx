"use client"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface HeroSectionProps {
  onExplore: () => void
}

export default function HeroSection({ onExplore }: HeroSectionProps) {
  return (
    <div className="text-center px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">GAMING CLOUD</h1>
      <p className="mt-6 text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
        Acesse suas máquinas virtuais de jogos de qualquer lugar. Desempenho máximo, latência mínima e uma experiência
        de jogo sem igual.
      </p>
      <div className="mt-10">
        <Button
          onClick={onExplore}
          variant="outline"
          className="bg-black/40 backdrop-blur-sm border-blue-500/30 text-white hover:bg-blue-900/30 hover:border-blue-400/50 hover:text-blue-300 font-semibold transition duration-300 ease-in-out transform hover:scale-105"
        >
          <ChevronDown className="mr-2 h-4 w-4" />
          Descubra Mais
        </Button>
      </div>
    </div>
  )
}
