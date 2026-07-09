import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/inventory/product-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Product" };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Product"
        description="Add a new product to your inventory"
        backHref="/inventory/products"
      />
      <ProductForm mode="create" />
    </div>
  );
}
