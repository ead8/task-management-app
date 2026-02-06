"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import type { Task } from "@/lib/db"
import { TaskForm } from "./task-form"

type TaskDialogProps = {
  isOpen: boolean
  task?: Task | null
  onClose: () => void
  onSubmit: (data: {
    title: string
    description: string
    status: string
  }) => Promise<void>
  isSubmitting: boolean
}

export function TaskDialog({
  isOpen,
  task,
  onClose,
  onSubmit,
  isSubmitting,
}: TaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    function handleClose() {
      onClose()
    }

    dialog.addEventListener("close", handleClose)
    return () => dialog.removeEventListener("close", handleClose)
  }, [onClose])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-lg rounded-lg border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/20 backdrop:backdrop-blur-sm"
      aria-labelledby="dialog-title"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="dialog-title"
            className="text-lg font-semibold text-card-foreground"
          >
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">
          <TaskForm
            task={task}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </dialog>
  )
}
