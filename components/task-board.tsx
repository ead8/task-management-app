"use client"

import { useState, useCallback, useMemo } from "react"
import useSWR from "swr"
import { Plus, ListFilter, LayoutGrid, List, Search, ArrowUpDown } from "lucide-react"
import type { Task } from "@/lib/db"
import { TaskCard } from "./task-card"
import { TaskDialog } from "./task-dialog"
import { TaskDeleteDialog } from "./task-delete-dialog"
import { TaskEmptyState } from "./task-empty-state"
import { UserMenu } from "./user-menu"
import { authHeaders } from "./auth-provider"

const fetcher = async (url: string) => {
  const res = await fetch(url, { headers: authHeaders() })
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

type StatusFilter = "all" | "todo" | "in-progress" | "done"
type SortBy = "newest" | "oldest" | "title-asc" | "title-desc"

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "title-desc", label: "Title Z-A" },
]

export function TaskBoard() {
  const {
    data: tasks = [],
    mutate,
    isLoading,
  } = useSWR<Task[]>("/api/tasks", fetcher)

  const [filter, setFilter] = useState<StatusFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortBy>("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const taskToDelete = tasks.find((t) => t.id === deleteTaskId)

  const statusCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  }

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]

    // Filter by status
    if (filter !== "all") {
      result = result.filter((t) => t.status === filter)
    }

    // Search by title/description
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "title-asc":
          return a.title.localeCompare(b.title)
        case "title-desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

    return result
  }, [tasks, filter, searchQuery, sortBy])

  const handleCreateOrUpdate = useCallback(
    async (data: { title: string; description: string; status: string }) => {
      setIsSubmitting(true)
      try {
        if (editingTask) {
          await fetch(`/api/tasks/${editingTask.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(data),
          })
        } else {
          await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(data),
          })
        }
        await mutate()
        setIsDialogOpen(false)
        setEditingTask(null)
      } finally {
        setIsSubmitting(false)
      }
    },
    [editingTask, mutate]
  )

  const handleDelete = useCallback(async () => {
    if (deleteTaskId === null) return
    setIsDeleting(true)
    try {
      await fetch(`/api/tasks/${deleteTaskId}`, { method: "DELETE", headers: authHeaders() })
      await mutate()
      setDeleteTaskId(null)
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTaskId, mutate])

  function openCreateDialog() {
    setEditingTask(null)
    setIsDialogOpen(true)
  }

  function openEditDialog(task: Task) {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingTask(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            TaskFlow
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and track your tasks across all stages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
          <UserMenu />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors ${
              filter === opt.value
                ? "border-primary/30 bg-accent text-accent-foreground"
                : "border-border bg-card text-card-foreground hover:bg-muted"
            }`}
          >
            <span className="text-xl font-bold">
              {statusCounts[opt.value]}
            </span>
            <span className="text-xs text-muted-foreground">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Search tasks"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Sort tasks"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center rounded-md border border-border bg-card">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-l-md transition-colors ${
                viewMode === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-r-md transition-colors ${
                viewMode === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ListFilter className="h-4 w-4" />
        <span>
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </span>
      </div>

      {/* Tasks */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedTasks.length === 0 ? (
        <TaskEmptyState filter={filter} onCreateTask={openCreateDialog} />
      ) : viewMode === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEditDialog}
              onDelete={setDeleteTaskId}
              isDeleting={isDeleting && deleteTaskId === task.id}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEditDialog}
              onDelete={setDeleteTaskId}
              isDeleting={isDeleting && deleteTaskId === task.id}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <TaskDialog
        isOpen={isDialogOpen}
        task={editingTask}
        onClose={closeDialog}
        onSubmit={handleCreateOrUpdate}
        isSubmitting={isSubmitting}
      />

      <TaskDeleteDialog
        isOpen={deleteTaskId !== null}
        taskTitle={taskToDelete?.title ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTaskId(null)}
        isDeleting={isDeleting}
      />
    </div>
  )
}
