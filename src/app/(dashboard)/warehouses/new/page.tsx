import { PageHeader } from "@/components/shared/page-header";
import { WarehouseForm } from "@/components/inventory/warehouse-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Warehouse" };

export default function NewWarehousePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Warehouse"
        description="Add a new warehouse facility"
        backHref="/warehouses"
      />
      <WarehouseForm mode="create" />
    </div>
  );
}
