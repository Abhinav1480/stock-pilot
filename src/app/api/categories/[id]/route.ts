import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-helpers";
import { requireAuth, requireRole, logAudit } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";
import { ZodError } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error, context } = await requireRole("MANAGER");
  if (error || !context) return error ?? errorResponse("Forbidden", 403);

  const { id } = await params;
  try {
    const body = await request.json();
    const data = categorySchema.partial().parse(body);

    const existing = await prisma.category.findFirst({
      where: { id, organizationId: context.organizationId },
    });
    if (!existing) return errorResponse("Category not found", 404);

    const slug = data.name ? slugify(data.name) : existing.slug;
    const updated = await prisma.category.update({
      where: { id },
      data: { ...data, slug },
    });

    await logAudit(context, "UPDATE", "Category", id, { name: updated.name });
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
  const category = await prisma.category.findFirst({
    where: { id, organizationId: context.organizationId },
    include: { _count: { select: { products: true } } },
  });

  if (!category) return errorResponse("Category not found", 404);
  if (category._count.products > 0) {
    return errorResponse("Cannot delete category with existing products", 400);
  }

  await prisma.category.delete({ where: { id } });
  await logAudit(context, "DELETE", "Category", id, { name: category.name });
  return successResponse({ deleted: true });
}
