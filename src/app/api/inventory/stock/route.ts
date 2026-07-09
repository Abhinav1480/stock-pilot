import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("warehouseId");
    const search = searchParams.get("search") || "";

    const whereClause: any = {
      product: {
        organizationId: session.user.organizationId,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      },
    };

    if (warehouseId) {
      whereClause.zone = {
        warehouseId: warehouseId,
      };
    }

    const stockItems = await prisma.stockItem.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            unit: true,
          },
        },
        zone: {
          include: {
            warehouse: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    });

    return successResponse(stockItems);
  } catch (error: any) {
    console.error("Failed to fetch stock items:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
