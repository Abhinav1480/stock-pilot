"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { salesOrderSchema, type SalesOrderInput } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";

export function SalesOrderForm() {
  const router = useRouter();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: { status: "DRAFT", tax: 0, items: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const tax = watch("tax") || 0;

  const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  const total = subtotal + Number(tax);

  const { data: products } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => (await fetch("/api/products?limit=100")).json().then(r => r.data ?? []),
  });

  const mutation = useMutation({
    mutationFn: async (data: SalesOrderInput) => {
      const res = await fetch("/api/orders/sales", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
    },
    onSuccess: () => {
      toast.success("Sales order created");
      router.push("/orders/sales");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data as SalesOrderInput))} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input placeholder="John Doe" {...register("customerName")} />
                {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Customer Email</Label>
                <Input type="email" placeholder="john@example.com" {...register("customerEmail")} />
                {errors.customerEmail && <p className="text-xs text-destructive">{errors.customerEmail.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Product</Label>
                    <Select
                      onValueChange={(v) => {
                        setValue(`items.${index}.productId`, v);
                        const prod = products?.find((p: any) => p.id === v);
                        if (prod) setValue(`items.${index}.unitPrice`, prod.sellPrice);
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                      <SelectContent>
                        {products?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.items?.[index]?.productId && <p className="text-xs text-destructive">Required</p>}
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Qty</Label>
                    <Input type="number" min="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Unit Price</Label>
                    <Input type="number" step="0.01" {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {errors.items?.root && <p className="text-sm text-destructive">{errors.items.root.message as string}</p>}
              <Button type="button" variant="outline" onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={watch("status")} onValueChange={(v: any) => setValue("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Shipping instructions..." {...register("notes")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Tax</span>
                <Input type="number" step="0.01" className="h-7 w-20 text-right" {...register("tax", { valueAsNumber: true })} />
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={mutation.isPending}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending || items.length === 0}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Order
        </Button>
      </div>
    </form>
  );
}
