import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Adicionar cabeçalhos para evitar cache
    return NextResponse.json(
      { user: data.user },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Erro ao obter usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
