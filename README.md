# TaskFlow - Task Management Application

A full-stack task management web application built with **Next.js 16**, **Neon PostgreSQL**, and **Tailwind CSS**. Features complete CRUD operations, user authentication, search/filter/sort capabilities, and a responsive UI.

## Features

### Core (Required)
- **CRUD Operations** -- Create, Read, Update, and Delete tasks
- **Task Fields** -- Title (required), Description (optional), Status (Todo / In Progress / Done)
- **Responsive UI** -- Mobile-first design with grid/list view toggle
- **RESTful API** -- Clean API routes at `/api/tasks` and `/api/tasks/[id]`
- **Persistent Storage** -- Neon serverless PostgreSQL database

### Bonus (Implemented)
- **Authentication** -- Secure register/login with PBKDF2 password hashing and token-based sessions (Authorization: `Bearer <token>`)
- **Per-User Tasks** -- Each user sees only their own tasks
- **Search** -- Real-time search across task titles and descriptions
- **Sort** -- Sort by newest, oldest, or title (A-Z / Z-A)
- **Status Filters** -- Filter tasks by status with live count badges
- **Deployment-Ready** -- Deploy to Vercel with one click

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 16 (App Router)             |
| Language   | TypeScript                          |
| Database   | Neon Serverless PostgreSQL           |
| Styling    | Tailwind CSS                        |
| State      | SWR (data fetching & caching)       |
| Auth       | Custom (PBKDF2 + Bearer sessions)   |
| Icons      | Lucide React                        |

## Project Structure

```
app/
  layout.tsx             # Root layout with AuthProvider
  page.tsx               # Main page with auth gating
  globals.css            # Design tokens & base styles
  api/
    auth/
      register/route.ts  # POST /api/auth/register
      login/route.ts     # POST /api/auth/login
      logout/route.ts    # POST /api/auth/logout
      me/route.ts        # GET /api/auth/me
    tasks/
      route.ts           # GET /api/tasks, POST /api/tasks
      [id]/route.ts      # GET, PUT, DELETE /api/tasks/:id

components/
  auth-provider.tsx      # Auth context + SWR-based session
  auth-form.tsx          # Login/Register form UI
  user-menu.tsx          # User avatar dropdown with logout
  task-board.tsx         # Main board with search/sort/filter
  task-card.tsx          # Individual task card
  task-dialog.tsx        # Create/Edit task dialog
  task-delete-dialog.tsx # Delete confirmation dialog
  task-empty-state.tsx   # Empty state illustration
  task-form.tsx          # Task form fields
  task-status-badge.tsx  # Status badge component

lib/
  auth.ts                # Password hashing + session tokens
  db.ts                  # Neon SQL client + types
  validation.ts          # Shared input validation helpers

scripts/
  create-tasks-table.sql  # Tasks table migration
  create-auth-tables.sql  # Users & Sessions table migration
```

## API Endpoints

### Authentication

| Method | Endpoint             | Description                     |
|--------|----------------------|---------------------------------|
| POST   | `/api/auth/register` | Register a new user             |
| POST   | `/api/auth/login`    | Login with email and password   |
| POST   | `/api/auth/logout`   | Logout and clear session        |
| GET    | `/api/auth/me`       | Get current authenticated user  |

### Tasks (all require authentication)

| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| GET    | `/api/tasks`      | List all user tasks  |
| POST   | `/api/tasks`      | Create a new task    |
| GET    | `/api/tasks/:id`  | Get a single task    |
| PUT    | `/api/tasks/:id`  | Update a task        |
| DELETE | `/api/tasks/:id`  | Delete a task        |

### Request/Response Examples

**Login (get a session token):**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "your-password"
}
```

Use the returned token for all task requests:
`Authorization: Bearer <token>`

**Create Task:**
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Build landing page",
  "description": "Design and implement the hero section",
  "status": "todo"
}
```

**Update Task:**
```http
PUT /api/tasks/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Build landing page",
  "description": "Design and implement the hero section",
  "status": "in-progress"
}
```

## Getting Started

### Prerequisites
- Node.js 18+
- A Neon PostgreSQL database (or any PostgreSQL)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ead8/task-management-app.git
   cd task-management-app
   ```

2. **Set environment variables**
   Create a `.env.local` file:
   ```env
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

3. **Run database migrations**
   Execute the SQL scripts in `scripts/` against your database (order matters):
   ```bash
   psql "$DATABASE_URL" -f scripts/create-tasks-table.sql
   psql "$DATABASE_URL" -f scripts/create-auth-tables.sql
   ```

4. **Install dependencies and run**
   ```bash
   pnpm install
   pnpm dev
   ```
   (Or use `npm install` / `npm run dev`.)

5. **Open** [http://localhost:3000](http://localhost:3000)

## Security

- Passwords are hashed with **PBKDF2-SHA512** (100,000 iterations, 64-byte key)
- Sessions are stored server-side in the `sessions` table; the client stores the session token in `localStorage` and sends it as `Authorization: Bearer <token>`
- All SQL queries use **parameterized queries** to prevent injection
- Tasks are **scoped per user** -- users can only access their own data
- Basic input validation on API endpoints

## Deployment

1. Push the project to GitHub
2. Import the repo in Vercel
3. Set `DATABASE_URL` in Vercel environment variables
4. Run the SQL migrations in `scripts/` on your production database
