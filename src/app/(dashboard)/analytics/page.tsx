import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsContent } from "@/components/analytics/analytics-content";

export const metadata: Metadata = { title: "Analytics" };

async function getAnalyticsData(organizationId: string) {
  const [
    productsByStatus,
    ordersByStatus,
    topProducts,
    recentMovements,
    monthlyPurchases,
    monthlySales,
  ] = await Promise.all([
    prisma.product.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: true,
    }),
    prisma.purchaseOrder.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.product.findMany({
      where: { organizationId, status: "ACTIVE" },
      include: { stockItems: { select: { quantity: true } } },
      take: 10,
    }),
    prisma.stockMovement.findMany({
      where: { stockItem: { product: { organizationId } } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        stockItem: {
          include: { product: { select: { name: true } } },
        },
      },
    }),
    prisma.purchaseOrder.findMany({
      where: { organizationId },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.salesOrder.findMany({
      where: { organizationId },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Aggregate monthly revenue
  const monthlyData = new Map<string, { purchases: number; sales: number }>();
  monthlyPurchases.forEach((po) => {
    const key = `${po.createdAt.getFullYear()}-${String(po.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthlyData.get(key) ?? { purchases: 0, sales: 0 };
    entry.purchases += Number(po.totalAmount);
    monthlyData.set(key, entry);
  });
  monthlySales.forEach((so) => {
    const key = `${so.createdAt.getFullYear()}-${String(so.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthlyData.get(key) ?? { purchases: 0, sales: 0 };
    entry.sales += Number(so.totalAmount);
    monthlyData.set(key, entry);
  });

  // Movement types distribution
  const movementTypes = new Map<string, number>();
  recentMovements.forEach((m) => {
    movementTypes.set(m.type, (movementTypes.get(m.type) ?? 0) + 1);
  });

  return {
    productsByStatus: productsByStatus.map((p) => ({
      status: p.status,
      count: p._count,
    })),
    ordersByStatus: ordersByStatus.map((o) => ({
      status: o.status,
      count: o._count,
      total: Number(o._sum.totalAmount ?? 0),
    })),
    topProducts: topProducts
      .map((p) => ({
        name: p.name,
        stock: p.stockItems.reduce((s, si) => s + si.quantity, 0),
      }))
      .sort((a, b) => b.stock - a.stock),
    monthlyRevenue: Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({ month, ...data })),
    movementTypes: Array.from(movementTypes.entries()).map(([type, count]) => ({
      type,
      count,
    })),
  };
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  const data = await getAnalyticsData(session.user.organizationId);
  return <AnalyticsContent data={data} />;
}
