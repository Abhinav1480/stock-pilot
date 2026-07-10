"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Package, Warehouse, Layers } from "lucide-react";

interface StockItem {
  id: string;
  quantity: number;
  reserved: number;
  batch: string | null;
  expiryDate: string | null;
  product: {
    name: string;
    sku: string;
    unit: string;
  };
  zone: {
    name: string;
    warehouse: {
      name: string;
      code: string;
    };
  };
}

export default function StockLevelsPage() {
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fetch warehouses for filter dropdown
  const { data: warehouses } = useQuery<any[]>({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/warehouses");
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch stock levels
  const { data: stockItemsData, isLoading } = useQuery<{ data: StockItem[] }>({
    queryKey: ["stock-levels", warehouseId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (warehouseId !== "ALL") params.append("warehouseId", warehouseId);
      if (search) params.append("search", search);
      const res = await fetch(`/api/inventory/stock?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch stock levels");
      return res.json();
    },
  });

  const stockItems = stockItemsData?.data || [];

  const columns: Column<StockItem>[] = [
    {
      key: "product",
      title: "Product",
      render: (item) => (
        <div>
          <div className="font-semibold text-foreground">{item.product.name}</div>
          <div className="text-xs text-muted-foreground">SKU: {item.product.sku}</div>
        </div>
      ),
    },
    {
      key: "warehouse",
      title: "Warehouse",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">
            {item.zone.warehouse.name} ({item.zone.warehouse.code})
          </span>
        </div>
      ),
    },
    {
      key: "zone",
      title: "Zone / Location",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{item.zone.name}</span>
        </div>
      ),
    },
    {
      key: "batch",
      title: "Batch / Lot",
      render: (item) => (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
          {item.batch || "N/A"}
        </code>
      ),
    },
    {
      key: "quantity",
      title: "Quantity Available",
      render: (item) => {
        const available = item.quantity - item.reserved;
        return (
          <div>
            <div className="font-semibold text-foreground">
              {item.quantity} {item.product.unit}
            </div>
            {item.reserved > 0 && (
              <div className="text-xs text-muted-foreground">
                ({available} available, {item.reserved} reserved)
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      render: (item) => {
        const available = item.quantity - item.reserved;
        if (available <= 0) {
          return <Badge variant="destructive">Out of Stock</Badge>;
        }
        if (available < 10) {
          return <Badge variant="warning">Low Stock</Badge>;
        }
        return <Badge variant="success">In Stock</Badge>;
      },
    },
  ];

  const totalQuantity = stockItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalReserved = stockItems.reduce((acc, curr) => acc + curr.reserved, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Levels"
        description="Track product inventory quantities across warehouses and storage zones."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Stock Units</p>
              <h3 className="text-2xl font-bold">{isLoading ? "..." : totalQuantity}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
              <Loader2 className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reserved Stock</p>
              <h3 className="text-2xl font-bold">{isLoading ? "..." : totalReserved}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <Layers className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unique Batches</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? "..." : new Set(stockItems.map((i) => i.batch).filter(Boolean)).size}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={stockItems}
        total={stockItems.length}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        searchPlaceholder="Search products or SKUs..."
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSearch={setSearch}
        rowKey={(item) => item.id}
        filters={
          <div className="flex items-center gap-2">
            <Select value={warehouseId} onValueChange={(v) => setWarehouseId(v ?? "")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Warehouses</SelectItem>
                {warehouses?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
