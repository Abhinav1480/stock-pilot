"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity as ActivityIcon, User, Clock } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatDateTime, getInitials } from "@/lib/utils";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { name: string; email: string; image: string | null };
}

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-500",
  UPDATE: "bg-blue-500/10 text-blue-500",
  DELETE: "bg-red-500/10 text-red-500",
  LOGIN: "bg-violet-500/10 text-violet-500",
  LOGOUT: "bg-zinc-500/10 text-zinc-500",
  EXPORT: "bg-amber-500/10 text-amber-500",
};

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["activity", page, pageSize, search, entityFilter, actionFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page), limit: String(pageSize),
        ...(entityFilter && { entity: entityFilter }),
        ...(actionFilter && { action: actionFilter }),
      });
      const res = await fetch(`/api/activity?${params}`);
      return res.json();
    },
  });

  const handleSearch = useCallback((q: string) => { setSearch(q); setPage(1); }, []);

  const handleEntityChange = useCallback((value: string | null) => {
    setEntityFilter(value === "all" || !value ? "" : value);
    setPage(1);
  }, []);

  const handleActionChange = useCallback((value: string | null) => {
    setActionFilter(value === "all" || !value ? "" : value);
    setPage(1);
  }, []);

  const columns: Column<AuditEntry>[] = [
    {
      key: "user",
      title: "User",
      render: (entry) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
              {getInitials(entry.user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{entry.user.name}</span>
        </div>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (entry) => (
        <Badge variant="secondary" className={actionColors[entry.action] ?? ""}>
          {entry.action}
        </Badge>
      ),
    },
    {
      key: "entity",
      title: "Entity",
      render: (entry) => (
        <span className="text-sm">{entry.entity}</span>
      ),
    },
    {
      key: "details",
      title: "Details",
      render: (entry) => {
        const meta = entry.metadata;
        if (!meta) return <span className="text-muted-foreground">—</span>;
        const name = (meta.name as string) ?? (meta.orderNumber as string) ?? (meta.organizationName as string);
        return name ? <span className="text-sm text-muted-foreground">{name}</span> : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      key: "createdAt",
      title: "Time",
      render: (entry) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Audit trail of all actions in your organization"
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.meta?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        searchPlaceholder="Search activity..."
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onSearch={handleSearch}
        rowKey={(item) => item.id}
        emptyMessage="No activity recorded yet"
        filters={
          <div className="flex items-center gap-2">
            <Select value={entityFilter} onValueChange={handleEntityChange}>
              <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Entity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Category">Category</SelectItem>
                <SelectItem value="Supplier">Supplier</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="PurchaseOrder">Purchase Order</SelectItem>
                <SelectItem value="SalesOrder">Sales Order</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Organization">Organization</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={handleActionChange}>
              <SelectTrigger className="h-9 w-28"><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
