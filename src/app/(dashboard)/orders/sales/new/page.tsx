import { PageHeader } from "@/components/shared/page-header";
import { SalesOrderForm } from "@/components/orders/sales-order-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Sales Order" };

export default function NewSalesOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Sales Order"
        description="Create a new sales order for a customer"
        backHref="/orders/sales"
      />
      <SalesOrderForm />
    </div>
  );
}
