import { PageHeader } from "@/components/shared/page-header";
import { SupplierForm } from "@/components/inventory/supplier-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Supplier" };

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Supplier"
        description="Add a new supplier to your directory"
        backHref="/suppliers"
      />
      <SupplierForm mode="create" />
    </div>
  );
}
