import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { salesOrderSchema } from "@/lib/validations";
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
        { customerName: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: { _count: { select: { items: true } } },
    }),
    prisma.salesOrder.count({ where }),
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
    const data = salesOrderSchema.parse(body);

    const orderNumber = generateOrderNumber("SO");
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const order = await prisma.salesOrder.create({
      data: {
        orderNumber,
        status: data.status,
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        notes: data.notes,
        tax: data.tax,
        totalAmount: totalAmount + data.tax,
        organizationId: context.organizationId,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
    });

    await logAudit(context, "CREATE", "SalesOrder", order.id, {
      orderNumber: order.orderNumber,
      customer: order.customerName,
    });

    return successResponse(
      { ...order, totalAmount: Number(order.totalAmount), tax: Number(order.tax) },
      undefined,
      201
    );
  } catch (err) {
    if (err instanceof ZodError) return validationErrorResponse(err);
    console.error("Create SO error:", err);
    return errorResponse("Internal server error", 500);
  }
}
