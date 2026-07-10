import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/inventory/product-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) return notFound();

  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });

  if (!product) return notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${product.name}`}
        description="Update product information and pricing"
        backHref="/inventory/products"
      />
      <ProductForm
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          description: product.description ?? "",
          image: product.image ?? null,
          barcode: product.barcode ?? "",
          unit: product.unit,
          costPrice: Number(product.costPrice),
          sellPrice: Number(product.sellPrice),
          minStock: product.minStock,
          maxStock: product.maxStock,
          status: product.status,
          weight: product.weight ? Number(product.weight) : null,
          dimensions: product.dimensions ?? "",
          tags: product.tags,
          categoryId: product.categoryId,
          supplierId: product.supplierId,
        }}
      />
    </div>
  );
}
