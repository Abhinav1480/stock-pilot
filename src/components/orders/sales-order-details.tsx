"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  XCircle,
  Package,
  FileText,
  Clock,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
} from "@/lib/utils";

interface SalesOrderDetailsProps {
  order: any;
}

const statusSteps = [
  { status: "DRAFT", label: "Draft" },
  { status: "PENDING", label: "Pending" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

export function SalesOrderDetailsClient({ order: initialOrder }: SalesOrderDetailsProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);

  const mutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/orders/sales/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update status");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Order status updated successfully");
      setOrder((prev: any) => ({ ...prev, status: data.data.status }));
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleStatusChange = (status: string) => {
    mutation.mutate(status);
  };

  const getNextStatus = () => {
    switch (order.status) {
      case "DRAFT":
        return "PENDING";
      case "PENDING":
        return "CONFIRMED";
      case "CONFIRMED":
        return "PROCESSING";
      case "PROCESSING":
        return "SHIPPED";
      case "SHIPPED":
        return "DELIVERED";
      default:
        return null;
    }
  };

  const getNextStatusLabel = () => {
    switch (order.status) {
      case "DRAFT":
        return "Submit Order";
      case "PENDING":
        return "Confirm Order";
      case "CONFIRMED":
        return "Start Processing";
      case "PROCESSING":
        return "Mark as Shipped";
      case "SHIPPED":
        return "Mark as Delivered";
      default:
        return "";
    }
  };

  const nextStatus = getNextStatus();
  const currentStepIndex = statusSteps.findIndex((s) => s.status === order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => router.push("/orders/sales")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sales Orders
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Order {order.orderNumber}
            </h1>
            <Badge variant="secondary" className={getOrderStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <Button
              variant="destructive"
              onClick={() => handleStatusChange("CANCELLED")}
              disabled={mutation.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          )}

          {nextStatus && (
            <Button
              onClick={() => handleStatusChange(nextStatus)}
              disabled={mutation.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {getNextStatusLabel()}
            </Button>
          )}
        </div>
      </div>

      {/* Interactive Timeline */}
      {order.status !== "CANCELLED" && (
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.status} className="flex-1 flex items-center group relative">
                  <div className="flex flex-col items-center md:items-start gap-1">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                    >
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-medium mt-1 ${
                        isCompleted ? "text-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`hidden md:block absolute left-8 top-3.5 right-4 h-0.5 -z-10 ${
                        idx < currentStepIndex ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Grid details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* General details */}
        <Card className="md:col-span-2 space-y-6 p-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Order Items
            </h3>
            <div className="relative overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3 text-right">Quantity</th>
                    <th className="pb-3 text-right">Unit Price</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {order.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="py-4 font-medium text-foreground">
                        {item.product.name}
                      </td>
                      <td className="py-4 text-muted-foreground font-mono text-xs">
                        {item.product.sku}
                      </td>
                      <td className="py-4 text-right font-medium">
                        {item.quantity} {item.product.unit}
                      </td>
                      <td className="py-4 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-4 text-right font-semibold">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Pricing Summary */}
          <div className="flex flex-col items-end space-y-2">
            <div className="flex justify-between w-64 text-sm text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-medium text-foreground">
                {formatCurrency(order.totalAmount - order.tax)}
              </span>
            </div>
            <div className="flex justify-between w-64 text-sm text-muted-foreground">
              <span>Tax (calculated):</span>
              <span className="font-medium text-foreground">
                {formatCurrency(order.tax)}
              </span>
            </div>
            <div className="flex justify-between w-64 text-base font-semibold border-t border-border pt-2 mt-2">
              <span>Total:</span>
              <span className="text-primary">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Customer Name</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              {order.customerEmail && (
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">
                    {order.customerEmail}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Timeline & Dates
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Order Date</span>
                <span className="font-medium">{formatDate(order.orderDate)}</span>
              </div>
              {order.shippedDate && (
                <div>
                  <span className="text-xs text-muted-foreground block">Shipped Date</span>
                  <span className="font-medium text-purple-500">
                    {formatDate(order.shippedDate)}
                  </span>
                </div>
              )}
              {order.deliveredDate && (
                <div>
                  <span className="text-xs text-muted-foreground block">Delivered Date</span>
                  <span className="font-medium text-emerald-500">
                    {formatDate(order.deliveredDate)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {order.notes && (
            <Card className="p-6">
              <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Notes
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {order.notes}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
