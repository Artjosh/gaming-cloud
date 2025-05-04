"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InteractivePixelBackground from "@/components/interactive-pixel-background"
import Navbar from "@/components/navbar"
import EmailVerificationModal from "@/components/email-verification-modal"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false)

  useEffect(() => {
    // Redirecionar para a página inicial se o usuário não estiver logado
    if (!loading && !user) {
      router.push("/")
    }

    // Verificar se o email foi confirmado
    if (user && !user.email_confirmed_at) {
      setShowEmailVerificationModal(true)
    }
  }, [user, loading, router])

  // Não renderizar nada enquanto verifica a autenticação
  if (loading || !user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Interactive Pixel Background */}
      <div className="fixed inset-0 z-0">
        <InteractivePixelBackground />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        email={user.email || ""}
      />

      {/* Dashboard Content */}
      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black/60 backdrop-blur-md border border-blue-500/30 rounded-xl p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Suas Máquinas Virtuais</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Placeholder para máquinas virtuais */}
              <div className="bg-black/40 border border-blue-500/20 rounded-lg p-4 hover:border-blue-400/50 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">VM #1</h3>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Online</span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-400 text-sm">CPU: 4 vCores</p>
                  <p className="text-gray-400 text-sm">RAM: 8 GB</p>
                  <p className="text-gray-400 text-sm">Armazenamento: 100 GB</p>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Conectar
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm">
                    Reiniciar
                  </button>
                </div>
              </div>

              <div className="bg-black/40 border border-blue-500/20 rounded-lg p-4 hover:border-blue-400/50 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">VM #2</h3>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Offline</span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-400 text-sm">CPU: 2 vCores</p>
                  <p className="text-gray-400 text-sm">RAM: 4 GB</p>
                  <p className="text-gray-400 text-sm">Armazenamento: 50 GB</p>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm opacity-50 cursor-not-allowed">
                    Conectar
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm">
                    Iniciar
                  </button>
                </div>
              </div>

              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-blue-600/30 transition-colors cursor-pointer h-full">
                <div className="w-12 h-12 rounded-full bg-blue-600/30 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-blue-400 font-medium">Adicionar Nova VM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
