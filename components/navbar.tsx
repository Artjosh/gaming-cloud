"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User, Server } from "lucide-react"
import AuthModal from "./auth/auth-modal"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  const handleExploreClick = () => {
    router.push("/dashboard")
  }

  return (
    <div className="fixed top-0 right-0 z-20 p-4">
      {user ? (
        <div className="flex items-center gap-2">
          <div className="bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2 text-white flex items-center">
            <User className="h-4 w-4 mr-2 text-blue-400" />
            <span className="text-sm">{user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário"}</span>
          </div>
          <Button
            variant="outline"
            className="bg-black/40 backdrop-blur-sm border-blue-500/30 text-white hover:bg-blue-900/30 hover:border-blue-400/50 hover:text-blue-300"
            onClick={handleExploreClick}
          >
            <Server className="h-4 w-4 mr-2" />
            Explore suas máquinas
          </Button>
          <Button
            variant="outline"
            className="bg-black/40 backdrop-blur-sm border-blue-500/30 text-white hover:bg-blue-900/30 hover:border-blue-400/50 hover:text-blue-300"
            onClick={logout}
            disabled={loading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="bg-black/40 backdrop-blur-sm border-blue-500/30 text-white hover:bg-blue-900/30 hover:border-blue-400/50 hover:text-blue-300"
          onClick={() => setIsAuthModalOpen(true)}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Button>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
