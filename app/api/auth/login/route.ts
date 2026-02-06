import { sql } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      )
    }

    const result = await sql`
      SELECT id, name, email, password_hash
      FROM users WHERE email = ${email.toLowerCase().trim()}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const user = result[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const token = await createSession(user.id)

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error("Login failed:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}
