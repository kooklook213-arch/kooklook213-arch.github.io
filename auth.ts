import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db, type UserRow } from "@/lib/server/db";

const SESSION_COOKIE = "optimus_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function uid() {
  return crypto.randomUUID();
}

export async function createUser(name: string, email: string, password: string) {
  const existing = db
    .prepare("SELECT id FROM users WHERE lower(email) = lower(?)")
    .get(email) as { id: string } | undefined;
  if (existing) throw new Error("An account with that email already exists.");

  const passwordHash = await bcrypt.hash(password, 10);
  const id = uid();
  db.prepare(
    "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id, name, email, passwordHash, Date.now());
  return { id, name, email };
}

export async function verifyUser(email: string, password: string) {
  const row = db
    .prepare("SELECT * FROM users WHERE lower(email) = lower(?)")
    .get(email) as UserRow | undefined;
  if (!row) throw new Error("Incorrect email or password.");
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) throw new Error("Incorrect email or password.");
  return { id: row.id, name: row.name, email: row.email };
}

export function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  db.prepare(
    "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)"
  ).run(token, userId, now, now + SESSION_TTL_MS);
  return { token, expiresAt: now + SESSION_TTL_MS };
}

export function deleteSession(token: string) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function getUserBySessionToken(token: string | undefined | null) {
  if (!token) return null;
  const session = db
    .prepare("SELECT * FROM sessions WHERE token = ?")
    .get(token) as { user_id: string; expires_at: number } | undefined;
  if (!session) return null;
  if (session.expires_at < Date.now()) {
    deleteSession(token);
    return null;
  }
  const user = db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(session.user_id) as
    | { id: string; name: string; email: string }
    | undefined;
  return user ?? null;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);

export function getUserFromRequest(req: { cookies: { get(name: string): { value: string } | undefined } }) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return getUserBySessionToken(token);
}
