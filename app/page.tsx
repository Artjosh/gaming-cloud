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

  // Processar autenticação quando a página carrega
  useEffect(() => {
    const processAuth = async () => {
      const hashParams = window.location.hash

      // Verificar se há um hash de autenticação na URL
      if (hashParams && hashParams.includes("access_token")) {
        try {
          setProcessingAuth(true)
          console.log("Detectado hash de autenticação")

          const supabase = createClientClient()

          // Extrair a sessão diretamente do hash
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error("Erro ao obter sessão:", error)
            router.push(`/login-error?error=${encodeURIComponent(error.message)}`)
            return
          }

          if (data.session) {
            console.log("Sessão obtida com sucesso")

            // Atualizar o usuário após autenticação bem-sucedida
            await refreshUser()

            // Limpar o hash da URL
            window.history.replaceState({}, document.title, window.location.pathname)

            // Redirecionar para o dashboard
            router.push("/dashboard")
          } else {
            console.error("Não foi possível obter uma sessão válida")
            router.push("/login-error?error=invalid_session")
          }
        } catch (error: any) {
          console.error("Erro ao processar autenticação:", error)
          router.push(`/login-error?error=${encodeURIComponent(error.message || "unknown_error")}`)
        } finally {
          setProcessingAuth(false)
        }
      }

      // Verificar se há um código de erro na URL
      const errorCode = searchParams.get("error_code")
      const errorDescription = searchParams.get("error_description")

      if (errorCode || errorDescription) {
        console.error("Erro de autenticação:", errorCode, errorDescription)
        router.push(`/login-error?error=${encodeURIComponent(errorDescription || "unknown_error")}`)
      }
    }

    if (typeof window !== "undefined") {
      processAuth()
    }
  }, [router, refreshUser, searchParams])

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
