import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Node's built-in SQLite (stable in Node 22.5+/23+). No native compile step,
// no extra service to run — the whole database is one file on disk.
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Reuse a single connection across hot-reloads in dev.
const globalForDb = globalThis as unknown as { __optimusDb?: DatabaseSync };

export const db: DatabaseSync = globalForDb.__optimusDb ?? new DatabaseSync(DB_PATH);
if (!globalForDb.__optimusDb) globalForDb.__optimusDb = db;

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New chat',
    kind TEXT NOT NULL DEFAULT 'chat',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'text',
    code TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_threads_user ON threads(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_skills_user ON skills(user_id);
`);

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: number;
};

export type ThreadRow = {
  id: string;
  user_id: string;
  title: string;
  kind: string;
  created_at: number;
};

export type MessageRow = {
  id: string;
  thread_id: string;
  role: string;
  content: string;
  created_at: number;
};

export type SkillRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  created_at: number;
};
