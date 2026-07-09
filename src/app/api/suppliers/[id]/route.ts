import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { supplierSchema } from "@/lib/validations";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-helpers";
import { requireAuth, requireRole, logAudit } from "@/lib/auth-helpers";
import { ZodError } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireAuth();
  if (error || !context) return error ?? errorResponse("Unauthorized", 401);
  const { id } = await params;

  const supplier = await prisma.supplier.findFirst({
    where: { id, organizationId: context.organizationId },
    include: {
      products: { select: { id: true, name: true, sku: true, status: true }, take: 10 },
      purchaseOrders: { select: { id: true, orderNumber: true, status: true, totalAmount: true }, take: 10, orderBy: { createdAt: "desc" } },
    },
  });

  if (!supplier) return errorResponse("Supplier not found", 404);
  return successResponse(supplier);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireRole("MANAGER");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);
  const { id } = await params;

  try {
    const body = await request.json();
    const data = supplierSchema.partial().parse(body);

    const existing = await prisma.supplier.findFirst({
      where: { id, organizationId: context.organizationId },
    });
    if (!existing) return errorResponse("Supplier not found", 404);

    const cleaned = {
      ...data,
      email: data.email === "" ? null : data.email,
      website: data.website === "" ? null : data.website,
    };

    const updated = await prisma.supplier.update({ where: { id }, data: cleaned });
    await logAudit(context, "UPDATE", "Supplier", id, { name: updated.name });
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

  const supplier = await prisma.supplier.findFirst({
    where: { id, organizationId: context.organizationId },
  });
  if (!supplier) return errorResponse("Supplier not found", 404);

  await prisma.supplier.delete({ where: { id } });
  await logAudit(context, "DELETE", "Supplier", id, { name: supplier.name });
  return successResponse({ deleted: true });
}
