"use client"
import { useState } from "react"
import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface LoginFormProps {
  onClose: () => void
  onSwitchToRegister: () => void
}

export default function LoginForm({ onClose, onSwitchToRegister }: LoginFormProps) {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Por favor, preencha todos os campos")
      return
    }

    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || "Falha ao fazer login")
    } else {
      onClose()
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
