import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { requireAuth, requireRole, logAudit } from "@/lib/auth-helpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireAuth();
  if (error || !context) return error ?? errorResponse("Unauthorized", 401);

  const { id } = await params;

  const order = await prisma.purchaseOrder.findFirst({
    where: { id, organizationId: context.organizationId },
    include: {
      supplier: true,
      items: {
        include: {
          product: {
            select: { name: true, sku: true, unit: true },
          },
        },
      },
    },
  });

  if (!order) return errorResponse("Purchase order not found", 404);

  return successResponse({
    ...order,
    totalAmount: Number(order.totalAmount),
    tax: Number(order.tax),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
    })),
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireRole("MANAGER");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, notes } = body;

    const existing = await prisma.purchaseOrder.findFirst({
      where: { id, organizationId: context.organizationId },
    });

    if (!existing) return errorResponse("Purchase order not found", 404);

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    await logAudit(context, "UPDATE", "PurchaseOrder", id, {
      orderNumber: updated.orderNumber,
      status: updated.status,
    });

    return successResponse({
      ...updated,
      totalAmount: Number(updated.totalAmount),
      tax: Number(updated.tax),
    });
  } catch (err) {
    console.error("Update PO error:", err);
    return errorResponse("Internal server error", 500);
  }
}
