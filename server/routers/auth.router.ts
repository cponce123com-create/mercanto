// server/routers/auth.router.ts
// Endpoints de autenticación: register · login · logout · me

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db";
import { users } from "../../shared/schema";
import { hashPassword, verifyPassword, signToken, setAuthCookie, clearAuthCookie } from "../auth";
import { publicProc, protectedProc } from "../trpc/middleware";
import { t } from "../trpc/trpc";

// ─── Schemas de validación ───────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

// ─── Router ──────────────────────────────────────────────────────────────────

export const authRouter = t.router({

  /**
   * POST /auth.register
   * Crea una cuenta nueva con rol "user" por defecto.
   */
  register: publicProc
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      // Verificar si el email ya existe
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email.toLowerCase()))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe una cuenta con ese email.",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const id = nanoid();

      const [user] = await db
        .insert(users)
        .values({
          id,
          name: input.name.trim(),
          email: input.email.toLowerCase().trim(),
          passwordHash,
          phone: input.phone,
          role: "user",
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        });

      const token = await signToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      setAuthCookie(ctx.res, token);

      return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token, // también lo devolvemos para clientes que no usen cookies
      };
    }),

  /**
   * POST /auth.login
   * Verifica credenciales y emite un JWT.
   */
  login: publicProc
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase()))
        .limit(1);

      // Mismo mensaje para email no encontrado y contraseña incorrecta
      // (evita enumeración de usuarios)
      const invalidError = new TRPCError({
        code: "UNAUTHORIZED",
        message: "Email o contraseña incorrectos.",
      });

      if (!user) throw invalidError;
      if (!user.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Tu cuenta está suspendida. Contacta soporte.",
        });
      }

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) throw invalidError;

      const token = await signToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      setAuthCookie(ctx.res, token);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        token,
      };
    }),

  /**
   * POST /auth.logout
   * Elimina la cookie de sesión.
   */
  logout: publicProc.mutation(({ ctx }) => {
    clearAuthCookie(ctx.res);
    return { success: true };
  }),

  /**
   * GET /auth.me
   * Devuelve el usuario autenticado actual.
   * Requiere estar logueado.
   */
  me: protectedProc.query(async ({ ctx }) => {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, ctx.user.sub))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usuario no encontrado.",
      });
    }

    return user;
  }),

  /**
   * PATCH /auth.updateProfile
   * Actualiza nombre, teléfono y avatar del usuario autenticado.
   */
  updateProfile: protectedProc
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        phone: z.string().optional(),
        avatarUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [updated] = await db
        .update(users)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.sub))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          avatarUrl: users.avatarUrl,
        });

      return updated;
    }),

  /**
   * PATCH /auth.changePassword
   * Cambia la contraseña verificando la actual.
   */
  changePassword: protectedProc
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [user] = await db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, ctx.user.sub))
        .limit(1);

      const valid = await verifyPassword(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "La contraseña actual es incorrecta.",
        });
      }

      const newHash = await hashPassword(input.newPassword);
      await db
        .update(users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.sub));

      return { success: true };
    }),
});

export type AuthRouter = typeof authRouter;
