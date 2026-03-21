import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useMemo, useEffect } from "react";
import { useLocation } from "wouter";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED") {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      localStorage.removeItem("mercanto-user-info");
      await utils.auth.me.invalidate();
      setLocation("/login");
    }
  }, [logoutMutation, utils, setLocation]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("mercanto-user-info", JSON.stringify(user));
      } else {
        localStorage.removeItem("mercanto-user-info");
      }
    }

    return {
      user,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
      isVendor: user?.role === "vendor" || user?.role === "admin",
      isAdmin: user?.role === "admin",
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (redirectOnUnauthenticated && !state.loading && !state.isAuthenticated) {
      setLocation(redirectPath);
    }
  }, [redirectOnUnauthenticated, state.loading, state.isAuthenticated, redirectPath, setLocation]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}

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
