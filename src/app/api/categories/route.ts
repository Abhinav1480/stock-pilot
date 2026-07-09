import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
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

export async function GET(request: NextRequest) {
  const { error, context } = await requireAuth();
  if (error || !context) return error ?? errorResponse("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const { page, limit, search, skip } = getPaginationParams(searchParams);
  const all = searchParams.get("all") === "true";

  const where = {
    organizationId: context.organizationId,
    ...(search && { name: { contains: search, mode: "insensitive" as const } }),
  };

  if (all) {
    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return successResponse(categories);
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limit,
      include: { _count: { select: { products: true } } },
    }),
    prisma.category.count({ where }),
  ]);

  return successResponse(categories, buildPaginationMeta(total, page, limit));
}

export async function POST(request: NextRequest) {
  const { error, context } = await requireRole("MANAGER");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);

  try {
    const body = await request.json();
    const data = categorySchema.parse(body);
    const slug = slugify(data.name);

    const existing = await prisma.category.findUnique({
      where: {
        organizationId_slug: {
          organizationId: context.organizationId,
          slug,
        },
      },
    });

    if (existing) {
      return errorResponse("A category with this name already exists", 409);
    }

    const category = await prisma.category.create({
      data: {
        ...data,
        slug,
        organizationId: context.organizationId,
      },
    });

    await logAudit(context, "CREATE", "Category", category.id, {
      name: category.name,
    });

    return successResponse(category, undefined, 201);
  } catch (err) {
    if (err instanceof ZodError) return validationErrorResponse(err);
    console.error("Create category error:", err);
    return errorResponse("Internal server error", 500);
  }
}
