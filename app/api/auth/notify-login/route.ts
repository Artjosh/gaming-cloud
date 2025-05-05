import { type NextRequest, NextResponse } from "next/server"
import { loginTokens } from "../login-email/route"

export async function POST(request: NextRequest) {
  try {
    const { loginToken } = await request.json()

    if (!loginToken) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    // Verificar se o token existe
    if (!loginTokens.has(loginToken)) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    // Marcar o token como autenticado
    loginTokens.set(loginToken, {
      ...loginTokens.get(loginToken)!,
      authenticated: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao notificar login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
