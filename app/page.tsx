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
  const [loadingError, setLoadingError] = useState<string | null>(null)

  // Adicionar um timeout para o loading para evitar loading infinito
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true)
      }, 5000) // 5 segundos de timeout
      return () => clearTimeout(timer)
    } else {
      setLoadingTimeout(false)
    }
  }, [loading])

  // Processar autenticação quando a página carrega
  useEffect(() => {
    const handleAuth = async () => {
      try {
        setProcessingAuth(true)
        setLoadingError(null)

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
      } catch (error) {
        console.error("Erro ao processar autenticação:", error)
        setLoadingError("Erro ao processar autenticação. Por favor, tente novamente.")
      } finally {
        setProcessingAuth(false)
      }
    }

    handleAuth()
  }, [router, processAuthHash, searchParams])

  // Redirecionar para o dashboard se o usuário já estiver logado
  useEffect(() => {
    if (user && !loading && !processingAuth) {
      console.log("Usuário autenticado, redirecionando para o dashboard")
      router.push("/dashboard")
    }
  }, [user, loading, processingAuth, router])

  // Função para limpar a sessão do localStorage
  const clearSession = () => {
    if (typeof window !== "undefined") {
      console.log("Limpando sessão do localStorage")
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith("supabase.") || key.includes("auth"))) {
          console.log(`Removendo item do localStorage: ${key}`)
          localStorage.removeItem(key)
          i--
        }
      }
      window.location.reload()
    }
  }

  // Mostrar indicador de carregamento durante a autenticação
  if (loading || processingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>

        {loadingError && <p className="text-red-400 mb-4 text-center max-w-md px-4">{loadingError}</p>}

        {loadingTimeout && (
          <>
            <p className="text-white mb-4 text-center max-w-md px-4">
              Está demorando mais do que o esperado. Pode haver um problema com a sessão armazenada.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Recarregar a página
              </button>
              <button onClick={clearSession} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Limpar sessão e recarregar
              </button>
            </div>
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
