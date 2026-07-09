import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { supplierSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api-helpers";
import { requireAuth, requireRole, logAudit } from "@/lib/auth-helpers";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  const { error, context } = await requireAuth();
  if (error || !context) return error ?? errorResponse("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const { page, limit, search, sortBy, sortOrder, skip } = getPaginationParams(searchParams);
  const all = searchParams.get("all") === "true";

  const where = {
    organizationId: context.organizationId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { contactName: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  if (all) {
    const suppliers = await prisma.supplier.findMany({
      where: { ...where, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return successResponse(suppliers);
  }

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: { _count: { select: { products: true, purchaseOrders: true } } },
    }),
    prisma.supplier.count({ where }),
  ]);

  return successResponse(suppliers, buildPaginationMeta(total, page, limit));
}

export async function POST(request: NextRequest) {
  const { error, context } = await requireRole("MANAGER");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);

  try {
    const body = await request.json();
    const data = supplierSchema.parse(body);

    // Clean empty strings to null
    const cleanedData = {
      ...data,
      email: data.email || null,
      website: data.website || null,
    };

    const supplier = await prisma.supplier.create({
      data: {
        ...cleanedData,
        organizationId: context.organizationId,
      },
    });

    await logAudit(context, "CREATE", "Supplier", supplier.id, { name: supplier.name });
    return successResponse(supplier, undefined, 201);
  } catch (err) {
    if (err instanceof ZodError) return validationErrorResponse(err);
    console.error("Create supplier error:", err);
    return errorResponse("Internal server error", 500);
  }
}
