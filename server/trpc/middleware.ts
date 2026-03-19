// server/trpc/middleware.ts
// Middlewares tRPC: autenticación + control de acceso por rol

import { TRPCError } from "@trpc/server";
import { middleware, publicProcedure, t } from "./trpc";
import { verifyToken, getTokenFromRequest, type JWTPayload } from "../auth";

// ─── Contexto con usuario autenticado ────────────────────────────────────────

export type AuthContext = {
  user: JWTPayload;
};

// ─── Middleware: extrae y verifica el JWT ────────────────────────────────────

export const isAuthenticated = middleware(async ({ ctx, next }) => {
  const token = getTokenFromRequest(ctx.req);

  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Debes iniciar sesión para continuar.",
    });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Sesión inválida o expirada. Vuelve a iniciar sesión.",
    });
  }

  return next({
    ctx: { ...ctx, user: payload },
  });
});

// ─── Middleware: solo vendors o admins ───────────────────────────────────────

export const isVendor = middleware(async ({ ctx, next }) => {
  const token = getTokenFromRequest(ctx.req);
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No autenticado." });
  }

  if (payload.role !== "vendor" && payload.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Solo los vendedores pueden realizar esta acción.",
    });
  }

  return next({ ctx: { ...ctx, user: payload } });
});

// ─── Middleware: solo admins ─────────────────────────────────────────────────

export const isAdmin = middleware(async ({ ctx, next }) => {
  const token = getTokenFromRequest(ctx.req);
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No autenticado." });
  }

  if (payload.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acceso restringido a administradores.",
    });
  }

  return next({ ctx: { ...ctx, user: payload } });
});

// ─── Procedures listos para usar ─────────────────────────────────────────────

/** Cualquier usuario puede llamarlo */
export const publicProc = publicProcedure;

/** Solo usuarios autenticados (cualquier rol) */
export const protectedProc = t.procedure.use(isAuthenticated);

/** Solo vendors y admins */
export const vendorProc = t.procedure.use(isVendor);

/** Solo admins */
export const adminProc = t.procedure.use(isAdmin);
