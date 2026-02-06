import { sql } from "@/lib/db"
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

    const tasks = await sql`
      SELECT * FROM tasks
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, status } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const validStatuses = ["todo", "in-progress", "done"]
    const taskStatus = validStatuses.includes(status) ? status : "todo"

    const result = await sql`
      INSERT INTO tasks (title, description, status, user_id)
      VALUES (${title.trim()}, ${description?.trim() || null}, ${taskStatus}, ${user.id})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
