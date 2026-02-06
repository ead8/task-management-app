'use client';

import { ClipboardList } from "lucide-react"

export function TaskEmptyState({
  filter,
  onCreateTask,
}: {
  filter: string
  onCreateTask: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card py-16 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <ClipboardList className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-card-foreground">No tasks found</h3>
        <p className="text-sm text-muted-foreground">
          {filter === "all"
            ? "Get started by creating your first task."
            : `No tasks with status "${filter}".`}
        </p>
      </div>
      {filter === "all" && (
        <button
          type="button"
          onClick={onCreateTask}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Create a task
        </button>
      )}
    </div>
  )
}
