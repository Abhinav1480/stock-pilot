"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, MoreHorizontal, Edit, Trash2, MapPin, Boxes, Layers } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatNumber } from "@/lib/utils";

interface WarehouseData {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  country: string | null;
  capacity: number;
  isActive: boolean;
  totalZones: number;
  totalItems: number;
}

export default function WarehousesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/warehouses?limit=50");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/warehouses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
    },
    onSuccess: () => {
      toast.success("Warehouse deleted");
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const warehouses: WarehouseData[] = data?.data ?? [];
  const utilization = (items: number, capacity: number) =>
    capacity > 0 ? Math.min(100, Math.round((items / capacity) * 100)) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description={`${warehouses.length} warehouse${warehouses.length !== 1 ? "s" : ""}`}
        actions={
          <Button asChild>
            <Link href="/warehouses/new"><Plus className="mr-2 h-4 w-4" />Add Warehouse</Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      ) : warehouses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <span className="text-4xl">🏭</span>
            <p className="mt-3 text-muted-foreground">No warehouses yet</p>
            <Button className="mt-4" asChild>
              <Link href="/warehouses/new"><Plus className="mr-2 h-4 w-4" />Create your first warehouse</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((wh) => {
            const util = utilization(wh.totalItems, wh.capacity);
            return (
              <Card key={wh.id} className="group relative overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{wh.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{wh.code}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/warehouses/${wh.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(wh.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(wh.city || wh.country) && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {[wh.city, wh.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold">{wh.totalZones}</p>
                        <p className="text-[10px] text-muted-foreground">Zones</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                      <Boxes className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold">{formatNumber(wh.totalItems)}</p>
                        <p className="text-[10px] text-muted-foreground">Items</p>
                      </div>
                    </div>
                  </div>
                  {wh.capacity > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-medium">{util}%</span>
                      </div>
                      <Progress
                        value={util}
                        className="h-1.5"
                      />
                    </div>
                  )}
                  <Badge variant={wh.isActive ? "default" : "secondary"}>
                    {wh.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Warehouse"
        description="This will permanently delete the warehouse and all its zones. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}
