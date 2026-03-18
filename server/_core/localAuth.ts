import type { Express, Request, Response } from "express";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual, createHmac } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";

const scrypt = promisify(scryptCallback);

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.JWT_SECRET ||
  "mercanto-local-session-secret-change-this";

const SESSION_MAX_AGE_MS = ONE_YEAR_MS;

type SafeUser = {
  id: number;
  openId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  loginMethod: string | null;
  role: string;
  is_blocked: boolean;
  created_at: Date;
  updated_at: Date;
  last_signed_in: Date;
};

function sanitizeUser(user: typeof users.$inferSelect): SafeUser {
  return {
    id: user.id,
    openId: user.openId ?? null,
    name: user.name ?? null,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatar_url: user.avatar_url ?? null,
    loginMethod: user.loginMethod ?? null,
    role: user.role,
    is_blocked: user.is_blocked,
    created_at: user.created_at,
    updated_at: user.updated_at,
    last_signed_in: user.last_signed_in,
  };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;

  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");

  if (derivedKey.length !== storedKey.length) return false;
  return timingSafeEqual(derivedKey, storedKey);
}

function signPayload(payload: string) {
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
}

function createSessionToken(userId: number) {
  const expiresAt = Date.now() + SESSION_MAX_AGE_MS;
  const payload = `${userId}.${expiresAt}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function parseCookies(req: Request) {
  const raw = req.headers.cookie || "";
  return parseCookieHeader(raw);
}

function clearSessionCookie(req: Request, res: Response) {
  const cookieOptions = getSessionCookieOptions(req);
  res.clearCookie(COOKIE_NAME, {
    ...cookieOptions,
    maxAge: -1,
  });
}

export async function authenticateLocalRequest(req: Request): Promise<SafeUser | null> {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];

  if (!token) return null;

  const [userIdText, expiresAtText, signature] = token.split(".");
  if (!userIdText || !expiresAtText || !signature) return null;

  const payload = `${userIdText}.${expiresAtText}`;
  const expectedSignature = signPayload(payload);

  if (signature !== expectedSignature) return null;

  const userId = Number(userIdText);
  const expiresAt = Number(expiresAtText);

  if (!Number.isFinite(userId) || !Number.isFinite(expiresAt)) return null;
  if (Date.now() > expiresAt) return null;

  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = result[0];

  if (!user) return null;
  if (user.is_blocked) return null;

  return sanitizeUser(user);
}

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ message: "Database not available" });
      }

      const name = String(req.body?.name || "").trim();
      const email = String(req.body?.email || "").trim().toLowerCase();
      const phone = String(req.body?.phone || "").trim();
      const password = String(req.body?.password || "");

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
      }

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) {
        return res.status(409).json({ message: "Ese correo ya está registrado" });
      }

      const password_hash = await hashPassword(password);

      const inserted = await db
        .insert(users)
        .values({
          openId: `local_${randomUUID()}`,
          name,
          email,
          phone: phone || null,
          loginMethod: "local",
          password_hash,
          role: "user",
          last_signed_in: new Date(),
        })
        .returning();

      const createdUser = inserted[0];
      const token = createSessionToken(createdUser.id);
      const cookieOptions = getSessionCookieOptions(req);

      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: SESSION_MAX_AGE_MS,
      });

      return res.status(201).json({
        success: true,
        user: sanitizeUser(createdUser),
      });
    } catch (error) {
      console.error("[localAuth.register] Error:", error);
      return res.status(500).json({ message: "No se pudo crear la cuenta" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ message: "Database not available" });
      }

      const email = String(req.body?.email || "").trim().toLowerCase();
      const password = String(req.body?.password || "");

      if (!email || !password) {
        return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
      }

      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const user = result[0];

      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      if (user.is_blocked) {
        return res.status(403).json({ message: "Tu cuenta está bloqueada" });
      }

      const validPassword = await verifyPassword(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      await db
        .update(users)
        .set({
          last_signed_in: new Date(),
        })
        .where(eq(users.id, user.id));

      const token = createSessionToken(user.id);
      const cookieOptions = getSessionCookieOptions(req);

      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: SESSION_MAX_AGE_MS,
      });

      return res.json({
        success: true,
        user: sanitizeUser({
          ...user,
          last_signed_in: new Date(),
        }),
      });
    } catch (error) {
      console.error("[localAuth.login] Error:", error);
      return res.status(500).json({ message: "No se pudo iniciar sesión" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    clearSessionCookie(req, res);
    return res.json({ success: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const user = await authenticateLocalRequest(req);
      return res.json({
        user,
      });
    } catch (error) {
      console.error("[localAuth.me] Error:", error);
      return res.status(500).json({ message: "No se pudo obtener la sesión" });
    }
  });
}
