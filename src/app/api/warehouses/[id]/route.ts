import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { warehouseSchema } from "@/lib/validations";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-helpers";
import { requireAuth, requireRole, logAudit } from "@/lib/auth-helpers";
import { ZodError } from "zod";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireAuth();
  if (error || !context) return error ?? errorResponse("Unauthorized", 401);
  const { id } = await params;

  const warehouse = await prisma.warehouse.findFirst({
    where: { id, organizationId: context.organizationId },
    include: {
      zones: {
        include: {
          stockItems: {
            include: { product: { select: { id: true, name: true, sku: true } } },
          },
        },
      },
    },
  });
  if (!warehouse) return errorResponse("Warehouse not found", 404);
  return successResponse(warehouse);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireRole("MANAGER");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);
  const { id } = await params;

  try {
    const body = await request.json();
    const data = warehouseSchema.partial().parse(body);

    const existing = await prisma.warehouse.findFirst({
      where: { id, organizationId: context.organizationId },
    });
    if (!existing) return errorResponse("Warehouse not found", 404);

    const updated = await prisma.warehouse.update({ where: { id }, data });
    await logAudit(context, "UPDATE", "Warehouse", id, { name: updated.name });
    return successResponse(updated);
  } catch (err) {
    if (err instanceof ZodError) return validationErrorResponse(err);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireRole("ADMIN");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);
  const { id } = await params;

  const warehouse = await prisma.warehouse.findFirst({
    where: { id, organizationId: context.organizationId },
  });
  if (!warehouse) return errorResponse("Warehouse not found", 404);

  await prisma.warehouse.delete({ where: { id } });
  await logAudit(context, "DELETE", "Warehouse", id, { name: warehouse.name });
  return successResponse({ deleted: true });
}
