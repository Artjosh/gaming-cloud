"use client"
import { useRef, useEffect, useState } from "react"

interface Pixel {
  x: number
  y: number
  color: string
  size: number
  originalX: number
  originalY: number
}

export default function InteractivePixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })
  const animationRef = useRef<number>()
  const pixelSize = 4
  const repelRadius = 80
  const repelStrength = 0.8
  const returnSpeed = 0.05

  // Create pixels
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const { width, height } = canvas.getBoundingClientRect()

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height
    setDimensions({ width, height })

    // Create pixels
    const newPixels: Pixel[] = []
    const colors = ["rgba(0, 100, 255, 0.7)", "rgba(50, 150, 255, 0.8)", "rgba(100, 200, 255, 0.9)"]

    for (let x = 0; x < width; x += pixelSize * 2) {
      for (let y = 0; y < height; y += pixelSize * 2) {
        // Random chance to create a pixel for a sparse effect
        if (Math.random() > 0.7) {
          newPixels.push({
            x,
            y,
            originalX: x,
            originalY: y,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: pixelSize * (0.5 + Math.random() * 0.5), // Varied sizes
          })
        }
      }
    }

    setPixels(newPixels)

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return
      const { width, height } = canvasRef.current.getBoundingClientRect()
      canvasRef.current.width = width
      canvasRef.current.height = height
      setDimensions({ width, height })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const handleMouseLeave = () => {
      setMousePos({ x: -1000, y: -1000 })
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || pixels.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      // Update and draw pixels
      const updatedPixels = pixels.map((pixel) => {
        // Calculate distance to mouse
        const dx = pixel.x - mousePos.x
        const dy = pixel.y - mousePos.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        let newX = pixel.x
        let newY = pixel.y

        // Repel from mouse
        if (distance < repelRadius) {
          const angle = Math.atan2(dy, dx)
          const force = ((repelRadius - distance) / repelRadius) * repelStrength
          newX += Math.cos(angle) * force * 10
          newY += Math.sin(angle) * force * 10
        }

        // Return to original position
        newX += (pixel.originalX - newX) * returnSpeed
        newY += (pixel.originalY - newY) * returnSpeed

        // Draw pixel
        ctx.fillStyle = pixel.color
        ctx.fillRect(newX, newY, pixel.size, pixel.size)

        return {
          ...pixel,
          x: newX,
          y: newY,
        }
      })

      setPixels(updatedPixels)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [pixels, mousePos, dimensions])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full bg-black" />
}
