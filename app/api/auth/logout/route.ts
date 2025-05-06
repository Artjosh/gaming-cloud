import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Limpar a sessão no servidor com escopo global
    const { error } = await supabase.auth.signOut({ scope: "global" })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Limpar cookies relacionados à autenticação
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()

    for (const cookie of allCookies) {
      if (cookie.name.includes("supabase") || cookie.name.includes("auth")) {
        cookieStore.delete(cookie.name)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao fazer logout:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
