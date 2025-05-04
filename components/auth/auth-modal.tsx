"use client"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: "login" | "register"
}

export default function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
  const [view, setView] = useState<"login" | "register">(initialView)

  // Reset to login view whenever modal is closed
  useEffect(() => {
    if (!isOpen) {
      setView("login")
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="min-w-[300px] w-full max-w-md"
          >
            {view === "login" ? (
              <LoginForm onClose={onClose} onSwitchToRegister={() => setView("register")} />
            ) : (
              <RegisterForm onClose={onClose} onSwitchToLogin={() => setView("login")} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
