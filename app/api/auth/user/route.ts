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

    // Obter a sessão atual
    const { data: sessionData } = await supabase.auth.getSession()

    // Se não houver sessão, retornar null
    if (!sessionData.session) {
      return NextResponse.json(
        { user: null },
        {
          status: 401,
          headers,
        },
      )
    }

    // Obter dados do usuário a partir da sessão
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return NextResponse.json(
        { user: null },
        {
          status: 401,
          headers,
        },
      )
    }

    // Retornar o usuário com cabeçalhos anti-cache
    return NextResponse.json({ user: data.user }, { headers })
  } catch (error) {
    console.error("Erro ao obter usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
