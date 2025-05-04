"use client"
import { useState } from "react"
import InteractivePixelBackground from "@/components/interactive-pixel-background"
import HeroSection from "@/components/hero-section"
import FeaturesGrid from "@/components/features-grid"
import Navbar from "@/components/navbar"

export default function Home() {
  const [view, setView] = useState<"hero" | "features">("hero")

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Interactive Pixel Background - spans the entire page */}
      <div className="fixed inset-0 z-0">
        <InteractivePixelBackground />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="relative z-10 h-screen">
        {view === "hero" ? (
          <div className="h-full flex items-center justify-center">
            <HeroSection onExplore={() => setView("features")} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <FeaturesGrid onBack={() => setView("hero")} />
          </div>
        )}
      </div>
    </main>
  )
}
