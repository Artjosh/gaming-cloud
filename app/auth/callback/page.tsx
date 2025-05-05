"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientClient } from "@/lib/supabase/client"
import InteractivePixelBackground from "@/components/interactive-pixel-background"

export default function AuthCallback() {
  const [message, setMessage] = useState("Processando autenticação...")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Obter o token de login da URL
        const loginToken = searchParams.get("login_token")

        if (!loginToken) {
          setError("Token de login não encontrado")
          return
        }

        // Processar o hash de autenticação
        const supabase = createClientClient()

        // Verificar se temos um hash na URL
        if (window.location.hash && window.location.hash.includes("access_token")) {
          const { error } = await supabase.auth.getSession()

          if (error) {
            setError(`Erro ao processar autenticação: ${error.message}`)
            return
          }

          // Notificar o dispositivo original que o login foi bem-sucedido
          const notifyResponse = await fetch("/api/auth/notify-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ loginToken }),
          })

          if (!notifyResponse.ok) {
            console.warn("Não foi possível notificar o dispositivo original, mas o login foi bem-sucedido")
          }

          setMessage("Login realizado com sucesso! Redirecionando...")

          // Redirecionar para o dashboard após um breve delay
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          setError("Dados de autenticação não encontrados na URL")
        }
      } catch (error) {
        console.error("Erro ao processar callback:", error)
        setError("Ocorreu um erro ao processar a autenticação")
      }
    }

    processAuth()
  }, [router, searchParams])

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Interactive Pixel Background */}
      <div className="fixed inset-0 z-0">
        <InteractivePixelBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex items-center justify-center">
        <div className="bg-black/80 backdrop-blur-md border border-blue-500/30 rounded-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center mb-6">
            {error ? (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white text-center">Erro de Autenticação</h1>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  {message.includes("sucesso") ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white text-center">Autenticação</h1>
              </>
            )}
          </div>

          <p className="text-gray-300 text-center mb-6">{error || message}</p>

          {error && (
            <div className="flex justify-center">
              <button
                onClick={() => router.push("/")}
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Voltar para a página inicial
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
