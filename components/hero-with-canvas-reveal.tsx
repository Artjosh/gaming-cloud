"use client"
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect"
import { Button } from "@/components/ui/button"

export default function HeroWithCanvasReveal() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Canvas Reveal Effect Background */}
      <div className="absolute inset-0">
        <CanvasRevealEffect
          animationSpeed={2}
          containerClassName="bg-black"
          colors={[
            [0, 100, 255], // Bright blue
            [50, 150, 255], // Medium blue
            [100, 200, 255], // Light blue
          ]}
          dotSize={3}
          opacities={[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1]}
        />
        {/* Overlay gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">GAMING CLOUD</h1>
        <p className="mt-6 text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
          Acesse suas máquinas virtuais de jogos de qualquer lugar. Desempenho máximo, latência mínima e uma experiência
          de jogo sem igual.
        </p>
        <div className="mt-10">
          <Button
            size="lg"
            className="bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Adicionar VM
          </Button>
        </div>
      </div>
    </div>
  )
}
