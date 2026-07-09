"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Warehouse,
  Truck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatCurrency,
  formatNumber,
  formatRelativeTime,
  getOrderStatusColor,
} from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";

interface DashboardData {
  kpis: {
    totalProducts: number;
    activeProducts: number;
    totalSuppliers: number;
    totalWarehouses: number;
    lowStockCount: number;
    totalInventoryValue: number;
    totalRetailValue: number;
    totalPOValue: number;
    totalSOValue: number;
  };
  recentPurchaseOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    supplierName: string;
    createdAt: string;
  }>;
  recentSalesOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    customerName: string;
    createdAt: string;
  }>;
  lowStockItems: Array<{
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    minStock: number;
    category: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    userName: string;
    createdAt: string;
    metadata: Record<string, unknown> | null;
  }>;
  categoryDistribution: Array<{
    name: string;
    color: string;
    count: number;
  }>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const kpiCards = [
  {
    key: "totalProducts",
    title: "Total Products",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    format: "number",
  },
  {
    key: "totalInventoryValue",
    title: "Inventory Value",
    icon: DollarSign,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    format: "currency",
  },
  {
    key: "totalSuppliers",
    title: "Active Suppliers",
    icon: Truck,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    format: "number",
  },
  {
    key: "totalWarehouses",
    title: "Warehouses",
    icon: Warehouse,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    format: "number",
  },
  {
    key: "totalSOValue",
    title: "Sales Revenue",
    icon: TrendingUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    format: "currency",
  },
  {
    key: "lowStockCount",
    title: "Low Stock Alerts",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    format: "number",
  },
] as const;

export function DashboardContent({ data }: { data: DashboardData }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your inventory and operations
          </p>
        </div>
        <Button asChild>
          <Link href="/inventory/products/new">
            <Package className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi) => {
          const value = data.kpis[kpi.key as keyof typeof data.kpis];
          return (
            <motion.div key={kpi.key} variants={item}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.bgColor}`}
                    >
                      <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold tracking-tight">
                      {kpi.format === "currency"
                        ? formatCurrency(value)
                        : formatNumber(value)}
                    </p>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Category Distribution */}
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Products by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.categoryDistribution.length > 0 ? (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={data.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="name"
                        strokeWidth={0}
                      >
                        {data.categoryDistribution.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  message="No categories yet"
                  actionLabel="Add Category"
                  actionHref="/inventory/categories"
                />
              )}
              {data.categoryDistribution.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.categoryDistribution.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">
                        {cat.name} ({cat.count})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Value Breakdown */}
        <motion.div variants={item} className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Value Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[
                    {
                      name: "Cost Value",
                      value: data.kpis.totalInventoryValue,
                    },
                    {
                      name: "Retail Value",
                      value: data.kpis.totalRetailValue,
                    },
                    {
                      name: "Purchase Orders",
                      value: data.kpis.totalPOValue,
                    },
                    {
                      name: "Sales Orders",
                      value: data.kpis.totalSOValue,
                    },
                  ]}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val: number) =>
                      `$${(val / 1000).toFixed(0)}k`
                    }
                  />
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(262, 83%, 58%)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Low Stock Alerts
                </div>
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/inventory/stock">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {data.lowStockItems.map((product) => (
                    <Link
                      key={product.id}
                      href={`/inventory/products/${product.id}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-accent"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.sku} · {product.category}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-semibold text-red-500">
                          {product.currentStock}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Min: {product.minStock}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="All stock levels are healthy"
                  icon="✅"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/activity">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentActivity.length > 0 ? (
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {data.recentActivity.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 rounded-lg border border-border/50 p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {log.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{log.userName}</span>{" "}
                            <span className="text-muted-foreground">
                              {log.action.toLowerCase()}d
                            </span>{" "}
                            <span className="font-medium">{log.entity}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <EmptyState message="No activity yet" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Purchase Orders */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Recent Purchase Orders
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/orders/purchase">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentPurchaseOrders.length > 0 ? (
                <div className="space-y-3">
                  {data.recentPurchaseOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/purchase/${order.id}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-accent"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.supplierName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={getOrderStatusColor(order.status)}
                        >
                          {order.status}
                        </Badge>
                        <span className="text-sm font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="No purchase orders yet"
                  actionLabel="Create Order"
                  actionHref="/orders/purchase/new"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales Orders */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Recent Sales Orders
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/orders/sales">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentSalesOrders.length > 0 ? (
                <div className="space-y-3">
                  {data.recentSalesOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/sales/${order.id}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-accent"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={getOrderStatusColor(order.status)}
                        >
                          {order.status}
                        </Badge>
                        <span className="text-sm font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="No sales orders yet"
                  actionLabel="Create Order"
                  actionHref="/orders/sales/new"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function EmptyState({
  message,
  icon,
  actionLabel,
  actionHref,
}: {
  message: string;
  icon?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <span className="text-3xl">{icon ?? "📦"}</span>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {actionLabel && actionHref && (
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
