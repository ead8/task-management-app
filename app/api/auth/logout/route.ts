import { deleteSession } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const headerStore = await headers()
    const authHeader = headerStore.get("authorization")

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7)
      if (token) {
        await deleteSession(token)
      }
    }

    return NextResponse.json({ message: "Logged out" })
  } catch (error) {
    console.error("Logout failed:", error)
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    )
  }
}
