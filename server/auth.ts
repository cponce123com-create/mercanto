// server/auth.ts
// Utilidades de autenticación: JWT (jose) + bcrypt-style hashing

import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "mercanto-dev-secret-change-in-production"
);

const ALGORITHM = "HS256";
const ACCESS_TTL = "7d"; // token de acceso
const COOKIE_NAME = "mercanto_session";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type JWTPayload = {
  sub: string;       // userId
  email: string;
  role: "user" | "vendor" | "admin";
  jti: string;       // token id único (para revocación futura)
};

// ─── JWT ─────────────────────────────────────────────────────────────────────

export async function signToken(payload: Omit<JWTPayload, "jti">): Promise<string> {
  return new SignJWT({ ...payload, jti: nanoid() })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ─── Password hashing (Web Crypto — sin dependencias nativas) ─────────────────

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveKey(password, salt);
  const saltB64 = Buffer.from(salt).toString("base64");
  const hashB64 = Buffer.from(hash).toString("base64");
  return `${saltB64}:${hashB64}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(":");
  if (!saltB64 || !hashB64) return false;
  const salt = Buffer.from(saltB64, "base64");
  const hash = await deriveKey(password, salt);
  const candidate = Buffer.from(hash).toString("base64");
  return candidate === hashB64;
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

export function setAuthCookie(res: any, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
    path: "/",
  });
}

export function clearAuthCookie(res: any) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function getTokenFromRequest(req: any): string | null {
  // 1. Cookie (preferido)
  const cookie = req.cookies?.[COOKIE_NAME];
  if (cookie) return cookie;
  // 2. Bearer header (para clientes móviles / API)
  const auth = req.headers?.authorization as string | undefined;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export { COOKIE_NAME };
