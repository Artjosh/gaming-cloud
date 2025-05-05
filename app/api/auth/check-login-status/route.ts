import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { loginTokens } from "../login-email/route"
import { randomBytes } from "crypto"

// Adicionar um nonce (número usado apenas uma vez) para cada verificação
const verificationNonces = new Map<string, { token: string; timestamp: number }>()

// Limpar nonces antigos periodicamente
setInterval(() => {
  const now = Date.now()
  for (const [nonce, data] of verificationNonces.entries()) {
    if (now - data.timestamp > 300000) {
      // 5 minutos
      verificationNonces.delete(nonce)
    }
  }
}, 300000) // Verificar a cada 5 minutos

export async function POST(request: NextRequest) {
  try {
    const { token, nonce } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    // Verificar se o token existe
    if (!loginTokens.has(token)) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    const loginData = loginTokens.get(token)!

    // Se o nonce foi fornecido, verificar se é válido
    if (nonce) {
      if (!verificationNonces.has(nonce) || verificationNonces.get(nonce)?.token !== token) {
        return NextResponse.json({ error: "Verificação inválida" }, { status: 403 })
      }

      // Remover o nonce após uso
      verificationNonces.delete(nonce)
    }

    // Verificar se o token está autenticado
    if (loginData.authenticated) {
      // Verificar se o usuário realmente existe no Supabase
      const supabase = createServerClient()
      const { data: sessionData } = await supabase.auth.getSession()

      // Se não houver sessão válida, não considerar autenticado
      if (!sessionData.session) {
        return NextResponse.json({ authenticated: false })
      }

      // Gerar um novo nonce para a próxima verificação
      const newNonce = randomBytes(32).toString("hex")
      verificationNonces.set(newNonce, { token, timestamp: Date.now() })

      // Limpar o token após uso bem-sucedido
      loginTokens.delete(token)

      return NextResponse.json({
        authenticated: true,
        nonce: newNonce,
      })
    }

    return NextResponse.json({ authenticated: false })
  } catch (error) {
    console.error("Erro ao verificar status de login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
