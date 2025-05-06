import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[API] /api/auth/user: Iniciando requisição")

    // Adicionar cabeçalhos para evitar cache
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    }

    const supabase = createServerClient()

    // Obter a sessão atual do Supabase
    console.log("[API] /api/auth/user: Obtendo sessão")
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("[API] /api/auth/user: Erro ao obter sessão:", sessionError)
      return NextResponse.json({ user: null, error: sessionError.message }, { status: 401, headers })
    }

    // Se não houver sessão, retornar null
    if (!session) {
      console.log("[API] /api/auth/user: Nenhuma sessão encontrada")
      return NextResponse.json({ user: null }, { status: 401, headers })
    }

    // Obter dados do usuário a partir da sessão
    console.log("[API] /api/auth/user: Sessão encontrada, obtendo usuário")
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.error("[API] /api/auth/user: Erro ao obter usuário:", error)
      return NextResponse.json({ user: null, error: error?.message }, { status: 401, headers })
    }

    console.log("[API] /api/auth/user: Usuário encontrado:", user.id)

    // Retornar o usuário e a sessão com cabeçalhos anti-cache
    return NextResponse.json({ user, session }, { headers })
  } catch (error) {
    console.error("[API] /api/auth/user: Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor", details: String(error) }, { status: 500 })
  }
}
