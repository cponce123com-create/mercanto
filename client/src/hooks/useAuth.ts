// client/src/hooks/useAuth.ts
// Hook de autenticación para el cliente React

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { trpc } from "../lib/trpc"; // ajusta el path según tu proyecto

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "vendor" | "admin";
  avatarUrl?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isVendor: boolean;
  isAdmin: boolean;
};

// ─── Context ─────────────────────────────────────────────────────────────────

import { createContext as _createContext } from "react";
export const AuthContext = _createContext<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isVendor: false,
  isAdmin: false,
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const value: AuthState = {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isVendor: user?.role === "vendor" || user?.role === "admin",
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}

// ─── Hook de login ────────────────────────────────────────────────────────────

export function useLogin() {
  const utils = trpc.useUtils();
  const login = trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });
  return login;
}

// ─── Hook de register ────────────────────────────────────────────────────────

export function useRegister() {
  const utils = trpc.useUtils();
  const register = trpc.auth.register.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });
  return register;
}

// ─── Hook de logout ───────────────────────────────────────────────────────────

export function useLogout() {
  const utils = trpc.useUtils();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      // Limpia toda la caché de tRPC al cerrar sesión
      utils.invalidate();
    },
  });
  return logout;
}

// ─── Guard: redirige si no está autenticado ────────────────────────────────────

import { useEffect } from "react";
import { useLocation } from "wouter";

export function useRequireAuth(redirectTo = "/login") {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  return { user, isLoading };
}

export function useRequireVendor(redirectTo = "/") {
  const { user, isLoading, isVendor } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isVendor) {
      navigate(redirectTo);
    }
  }, [user, isLoading, isVendor, navigate, redirectTo]);

  return { user, isLoading, isVendor };
}

export function useRequireAdmin(redirectTo = "/") {
  const { user, isLoading, isAdmin } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate(redirectTo);
    }
  }, [user, isLoading, isAdmin, navigate, redirectTo]);

  return { user, isLoading, isAdmin };
}
