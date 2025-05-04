"use client"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Mail, RefreshCw } from "lucide-react"

interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export default function EmailVerificationModal({ isOpen, onClose, email }: EmailVerificationModalProps) {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleResendEmail = async () => {
    setResendLoading(true)

    try {
      // Chamar a API para reenviar o email de verificação
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000) // Reset após 5 segundos
      }
    } catch (error) {
      console.error("Erro ao reenviar email:", error)
    } finally {
      setResendLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="min-w-[300px] w-full max-w-md"
          >
            <div className="bg-black/80 backdrop-blur-md border border-blue-500/30 rounded-xl p-6 w-full relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center">Confirme seu Email</h2>
              </div>

              <p className="text-gray-300 text-center mb-6">
                Enviamos um email de confirmação para <span className="text-blue-400 font-medium">{email}</span>. Por
                favor, verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
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

                <Button
                  onClick={onClose}
                  className="w-full bg-transparent hover:bg-transparent text-gray-400 hover:text-white"
                >
                  Continuar mesmo assim
                </Button>
              </div>

              <p className="mt-6 text-xs text-gray-500 text-center">
                Se você não encontrar o email, verifique sua pasta de spam ou lixo eletrônico.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
