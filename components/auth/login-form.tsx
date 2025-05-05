"use client"
import { useState } from "react"
import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Mail, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface LoginFormProps {
  onClose: () => void
  onSwitchToRegister: () => void
}

export default function LoginForm({ onClose, onSwitchToRegister }: LoginFormProps) {
  const { login, loading } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleResendEmail = async () => {
    setResendLoading(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendSuccess(true)
        toast({
          variant: "success",
          title: "Email reenviado",
          description: "Verifique sua caixa de entrada para confirmar seu email.",
          duration: 5000,
        })
        setTimeout(() => setResendSuccess(false), 5000) // Reset após 5 segundos
      } else {
        const data = await response.json()
        toast({
          variant: "destructive",
          title: "Erro ao reenviar email",
          description: data.error || "Não foi possível reenviar o email de verificação.",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Erro ao reenviar email:", error)
      toast({
        variant: "destructive",
        title: "Erro ao reenviar email",
        description: "Ocorreu um erro ao tentar reenviar o email de verificação.",
        duration: 5000,
      })
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsEmailNotConfirmed(false)

    if (!email || !password) {
      setError("Por favor, preencha todos os campos")
      return
    }

    const result = await login(email, password)
    if (!result.success) {
      // Verificar se o erro é de email não confirmado
      if (result.error === "Email not confirmed") {
        setIsEmailNotConfirmed(true)
        toast({
          variant: "destructive",
          title: "Email não confirmado",
          description: "Por favor, confirme seu email antes de fazer login.",
          duration: 10000, // 10 segundos
          action: (
            <ToastAction
              altText="Reenviar email"
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Reenviar email"
              )}
            </ToastAction>
          ),
        })
      } else {
        setError(result.error || "Falha ao fazer login")
        toast({
          variant: "destructive",
          title: "Erro de login",
          description: result.error || "Falha ao fazer login",
          duration: 5000,
        })
      }
    } else {
      onClose()
      toast({
        variant: "success",
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
        duration: 3000,
      })
    }
  }

  return (
    <div className="bg-black/80 backdrop-blur-md border border-blue-500/30 rounded-xl p-6 w-full relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Fechar">
        <X size={20} />
      </button>

      <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 text-white" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      {isEmailNotConfirmed && (
        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <h3 className="text-yellow-300 font-medium mb-2">Email não confirmado</h3>
          <p className="text-gray-300 text-sm mb-3">
            Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada ou clique no botão
            abaixo para reenviar o email de confirmação.
          </p>
          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/30 hover:text-yellow-300"
            disabled={resendLoading || resendSuccess}
          >
            {resendLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : resendSuccess ? (
              "Email reenviado com sucesso!"
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Reenviar email de confirmação
              </>
            )}
          </Button>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-gray-400">
          Não tem uma conta?{" "}
          <button onClick={onSwitchToRegister} className="text-blue-400 hover:text-blue-300 hover:underline">
            Registre-se
          </button>
        </p>
      </div>
    </div>
  )
}
