import { cn } from "@/lib/utils"

const statusConfig = {
  todo: {
    label: "To Do",
    className: "bg-muted text-muted-foreground",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-accent text-accent-foreground",
  },
  done: {
    label: "Done",
    className: "bg-emerald-50 text-emerald-700",
  },
} as const

export function TaskStatusBadge({
  status,
}: {
  status: "todo" | "in-progress" | "done"
}) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
