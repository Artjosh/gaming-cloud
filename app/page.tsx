"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import InteractivePixelBackground from "@/components/interactive-pixel-background"
import HeroSection from "@/components/hero-section"
import FeaturesGrid from "@/components/features-grid"
import Navbar from "@/components/navbar"
import { useAuth } from "@/hooks/use-auth"

export default function Home() {
  const [view, setView] = useState<"hero" | "features">("hero")
  const { user, loading, processAuthHash } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processingAuth, setProcessingAuth] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // Adicionar um timeout para o loading para evitar loading infinito
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true)
      }, 5000) // 5 segundos de timeout
      return () => clearTimeout(timer)
    }
  }, [loading])

  // Processar autenticação quando a página carrega
  useEffect(() => {
    const handleAuth = async () => {
      try {
        setProcessingAuth(true)

        // Processar hash de autenticação se presente
        const success = await processAuthHash()

        if (success) {
          // Redirecionar para o dashboard após autenticação bem-sucedida
          router.push("/dashboard")
          return
        }

        // Verificar se há um código de erro na URL
        const errorCode = searchParams.get("error_code")
        const errorDescription = searchParams.get("error_description")

        if (errorCode || errorDescription) {
          console.error("Erro de autenticação:", errorCode, errorDescription)
          router.push(`/login-error?error=${encodeURIComponent(errorDescription || "unknown_error")}`)
        }
      } finally {
        setProcessingAuth(false)
      }
    }

    handleAuth()
  }, [router, processAuthHash, searchParams])

  // Redirecionar para o dashboard se o usuário já estiver logado
  useEffect(() => {
    if (user && !loading && !processingAuth) {
      router.push("/dashboard")
    }
  }, [user, loading, processingAuth, router])

  // Mostrar indicador de carregamento durante a autenticação
  if (loading || processingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        {loadingTimeout && (
          <>
            <p className="text-white mb-4">Está demorando mais do que o esperado...</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Recarregar a página
            </button>
          </>
        )}
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
