"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@prisma/client";

export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}

export function useRole() {
  const { user } = useCurrentUser();

  const hasRole = (requiredRole: Role): boolean => {
    if (!user) return false;
    const hierarchy: Record<string, number> = {
      OWNER: 4,
      ADMIN: 3,
      MANAGER: 2,
      VIEWER: 1,
    };
    return (hierarchy[user.role] ?? 0) >= (hierarchy[requiredRole] ?? 0);
  };

  return {
    role: user?.role ?? null,
    isOwner: user?.role === "OWNER",
    isAdmin: hasRole("ADMIN"),
    isManager: hasRole("MANAGER"),
    hasRole,
  };
}
