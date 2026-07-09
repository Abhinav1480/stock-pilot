import type { Role } from "@prisma/client";
import { ROLE_HIERARCHY } from "./constants";

export function hasPermission(
  userRole: Role,
  requiredRole: Role
): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

export function canManageUsers(role: Role): boolean {
  return hasPermission(role, "ADMIN");
}

export function canManageInventory(role: Role): boolean {
  return hasPermission(role, "MANAGER");
}

export function canViewReports(role: Role): boolean {
  return hasPermission(role, "VIEWER");
}

export function canDeleteRecords(role: Role): boolean {
  return hasPermission(role, "ADMIN");
}

export function canManageOrganization(role: Role): boolean {
  return hasPermission(role, "OWNER");
}

export function canCreateOrders(role: Role): boolean {
  return hasPermission(role, "MANAGER");
}

export function canApproveOrders(role: Role): boolean {
  return hasPermission(role, "ADMIN");
}
