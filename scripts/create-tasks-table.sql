CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed some initial tasks
INSERT INTO tasks (title, description, status) VALUES
  ('Set up project repository', 'Initialize the Git repo and configure CI/CD pipeline', 'done'),
  ('Design database schema', 'Create ERD and define table relationships for the task manager', 'done'),
  ('Build REST API endpoints', 'Implement CRUD operations for tasks with proper validation', 'in-progress'),
  ('Create responsive UI', 'Build the frontend with Next.js and Tailwind CSS', 'in-progress'),
  ('Write unit tests', 'Add test coverage for API routes and key components', 'todo'),
  ('Deploy to production', 'Set up Vercel deployment with environment variables', 'todo');
