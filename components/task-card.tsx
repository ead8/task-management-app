"use client"

import { Pencil, Trash2, Calendar } from "lucide-react"
import type { Task } from "@/lib/db"
import { TaskStatusBadge } from "./task-status-badge"

type TaskCardProps = {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  isDeleting: boolean
}

export function TaskCard({ task, onEdit, onDelete, isDeleting }: TaskCardProps) {
  const formattedDate = new Date(task.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground leading-snug text-balance">
            {task.title}
          </h3>
        </div>
        <TaskStatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Edit task: ${task.title}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            aria-label={`Delete task: ${task.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
