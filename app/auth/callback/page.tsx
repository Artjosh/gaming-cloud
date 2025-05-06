"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClientClient } from "@/lib/supabase/client"
import InteractivePixelBackground from "@/components/interactive-pixel-background"

export default function AuthCallback() {
  const [message, setMessage] = useState("Processando autenticação...")
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Importante: Desabilitar redirecionamentos nesta página
  useEffect(() => {
    // Adicionar uma flag ao sessionStorage para indicar que estamos na página de callback
    // Isso será usado para evitar redirecionamentos automáticos
    if (typeof window !== "undefined") {
      sessionStorage.setItem("is_auth_callback", "true")
    }

    // Limpar a flag quando sair da página
    return () => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("is_auth_callback")
      }
    }
  }, [])

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Obter o token de login da URL
        const loginToken = searchParams.get("login_token")

        if (!loginToken) {
          setError("Token de login não encontrado")
          return
        }

        console.log(`[callback] Processando autenticação para token ${loginToken}`)

        // Processar o hash de autenticação
        const supabase = createClientClient()

        // Verificar se temos um hash na URL
        if (window.location.hash && window.location.hash.includes("access_token")) {
          console.log("[callback] Hash de autenticação encontrado")

          // Processar o hash para obter a sessão
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error("[callback] Erro ao processar autenticação:", error)
            setError(`Erro ao processar autenticação: ${error.message}`)
            return
          }

          if (!data.session) {
            console.error("[callback] Não foi possível obter a sessão após autenticação")
            setError("Não foi possível obter a sessão após autenticação")
            return
          }

          // Obter dados do usuário
          const { data: userData, error: userError } = await supabase.auth.getUser()

          if (userError || !userData.user) {
            console.error("[callback] Erro ao obter usuário:", userError)
            setError(`Erro ao obter usuário: ${userError?.message || "Usuário não encontrado"}`)
            return
          }

          console.log("[callback] Sessão e usuário obtidos com sucesso, notificando o dispositivo original...")

          // Notificar o dispositivo original que o login foi bem-sucedido
          try {
            const notifyResponse = await fetch("/api/auth/notify-login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                loginToken,
                session: data.session,
                user: userData.user,
              }),
            })

            const notifyData = await notifyResponse.json()

            if (!notifyResponse.ok) {
              console.error("[callback] Erro ao notificar o dispositivo original:", notifyData.error)
              setError(`Erro ao notificar o dispositivo original: ${notifyData.error}`)
              return
            }

            console.log("[callback] Dispositivo original notificado com sucesso")
            setMessage("Login realizado com sucesso! Esta janela será fechada automaticamente.")

            // Fechar a janela após notificação bem-sucedida
            setTimeout(() => {
              window.close()
            }, 1000)
          } catch (notifyError) {
            console.error("[callback] Exceção ao notificar o dispositivo original:", notifyError)
            setError(
              `Erro ao notificar o dispositivo original: ${notifyError instanceof Error ? notifyError.message : String(notifyError)}`,
            )
          }
        } else {
          console.error("[callback] Dados de autenticação não encontrados na URL")
          setError("Dados de autenticação não encontrados na URL")
        }
      } catch (error) {
        console.error("[callback] Erro ao processar callback:", error)
        setError(
          `Ocorreu um erro ao processar a autenticação: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    processAuth()
  }, [searchParams])

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
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h1 className="text-2xl font-bold text-white text-center">Autenticação em Andamento</h1>
              </>
            )}
          </div>

          <p className="text-gray-300 text-center mb-6">{error || message}</p>

          {!error && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm text-center">
                <strong>Não feche esta página.</strong> Ela será fechada automaticamente quando a autenticação for
                concluída.
              </p>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <button
                onClick={() => window.close()}
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Fechar esta janela
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
