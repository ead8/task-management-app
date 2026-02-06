"use client"

import { useEffect, useRef } from "react"
import { AlertTriangle, X } from "lucide-react"

type TaskDeleteDialogProps = {
  isOpen: boolean
  taskTitle: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

export function TaskDeleteDialog({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: TaskDeleteDialogProps) {
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
      onCancel()
    }

    dialog.addEventListener("close", handleClose)
    return () => dialog.removeEventListener("close", handleClose)
  }, [onCancel])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-md rounded-lg border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/20 backdrop:backdrop-blur-sm"
      aria-labelledby="delete-dialog-title"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex flex-col gap-1">
            <h2
              id="delete-dialog-title"
              className="font-semibold text-card-foreground"
            >
              Delete Task
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-medium text-card-foreground">
                {`"${taskTitle}"`}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground ring-offset-background transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </dialog>
  )
}
