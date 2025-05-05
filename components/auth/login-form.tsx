"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Mail, RefreshCw, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface LoginFormProps {
  onClose: () => void
  onSwitchToRegister: () => void
}

export default function LoginForm({ onClose, onSwitchToRegister }: LoginFormProps) {
  const { sendLoginEmail, verifyOTP, checkLoginStatus, loading, setLoading } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [loginToken, setLoginToken] = useState<string | null>(null)
  const checkStatusInterval = useRef<NodeJS.Timeout | null>(null)

  // Contador para o botão de reenvio
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  // Verificar periodicamente o status de login quando temos um token
  useEffect(() => {
    if (loginToken && emailSent) {
      checkStatusInterval.current = setInterval(async () => {
        const result = await checkLoginStatus(loginToken)
        if (result.success) {
          clearInterval(checkStatusInterval.current!)
          onClose()
          toast({
            variant: "success",
            title: "Login realizado com sucesso",
            description: "Bem-vindo de volta!",
            duration: 3000,
          })
        }
      }, 2000) // Verificar a cada 2 segundos
    }

    return () => {
      if (checkStatusInterval.current) {
        clearInterval(checkStatusInterval.current)
      }
    }
  }, [loginToken, emailSent, checkLoginStatus, onClose, toast])

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

    if (!email && !emailSent) {
      setError("Por favor, informe seu email")
      return
    }

    if (emailSent) {
      // Verificar o código OTP
      if (!otpCode) {
        setError("Por favor, digite o código enviado por email")
        return
      }

      setLoading(true)
      try {
        const result = await verifyOTP(email, otpCode, loginToken || "")
        if (result.success) {
          onClose()
          toast({
            variant: "success",
            title: "Login realizado com sucesso",
            description: "Bem-vindo de volta!",
            duration: 3000,
          })
        } else {
          setError(result.error || "Código inválido")
          toast({
            variant: "destructive",
            title: "Erro de verificação",
            description: result.error || "Código inválido ou expirado",
            duration: 5000,
          })
        }
      } catch (error) {
        console.error("Erro ao verificar OTP:", error)
        setError("Erro ao verificar o código")
      } finally {
        setLoading(false)
      }
    } else {
      // Enviar email com OTP e Magic Link
      setLoading(true)
      try {
        const result = await sendLoginEmail(email)
        setLoading(false)

        if (result.success) {
          setEmailSent(true)
          setLoginToken(result.token || null)
          setResendCountdown(60) // Iniciar contador de 60 segundos
          toast({
            variant: "success",
            title: "Email enviado",
            description: "Verifique seu email para o código de acesso ou clique no link.",
            duration: 5000,
          })
        } else {
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
            setError(result.error || "Falha ao enviar o email")
            toast({
              variant: "destructive",
              title: "Erro ao enviar email",
              description: result.error || "Falha ao enviar o email de acesso",
              duration: 5000,
            })
          }
        }
      } catch (error) {
        setLoading(false)
        console.error("Erro ao enviar email:", error)
        setError("Erro ao enviar o email de acesso")
      }
    }
  }

  const handleResendLoginEmail = async () => {
    if (resendCountdown > 0) return

    setError(null)
    setResendLoading(true)
    try {
      const result = await sendLoginEmail(email)
      if (result.success) {
        setLoginToken(result.token || null)
        setResendCountdown(60) // Reiniciar contador de 60 segundos
        toast({
          variant: "success",
          title: "Email reenviado",
          description: "Verifique seu email para o novo código de acesso ou link.",
          duration: 5000,
        })
      } else {
        setError(result.error || "Falha ao reenviar o email")
      }
    } catch (error) {
      console.error("Erro ao reenviar email:", error)
      setError("Erro ao reenviar o email de acesso")
    } finally {
      setResendLoading(false)
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

      {emailSent && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-2 rounded mb-4">
          Email enviado com sucesso! Verifique sua caixa de entrada.
        </div>
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
            disabled={emailSent}
          />
        </div>

        {emailSent && (
          <div className="space-y-2">
            <Label htmlFor="otpCode" className="text-white">
              Código de Acesso
            </Label>
            <Input
              id="otpCode"
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Digite o código recebido por email"
              className="bg-gray-900 border-gray-700 text-white"
              required
              autoComplete="one-time-code"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-400">Verifique seu email para o código ou clique no link enviado.</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendLoginEmail}
                disabled={resendCountdown > 0 || resendLoading}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 text-xs"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Enviando...
                  </>
                ) : resendCountdown > 0 ? (
                  `Reenviar (${resendCountdown}s)`
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reenviar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 text-white" disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {emailSent ? "Verificando..." : "Enviando..."}
            </>
          ) : emailSent ? (
            <>
              <Key className="mr-2 h-4 w-4" />
              Verificar código
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Enviar código de acesso
            </>
          )}
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

      {emailSent && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-gray-300 text-sm text-center">
            <span className="block mb-2">Aguardando autenticação...</span>
            <span className="text-xs text-gray-400">
              Se você clicar no link de acesso em outro dispositivo, esta tela será atualizada automaticamente.
            </span>
          </p>
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
