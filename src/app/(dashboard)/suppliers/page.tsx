"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, MoreHorizontal, Edit, Trash2, Star, Mail, Phone, Globe } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  contactName: string | null;
  rating: number;
  isActive: boolean;
  _count: { products: number; purchaseOrders: number };
}

export default function SuppliersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", page, pageSize, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page), limit: String(pageSize),
        ...(search && { search }),
      });
      const res = await fetch(`/api/suppliers?${params}`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
    },
    onSuccess: () => {
      toast.success("Supplier deleted");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSearch = useCallback((q: string) => { setSearch(q); setPage(1); }, []);

  const columns: Column<Supplier>[] = [
    {
      key: "name",
      title: "Supplier",
      sortable: true,
      render: (s) => (
        <div>
          <p className="font-medium">{s.name}</p>
          {s.contactName && <p className="text-xs text-muted-foreground">{s.contactName}</p>}
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact",
      render: (s) => (
        <div className="flex flex-col gap-0.5">
          {s.email && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{s.email}</span>}
          {s.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{s.phone}</span>}
        </div>
      ),
    },
    {
      key: "location",
      title: "Location",
      render: (s) => (
        <span className="text-sm text-muted-foreground">
          {[s.city, s.country].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "rating",
      title: "Rating",
      render: (s) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < s.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
          ))}
        </div>
      ),
    },
    {
      key: "products",
      title: "Products",
      render: (s) => <Badge variant="secondary">{s._count.products}</Badge>,
    },
    {
      key: "orders",
      title: "Orders",
      render: (s) => <Badge variant="secondary">{s._count.purchaseOrders}</Badge>,
    },
    {
      key: "actions",
      title: "",
      className: "w-10",
      render: (s) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/suppliers/${s.id}/edit`)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteId(s.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description={`${data?.meta?.total ?? 0} suppliers`}
        actions={
          <Button asChild><Link href="/suppliers/new"><Plus className="mr-2 h-4 w-4" />Add Supplier</Link></Button>
        }
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.meta?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        searchPlaceholder="Search suppliers..."
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onSearch={handleSearch}
        rowKey={(item) => item.id}
        emptyMessage="No suppliers yet"
        emptyAction={
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <Link href="/suppliers/new">Add your first supplier</Link>
          </Button>
        }
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Supplier"
        description="This will permanently delete the supplier. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}
