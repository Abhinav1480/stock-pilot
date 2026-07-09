import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getPaginationParams, buildPaginationMeta } from "@/lib/api-helpers";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { error, context } = await requireAuth();
  if (error || !context) return error ?? errorResponse("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const entity = searchParams.get("entity");
  const action = searchParams.get("action");

  const where = {
    organizationId: context.organizationId,
    ...(entity && { entity }),
    ...(action && { action: action as never }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { name: true, email: true, image: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return successResponse(logs, buildPaginationMeta(total, page, limit));
}
