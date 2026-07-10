import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-helpers";
import type { Role } from "@prisma/client";

export interface AuthenticatedContext {
  userId: string;
  organizationId: string;
  role: Role;
}

export async function getAuthContext(): Promise<AuthenticatedContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    role: session.user.role,
  };
}

export async function requireAuth() {
  const context = await getAuthContext();
  if (!context) {
    return { error: errorResponse("Unauthorized", 401), context: null };
  }
  return { error: null, context };
}

export async function requireRole(requiredRole: Role) {
  const { error, context } = await requireAuth();
  if (error || !context) {
    return { error: error ?? errorResponse("Unauthorized", 401), context: null };
  }

  const roleHierarchy: Record<string, number> = {
    OWNER: 4,
    ADMIN: 3,
    MANAGER: 2,
    VIEWER: 1,
  };

  if (
    (roleHierarchy[context.role] ?? 0) < (roleHierarchy[requiredRole] ?? 0)
  ) {
    return { error: errorResponse("Forbidden", 403), context: null };
  }

  return { error: null, context };
}

export async function logAudit(
  context: AuthenticatedContext,
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT",
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId: context.userId,
        organizationId: context.organizationId,
        metadata: metadata ? (metadata as any) : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
