import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const taskId = parseInt(id, 10)

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const result = await sql`
      SELECT * FROM tasks WHERE id = ${taskId} AND user_id = ${user.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to fetch task:", error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const taskId = parseInt(id, 10)

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
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
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be todo, in-progress, or done" },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE tasks
      SET title = ${title.trim()},
          description = ${description?.trim() || null},
          status = ${status || "todo"},
          updated_at = NOW()
      WHERE id = ${taskId} AND user_id = ${user.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to update task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const taskId = parseInt(id, 10)

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM tasks WHERE id = ${taskId} AND user_id = ${user.id} RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Failed to delete task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
