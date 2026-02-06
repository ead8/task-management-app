import { getSessionUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getSessionUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Auth check failed:", error)
    return NextResponse.json(
      { error: "Auth check failed" },
      { status: 500 }
    )
  }
}
