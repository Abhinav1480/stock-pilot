import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { SupplierForm } from "@/components/inventory/supplier-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Supplier" };

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) return notFound();

  const { id } = await params;
  const supplier = await prisma.supplier.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });

  if (!supplier) return notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${supplier.name}`}
        description="Update supplier information"
        backHref="/suppliers"
      />
      <SupplierForm
        mode="edit"
        initialData={{
          ...supplier,
          email: supplier.email ?? "",
          phone: supplier.phone ?? "",
          address: supplier.address ?? "",
          city: supplier.city ?? "",
          state: supplier.state ?? "",
          country: supplier.country ?? "",
          postalCode: supplier.postalCode ?? "",
          contactName: supplier.contactName ?? "",
          website: supplier.website ?? "",
          notes: supplier.notes ?? "",
        }}
      />
    </div>
  );
}
