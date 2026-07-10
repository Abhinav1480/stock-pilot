import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PurchaseOrderDetailsClient } from "@/components/orders/purchase-order-details";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Purchase Order Details" };

async function getPurchaseOrder(id: string, organizationId: string) {
  return prisma.purchaseOrder.findFirst({
    where: { id, organizationId },
    include: {
      supplier: true,
      items: {
        include: {
          product: {
            select: { name: true, sku: true, unit: true },
          },
        },
      },
    },
  });
}

export default async function PurchaseOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) return notFound();

  const { id } = await params;
  const order = await getPurchaseOrder(id, session.user.organizationId);

  if (!order) return notFound();

  // Convert Decimals & Dates to plain types for React serialization compatibility
  const serializedOrder = {
    ...order,
    totalAmount: Number(order.totalAmount),
    tax: Number(order.tax),
    orderDate: order.orderDate.toISOString(),
    expectedDate: order.expectedDate?.toISOString() ?? null,
    receivedDate: order.receivedDate?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
    })),
  };

  return <PurchaseOrderDetailsClient order={serializedOrder} />;
}
