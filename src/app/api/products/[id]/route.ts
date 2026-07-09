import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-helpers";
import { requireAuth, requireRole, logAudit } from "@/lib/auth-helpers";
import { ZodError } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireAuth();
  if (error || !context) return error ?? errorResponse("Unauthorized", 401);

  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, organizationId: context.organizationId },
    include: {
      category: { select: { id: true, name: true, color: true } },
      supplier: { select: { id: true, name: true } },
      stockItems: {
        include: {
          zone: {
            include: {
              warehouse: { select: { id: true, name: true, code: true } },
            },
          },
        },
      },
    },
  });

  if (!product) return errorResponse("Product not found", 404);

  return successResponse({
    ...product,
    costPrice: Number(product.costPrice),
    sellPrice: Number(product.sellPrice),
    weight: product.weight ? Number(product.weight) : null,
    totalStock: product.stockItems.reduce((sum, si) => sum + si.quantity, 0),
    reservedStock: product.stockItems.reduce((sum, si) => sum + si.reserved, 0),
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireRole("MANAGER");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);

  const { id } = await params;

  try {
    const body = await request.json();
    const data = productSchema.partial().parse(body);

    const existing = await prisma.product.findFirst({
      where: { id, organizationId: context.organizationId },
    });

    if (!existing) return errorResponse("Product not found", 404);

    // Check SKU uniqueness if changed
    if (data.sku && data.sku !== existing.sku) {
      const skuConflict = await prisma.product.findUnique({
        where: {
          organizationId_sku: {
            organizationId: context.organizationId,
            sku: data.sku,
          },
        },
      });
      if (skuConflict) {
        return errorResponse("A product with this SKU already exists", 409);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, color: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    await logAudit(context, "UPDATE", "Product", id, {
      name: updated.name,
      changes: Object.keys(data),
    });

    return successResponse({
      ...updated,
      costPrice: Number(updated.costPrice),
      sellPrice: Number(updated.sellPrice),
      weight: updated.weight ? Number(updated.weight) : null,
    });
  } catch (err) {
    if (err instanceof ZodError) return validationErrorResponse(err);
    console.error("Update product error:", err);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireRole("ADMIN");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);

  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, organizationId: context.organizationId },
  });

  if (!product) return errorResponse("Product not found", 404);

  await prisma.product.delete({ where: { id } });

  await logAudit(context, "DELETE", "Product", id, {
    name: product.name,
    sku: product.sku,
  });

  return successResponse({ deleted: true });
}
