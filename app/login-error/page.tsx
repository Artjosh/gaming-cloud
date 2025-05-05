"use client"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import InteractivePixelBackground from "@/components/interactive-pixel-background"
import { AlertCircle } from "lucide-react"

export default function LoginErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Ocorreu um erro durante o login"
  const router = useRouter()

  const getErrorMessage = () => {
    switch (error) {
      case "no_code":
        return "Código de autenticação não encontrado."
      case "server_error":
        return "Erro interno do servidor durante a autenticação."
      default:
        return error
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Interactive Pixel Background */}
      <div className="fixed inset-0 z-0">
        <InteractivePixelBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex items-center justify-center">
        <div className="bg-black/80 backdrop-blur-md border border-red-500/30 rounded-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">Erro de Login</h1>
          </div>

          <p className="text-gray-300 text-center mb-6">{getErrorMessage()}</p>

          <div className="flex flex-col space-y-4">
            <Button onClick={() => router.push("/")} className="w-full bg-blue-700 hover:bg-blue-600 text-white">
              Voltar para a página inicial
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
