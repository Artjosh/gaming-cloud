"use client"
import { useState } from "react"
import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, RefreshCw } from "lucide-react"

interface RegisterFormProps {
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onClose, onSwitchToLogin }: RegisterFormProps) {
  const { register, loading } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name || !email) {
      setError("Por favor, preencha todos os campos")
      return
    }

    const result = await register(email, name)
    if (!result.success) {
      setError(result.error || "Falha ao registrar")
    } else {
      setSuccess("Conta criada com sucesso! Verifique seu email para confirmar seu cadastro.")
    }
  }

  return (
    <div className="bg-black/80 backdrop-blur-md border border-blue-500/30 rounded-xl p-6 w-full relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Fechar">
        <X size={20} />
      </button>

      <h2 className="text-2xl font-bold text-white mb-6 text-center">Criar Conta</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded mb-4">{error}</div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-2 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Nome
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

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

        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 text-white" disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            "Registrar"
          )}
        </Button>
      </form>

      {success && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-gray-300 text-sm text-center">
            <span className="block mb-2">Verifique seu email para confirmar seu cadastro.</span>
            <span className="text-xs text-gray-400">
              Você receberá um email com um link para confirmar sua conta e definir seu acesso.
            </span>
          </p>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-gray-400">
          Já tem uma conta?{" "}
          <button onClick={onSwitchToLogin} className="text-blue-400 hover:text-blue-300 hover:underline">
            Faça login
          </button>
        </p>
      </div>
    </div>
  )
}
