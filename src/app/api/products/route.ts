import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api-helpers";
import { requireAuth, requireRole, logAudit } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";
import { ZodError } from "zod";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error, context } = await requireAuth();
  if (error || !context) return error ?? errorResponse("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const { page, limit, search, sortBy, sortOrder, skip } =
    getPaginationParams(searchParams);

  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const supplierId = searchParams.get("supplierId");

  const where: Prisma.ProductWhereInput = {
    organizationId: context.organizationId,
    ...(status && { status: status as Prisma.EnumProductStatusFilter }),
    ...(categoryId && { categoryId }),
    ...(supplierId && { supplierId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, color: true } },
        supplier: { select: { id: true, name: true } },
        stockItems: { select: { quantity: true, reserved: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const productsWithStock = products.map((p) => ({
    ...p,
    costPrice: Number(p.costPrice),
    sellPrice: Number(p.sellPrice),
    weight: p.weight ? Number(p.weight) : null,
    totalStock: p.stockItems.reduce((sum, si) => sum + si.quantity, 0),
    reservedStock: p.stockItems.reduce((sum, si) => sum + si.reserved, 0),
    stockItems: undefined,
  }));

  return successResponse(productsWithStock, buildPaginationMeta(total, page, limit));
}

export async function POST(request: NextRequest) {
  const { error, context } = await requireRole("MANAGER");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);

  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    // Check SKU uniqueness
    const existing = await prisma.product.findUnique({
      where: {
        organizationId_sku: {
          organizationId: context.organizationId,
          sku: data.sku,
        },
      },
    });

    if (existing) {
      return errorResponse("A product with this SKU already exists", 409);
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        organizationId: context.organizationId,
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    await logAudit(context, "CREATE", "Product", product.id, {
      name: product.name,
      sku: product.sku,
    });

    return successResponse(
      {
        ...product,
        costPrice: Number(product.costPrice),
        sellPrice: Number(product.sellPrice),
        weight: product.weight ? Number(product.weight) : null,
      },
      undefined,
      201
    );
  } catch (err) {
    if (err instanceof ZodError) return validationErrorResponse(err);
    console.error("Create product error:", err);
    return errorResponse("Internal server error", 500);
  }
}
