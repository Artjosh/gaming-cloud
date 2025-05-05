import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Adicionar cabeçalhos para evitar cache
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    }

    const supabase = createServerClient()

    // Obter a sessão atual do Supabase
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Erro ao obter sessão:", sessionError)
      return NextResponse.json({ user: null }, { status: 401, headers })
    }

    // Se não houver sessão, retornar null
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401, headers })
    }

    // Obter dados do usuário a partir da sessão
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.error("Erro ao obter usuário:", error)
      return NextResponse.json({ user: null }, { status: 401, headers })
    }

    // Retornar o usuário com cabeçalhos anti-cache
    return NextResponse.json({ user }, { headers })
  } catch (error) {
    console.error("Erro ao obter usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
