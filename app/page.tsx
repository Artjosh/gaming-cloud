"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import InteractivePixelBackground from "@/components/interactive-pixel-background"
import HeroSection from "@/components/hero-section"
import FeaturesGrid from "@/components/features-grid"
import Navbar from "@/components/navbar"
import { useAuth } from "@/hooks/use-auth"

export default function Home() {
  const [view, setView] = useState<"hero" | "features">("hero")
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirecionar para o dashboard se o usuário já estiver logado
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  // Não renderizar nada enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

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
