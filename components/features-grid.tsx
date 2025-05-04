"use client"
import { Button } from "@/components/ui/button"
import { ChevronUp, Gamepad2, Zap, Globe, Shield } from "lucide-react"
import { motion } from "framer-motion"

interface FeaturesGridProps {
  onBack: () => void
}

export default function FeaturesGrid({ onBack }: FeaturesGridProps) {
  const features = [
    {
      icon: <Gamepad2 className="h-8 w-8 text-white" />,
      title: "Desempenho Superior",
      description:
        "Hardware otimizado para jogos exigentes com gráficos de alta qualidade, além de suporte para jogos simples que não necessitam de GPU dedicada ou até mesmo sem GPU completamente, atendendo a todos os tipos de jogadores.",
    },
    {
      icon: <Zap className="h-8 w-8 text-white" />,
      title: "Baixa Latência",
      description: "Tecnologia de streaming avançada que minimiza atrasos, proporcionando uma experiência responsiva.",
    },
    {
      icon: <Globe className="h-8 w-8 text-white" />,
      title: "Acesso Global",
      description: "Jogue de qualquer lugar e dispositivo, mantendo suas configurações e progresso sincronizados.",
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: "Segurança Avançada",
      description: "Proteção de dados com criptografia de ponta e autenticação multifator para uma experiência segura.",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-colors duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-600 p-3 rounded-lg">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
            </div>
            <p className="text-gray-300">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-blue-500 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
        >
          <ChevronUp className="mr-2 h-5 w-5" />
          Voltar ao Início
        </Button>
      </div>
    </motion.div>
  )
}
