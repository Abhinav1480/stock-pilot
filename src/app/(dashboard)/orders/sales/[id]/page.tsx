import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SalesOrderDetailsClient } from "@/components/orders/sales-order-details";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sales Order Details" };

async function getSalesOrder(id: string, organizationId: string) {
  return prisma.salesOrder.findFirst({
    where: { id, organizationId },
    include: {
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

export default async function SalesOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) return notFound();

  const { id } = await params;
  const order = await getSalesOrder(id, session.user.organizationId);

  if (!order) return notFound();

  // Convert Decimals & Dates to plain types for React serialization compatibility
  const serializedOrder = {
    ...order,
    totalAmount: Number(order.totalAmount),
    tax: Number(order.tax),
    orderDate: order.orderDate.toISOString(),
    shippedDate: order.shippedDate?.toISOString() ?? null,
    deliveredDate: order.deliveredDate?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
    })),
  };

  return <SalesOrderDetailsClient order={serializedOrder} />;
}
