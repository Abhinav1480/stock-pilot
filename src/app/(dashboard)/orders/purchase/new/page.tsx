import { PageHeader } from "@/components/shared/page-header";
import { PurchaseOrderForm } from "@/components/orders/purchase-order-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Purchase Order" };

export default function NewPurchaseOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Purchase Order"
        description="Create a new purchase order for a supplier"
        backHref="/orders/purchase"
      />
      <PurchaseOrderForm />
    </div>
  );
}
