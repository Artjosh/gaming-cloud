"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import InteractivePixelBackground from "@/components/interactive-pixel-background"
import HeroSection from "@/components/hero-section"
import FeaturesGrid from "@/components/features-grid"
import Navbar from "@/components/navbar"
import { useAuth } from "@/hooks/use-auth"
import { createClientClient } from "@/lib/supabase/client"

export default function Home() {
  const [view, setView] = useState<"hero" | "features">("hero")
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processingAuth, setProcessingAuth] = useState(false)

  // Processar código de autenticação se presente na URL
  useEffect(() => {
    const processAuthCode = async () => {
      const code = searchParams.get("code")

      if (code) {
        try {
          setProcessingAuth(true)
          console.log("Processando código de autenticação:", code)

          const supabase = createClientClient()
          const { error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error("Erro ao trocar código por sessão:", error)
            router.push(`/login-error?error=${encodeURIComponent(error.message)}`)
            return
          }

          // Atualizar o usuário após autenticação bem-sucedida
          await refreshUser()

          // Limpar o código da URL
          window.history.replaceState({}, "", "/")

          // Redirecionar para o dashboard
          router.push("/dashboard")
        } catch (error) {
          console.error("Erro ao processar autenticação:", error)
          router.push("/login-error?error=processing_error")
        } finally {
          setProcessingAuth(false)
        }
      }
    }

    if (searchParams.get("code")) {
      processAuthCode()
    }
  }, [searchParams, router, refreshUser])

  // Redirecionar para o dashboard se o usuário já estiver logado
  useEffect(() => {
    if (user && !loading && !processingAuth) {
      router.push("/dashboard")
    }
  }, [user, loading, processingAuth, router])

  // Mostrar indicador de carregamento durante a autenticação
  if (loading || processingAuth) {
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
