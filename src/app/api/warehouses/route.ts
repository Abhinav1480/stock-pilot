import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { warehouseSchema } from "@/lib/validations";
import {
  successResponse, errorResponse, validationErrorResponse,
  getPaginationParams, buildPaginationMeta,
} from "@/lib/api-helpers";
import { requireAuth, requireRole, logAudit } from "@/lib/auth-helpers";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  const { error, context } = await requireAuth();
  if (error || !context) return error ?? errorResponse("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const { page, limit, search, skip } = getPaginationParams(searchParams);
  const all = searchParams.get("all") === "true";

  const where = {
    organizationId: context.organizationId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { code: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  if (all) {
    const warehouses = await prisma.warehouse.findMany({
      where: { ...where, isActive: true },
      orderBy: { name: "asc" },
      include: { zones: { select: { id: true, name: true, code: true } } },
    });
    return successResponse(warehouses);
  }

  const [warehouses, total] = await Promise.all([
    prisma.warehouse.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        zones: {
          include: {
            _count: { select: { stockItems: true } },
            stockItems: { select: { quantity: true } },
          },
        },
      },
    }),
    prisma.warehouse.count({ where }),
  ]);

  const enriched = warehouses.map((w) => ({
    ...w,
    totalZones: w.zones.length,
    totalItems: w.zones.reduce(
      (sum, z) => sum + z.stockItems.reduce((s, si) => s + si.quantity, 0),
      0
    ),
    zones: w.zones.map((z) => ({
      ...z,
      itemCount: z._count.stockItems,
      totalQuantity: z.stockItems.reduce((s, si) => s + si.quantity, 0),
      stockItems: undefined,
      _count: undefined,
    })),
  }));

  return successResponse(enriched, buildPaginationMeta(total, page, limit));
}

export async function POST(request: NextRequest) {
  const { error, context } = await requireRole("MANAGER");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);

  try {
    const body = await request.json();
    const data = warehouseSchema.parse(body);

    const existing = await prisma.warehouse.findUnique({
      where: {
        organizationId_code: {
          organizationId: context.organizationId,
          code: data.code,
        },
      },
    });
    if (existing) return errorResponse("Warehouse code already exists", 409);

    const warehouse = await prisma.warehouse.create({
      data: { ...data, organizationId: context.organizationId },
    });

    await logAudit(context, "CREATE", "Warehouse", warehouse.id, { name: warehouse.name });
    return successResponse(warehouse, undefined, 201);
  } catch (err) {
    if (err instanceof ZodError) return validationErrorResponse(err);
    return errorResponse("Internal server error", 500);
  }
}
