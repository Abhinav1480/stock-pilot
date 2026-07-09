import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { purchaseOrderSchema } from "@/lib/validations";
import {
  successResponse, errorResponse, validationErrorResponse,
  getPaginationParams, buildPaginationMeta,
} from "@/lib/api-helpers";
import { requireAuth, requireRole, logAudit } from "@/lib/auth-helpers";
import { generateOrderNumber } from "@/lib/utils";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  const { error, context } = await requireAuth();
  if (error || !context) return error ?? errorResponse("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const { page, limit, search, sortBy, sortOrder, skip } = getPaginationParams(searchParams);
  const status = searchParams.get("status");

  const where = {
    organizationId: context.organizationId,
    ...(status && { status: status as never }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: "insensitive" as const } },
        { supplier: { name: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        supplier: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  const mapped = orders.map((o) => ({
    ...o,
    totalAmount: Number(o.totalAmount),
    tax: Number(o.tax),
    itemCount: o._count.items,
    _count: undefined,
  }));

  return successResponse(mapped, buildPaginationMeta(total, page, limit));
}

export async function POST(request: NextRequest) {
  const { error, context } = await requireRole("MANAGER");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);

  try {
    const body = await request.json();
    const data = purchaseOrderSchema.parse(body);

    const orderNumber = generateOrderNumber("PO");
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const order = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          orderNumber,
          status: data.status,
          notes: data.notes,
          expectedDate: data.expectedDate,
          tax: data.tax,
          totalAmount: totalAmount + data.tax,
          organizationId: context.organizationId,
          supplierId: data.supplierId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          supplier: { select: { name: true } },
          items: { include: { product: { select: { name: true, sku: true } } } },
        },
      });
      return po;
    });

    await logAudit(context, "CREATE", "PurchaseOrder", order.id, {
      orderNumber: order.orderNumber,
      supplier: order.supplier.name,
    });

    return successResponse(
      { ...order, totalAmount: Number(order.totalAmount), tax: Number(order.tax) },
      undefined,
      201
    );
  } catch (err) {
    if (err instanceof ZodError) return validationErrorResponse(err);
    console.error("Create PO error:", err);
    return errorResponse("Internal server error", 500);
  }
}
