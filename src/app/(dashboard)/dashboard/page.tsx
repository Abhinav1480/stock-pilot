import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getDashboardData(organizationId: string) {
  const [
    totalProducts,
    activeProducts,
    totalSuppliers,
    totalWarehouses,
    purchaseOrders,
    salesOrders,
    lowStockProducts,
    recentActivity,
    stockItems,
  ] = await Promise.all([
    prisma.product.count({ where: { organizationId } }),
    prisma.product.count({ where: { organizationId, status: "ACTIVE" } }),
    prisma.supplier.count({ where: { organizationId, isActive: true } }),
    prisma.warehouse.count({ where: { organizationId, isActive: true } }),
    prisma.purchaseOrder.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { supplier: { select: { name: true } } },
    }),
    prisma.salesOrder.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.product.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      include: {
        stockItems: {
          select: { quantity: true },
        },
        category: { select: { name: true, color: true } },
      },
    }),
    prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, image: true } } },
    }),
    prisma.stockItem.findMany({
      where: {
        product: { organizationId },
      },
      include: {
        product: { select: { name: true, costPrice: true, sellPrice: true } },
      },
    }),
  ]);

  // Calculate stock metrics
  const lowStock = lowStockProducts.filter((p) => {
    const totalQty = p.stockItems.reduce((sum, si) => sum + si.quantity, 0);
    return totalQty <= p.minStock && p.minStock > 0;
  });

  const totalInventoryValue = stockItems.reduce((sum, si) => {
    return sum + si.quantity * Number(si.product.costPrice);
  }, 0);

  const totalRetailValue = stockItems.reduce((sum, si) => {
    return sum + si.quantity * Number(si.product.sellPrice);
  }, 0);

  const totalPOValue = purchaseOrders.reduce(
    (sum, po) => sum + Number(po.totalAmount),
    0
  );
  const totalSOValue = salesOrders.reduce(
    (sum, so) => sum + Number(so.totalAmount),
    0
  );

  // Category distribution
  const categoryMap = new Map<string, { name: string; color: string; count: number }>();
  lowStockProducts.forEach((p) => {
    const catName = p.category?.name ?? "Uncategorized";
    const catColor = p.category?.color ?? "#6366f1";
    const existing = categoryMap.get(catName);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(catName, { name: catName, color: catColor, count: 1 });
    }
  });

  return {
    kpis: {
      totalProducts,
      activeProducts,
      totalSuppliers,
      totalWarehouses,
      lowStockCount: lowStock.length,
      totalInventoryValue,
      totalRetailValue,
      totalPOValue,
      totalSOValue,
    },
    recentPurchaseOrders: purchaseOrders.map((po) => ({
      id: po.id,
      orderNumber: po.orderNumber,
      status: po.status,
      totalAmount: Number(po.totalAmount),
      supplierName: po.supplier.name,
      createdAt: po.createdAt.toISOString(),
    })),
    recentSalesOrders: salesOrders.map((so) => ({
      id: so.id,
      orderNumber: so.orderNumber,
      status: so.status,
      totalAmount: Number(so.totalAmount),
      customerName: so.customerName,
      createdAt: so.createdAt.toISOString(),
    })),
    lowStockItems: lowStock.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      currentStock: p.stockItems.reduce((sum, si) => sum + si.quantity, 0),
      minStock: p.minStock,
      category: p.category?.name ?? "Uncategorized",
    })),
    recentActivity: recentActivity.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      userName: log.user.name,
      createdAt: log.createdAt.toISOString(),
      metadata: log.metadata as Record<string, unknown> | null,
    })),
    categoryDistribution: Array.from(categoryMap.values()),
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  const data = await getDashboardData(session.user.organizationId);

  return <DashboardContent data={data} />;
}
