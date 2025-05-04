"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { Gamepad2, Zap, Globe, Shield } from "lucide-react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  isExpanded: boolean
  onClick: () => void
}

const FeatureCard = ({ icon, title, description, isExpanded, onClick }: FeatureCardProps) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
        isExpanded ? "col-span-2 md:col-span-2" : "col-span-1"
      }`}
      whileHover={{ scale: isExpanded ? 1 : 1.03 }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-blue-600 p-3 rounded-lg">{icon}</div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isExpanded ? 1 : 0,
          height: isExpanded ? "auto" : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="text-gray-300 mt-2">{description}</p>
      </motion.div>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Gamepad2 className="h-6 w-6 text-white" />,
      title: "Desempenho Superior",
      description:
        "Experimente jogos com alto desempenho gráfico e processamento, sem a necessidade de hardware potente. Nossa plataforma oferece recursos computacionais otimizados para jogos exigentes, garantindo uma experiência fluida mesmo em dispositivos mais simples.",
    },
    {
      icon: <Zap className="h-6 w-6 text-white" />,
      title: "Baixa Latência",
      description:
        "Jogue sem atrasos perceptíveis graças à nossa tecnologia de streaming otimizada. Utilizamos algoritmos avançados de compressão e uma infraestrutura distribuída para minimizar a latência, proporcionando uma experiência responsiva mesmo em jogos que exigem reflexos rápidos.",
    },
    {
      icon: <Globe className="h-6 w-6 text-white" />,
      title: "Acesso Global",
      description:
        "Conecte-se à sua máquina virtual de qualquer lugar e dispositivo. Nossa plataforma permite que você acesse seus jogos favoritos de qualquer navegador ou aplicativo dedicado, em smartphones, tablets, computadores ou smart TVs, mantendo suas configurações e progresso sincronizados.",
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: "Segurança Avançada",
      description:
        "Seus dados e jogos protegidos por tecnologias de segurança de ponta. Implementamos criptografia de última geração, autenticação multifator e monitoramento contínuo para garantir que sua experiência de jogo seja não apenas divertida, mas também segura contra ameaças digitais.",
    },
  ]

  const toggleExpand = (index: number) => {
    if (expandedFeature === index) {
      setExpandedFeature(null)
    } else {
      setExpandedFeature(index)
    }
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Recursos da Nossa Plataforma</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            isExpanded={expandedFeature === index}
            onClick={() => toggleExpand(index)}
          />
        ))}
      </div>
    </div>
  )
}
