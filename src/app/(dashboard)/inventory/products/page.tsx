"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Download, MoreHorizontal, Edit, Trash2, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AiAddProductDialog } from "@/components/inventory/ai-product-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrency,
  getStockStatus,
  getStockStatusColor,
} from "@/lib/utils";
import { PRODUCT_STATUS_LABELS } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  sku: string;
  status: string;
  costPrice: number;
  sellPrice: number;
  minStock: number;
  maxStock: number;
  totalStock: number;
  category: { id: string; name: string; color: string } | null;
  supplier: { id: string; name: string } | null;
  createdAt: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, pageSize, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/products?${params}`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  const columns: Column<Product>[] = [
    {
      key: "name",
      title: "Product",
      sortable: true,
      render: (product) => (
        <div className="flex flex-col">
          <span className="font-medium">{product.name}</span>
          <span className="text-xs text-muted-foreground">{product.sku}</span>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      render: (product) =>
        product.category ? (
          <Badge
            variant="secondary"
            className="text-xs"
            style={{
              backgroundColor: `${product.category.color}15`,
              color: product.category.color,
            }}
          >
            {product.category.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "totalStock",
      title: "Stock",
      sortable: true,
      render: (product) => {
        const status = getStockStatus(
          product.totalStock,
          product.minStock,
          product.maxStock
        );
        return (
          <Badge
            variant="secondary"
            className={`text-xs ${getStockStatusColor(status)}`}
          >
            {product.totalStock} {status !== "optimal" ? `(${status})` : ""}
          </Badge>
        );
      },
    },
    {
      key: "costPrice",
      title: "Cost",
      render: (product) => formatCurrency(product.costPrice),
    },
    {
      key: "sellPrice",
      title: "Price",
      render: (product) => (
        <span className="font-medium">{formatCurrency(product.sellPrice)}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (product) => (
        <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
          {PRODUCT_STATUS_LABELS[product.status] ?? product.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "",
      className: "w-10",
      render: (product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/inventory/products/${product.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/inventory/products/${product.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteId(product.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`${data?.meta?.total ?? 0} products in your inventory`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setAiDialogOpen(true)}
              className="border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-all duration-300"
            >
              <Sparkles className="mr-2 h-4 w-4 text-primary animate-pulse" />
              AI Add Product
            </Button>
            <Button asChild>
              <Link href="/inventory/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        }
      />

      <AiAddProductDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.meta?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        searchPlaceholder="Search products by name, SKU..."
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onSearch={handleSearch}
        rowKey={(item) => item.id}
        onRowClick={(item) => router.push(`/inventory/products/${item.id}`)}
        emptyMessage="No products found"
        emptyAction={
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <Link href="/inventory/products/new">Create your first product</Link>
          </Button>
        }
        filters={
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}
