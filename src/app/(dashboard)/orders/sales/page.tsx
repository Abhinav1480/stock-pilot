"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, MoreHorizontal, Eye } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDateTime, getOrderStatusColor } from "@/lib/utils";

interface SalesOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  customerName: string;
  createdAt: string;
}

export default function SalesOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["sales-orders", page, pageSize, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page), limit: String(pageSize),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/orders/sales?${params}`);
      return res.json();
    },
  });

  const handleSearch = useCallback((q: string) => { setSearch(q); setPage(1); }, []);

  const columns: Column<SalesOrder>[] = [
    {
      key: "orderNumber",
      title: "Order #",
      sortable: true,
      render: (o) => <span className="font-medium">{o.orderNumber}</span>,
    },
    {
      key: "customerName",
      title: "Customer",
      render: (o) => o.customerName,
    },
    {
      key: "status",
      title: "Status",
      render: (o) => (
        <Badge variant="secondary" className={getOrderStatusColor(o.status)}>
          {o.status}
        </Badge>
      ),
    },
    {
      key: "items",
      title: "Items",
      render: (o) => <span className="text-muted-foreground">{o.itemCount} items</span>,
    },
    {
      key: "totalAmount",
      title: "Total",
      sortable: true,
      render: (o) => <span className="font-semibold">{formatCurrency(o.totalAmount)}</span>,
    },
    {
      key: "createdAt",
      title: "Date",
      sortable: true,
      render: (o) => <span className="text-sm text-muted-foreground">{formatDateTime(o.createdAt)}</span>,
    },
    {
      key: "actions",
      title: "",
      className: "w-10",
      render: (o) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/orders/sales/${o.id}`)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description={`${data?.meta?.total ?? 0} total sales orders`}
        actions={
          <Button asChild><Link href="/orders/sales/new"><Plus className="mr-2 h-4 w-4" />New Order</Link></Button>
        }
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.meta?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        searchPlaceholder="Search order number or customer..."
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onSearch={handleSearch}
        rowKey={(item) => item.id}
        onRowClick={(item) => router.push(`/orders/sales/${item.id}`)}
        emptyMessage="No sales orders found"
        emptyAction={
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <Link href="/orders/sales/new">Create first order</Link>
          </Button>
        }
        filters={
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
