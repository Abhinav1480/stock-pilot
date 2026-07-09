import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { WarehouseForm } from "@/components/inventory/warehouse-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Warehouse" };

export default async function EditWarehousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) return notFound();

  const { id } = await params;
  const warehouse = await prisma.warehouse.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });

  if (!warehouse) return notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${warehouse.name}`}
        description="Update warehouse information"
        backHref="/warehouses"
      />
      <WarehouseForm
        mode="edit"
        initialData={{
          ...warehouse,
          address: warehouse.address ?? "",
          city: warehouse.city ?? "",
          state: warehouse.state ?? "",
          country: warehouse.country ?? "",
          postalCode: warehouse.postalCode ?? "",
        }}
      />
    </div>
  );
}
