"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Package,
  Warehouse,
  Truck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  Zap,
  Activity,
  BarChart2,
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
  Area,
  AreaChart,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedCounter } from "@/components/ui/animated-counter";
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

/* ─── Animation Variants ─── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};
const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.015,
    y: -2,
    transition: { type: "spring" as const, stiffness: 400, damping: 20 },
  },
};

/* ─── KPI config ─── */
const kpiCards = [
  {
    key: "totalProducts",
    title: "Total Products",
    icon: Package,
    iconClass: "icon-gradient-blue",
    colorClass: "text-blue-500",
    format: "number",
    description: "SKUs tracked",
    sparkColor: "oklch(0.623 0.263 264.376)",
  },
  {
    key: "totalInventoryValue",
    title: "Inventory Value",
    icon: DollarSign,
    iconClass: "icon-gradient-green",
    colorClass: "text-emerald-500",
    format: "currency",
    description: "Cost basis",
    sparkColor: "oklch(0.696 0.17 162.48)",
  },
  {
    key: "totalSuppliers",
    title: "Active Suppliers",
    icon: Truck,
    iconClass: "icon-gradient-violet",
    colorClass: "text-violet-500",
    format: "number",
    description: "Vendor relationships",
    sparkColor: "oklch(0.627 0.265 303.9)",
  },
  {
    key: "totalWarehouses",
    title: "Warehouses",
    icon: Warehouse,
    iconClass: "icon-gradient-amber",
    colorClass: "text-amber-500",
    format: "number",
    description: "Storage locations",
    sparkColor: "oklch(0.769 0.188 70.08)",
  },
  {
    key: "totalSOValue",
    title: "Sales Revenue",
    icon: TrendingUp,
    iconClass: "icon-gradient-teal",
    colorClass: "text-teal-500",
    format: "currency",
    description: "Total sales orders",
    sparkColor: "oklch(0.696 0.17 162.48)",
  },
  {
    key: "lowStockCount",
    title: "Low Stock Alerts",
    icon: AlertTriangle,
    iconClass: "icon-gradient-red",
    colorClass: "text-red-500",
    format: "number",
    description: "Needs reordering",
    sparkColor: "oklch(0.645 0.246 16.439)",
  },
] as const;

/* ─── Premium KPI Card ─── */
function KPICard({
  kpi,
  value,
  index,
}: {
  kpi: (typeof kpiCards)[number];
  value: number;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div ref={ref} variants={item}>
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={cardHover}
      >
      <Card className="card-premium glow-primary group relative overflow-hidden border-border/50 bg-card transition-all duration-300">
        {/* Shimmer sweep on hover */}
        <div className="shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Subtle colored top gradient */}
        <div
          className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${kpi.sparkColor}, transparent)`,
          }}
        />

        <CardContent className="relative p-5">
          <div className="flex items-start justify-between">
            <motion.div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.iconClass}`}
              whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
            >
              <kpi.icon className={`h-5 w-5 ${kpi.colorClass}`} />
            </motion.div>

            {/* Trend sparkline placeholder */}
            <div className="flex items-center gap-1">
              <BarChart2 className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {inView ? (
                kpi.format === "currency" ? (
                  <AnimatedCounter
                    value={value}
                    formatter={(v) =>
                      `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`
                    }
                  />
                ) : (
                  <AnimatedCounter value={value} />
                )
              ) : (
                <span>—</span>
              )}
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground/80">
              {kpi.title}
            </p>
            <p className="text-xs text-muted-foreground">{kpi.description}</p>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}

/* ─── Activity Timeline Item ─── */
function ActivityItem({
  log,
  index,
}: {
  log: DashboardData["recentActivity"][number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 120 }}
      className="flex items-start gap-3"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <motion.div
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          whileHover={{ scale: 1.1 }}
        >
          {log.userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-background bg-emerald-500" />
        </motion.div>
        <div className="mt-1 w-px flex-1 bg-border/30" />
      </div>

      <div className="min-w-0 flex-1 pb-4">
        <p className="text-sm leading-snug">
          <span className="font-medium text-foreground">{log.userName}</span>{" "}
          <span className="text-muted-foreground">
            {log.action.toLowerCase()}d
          </span>{" "}
          <span className="font-medium text-foreground">{log.entity}</span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRelativeTime(log.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Order Row ─── */
function OrderRow({
  href,
  title,
  subtitle,
  status,
  amount,
  index,
}: {
  href: string;
  title: string;
  subtitle: string;
  status: string;
  amount: number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 120 }}
    >
      <Link
        href={href}
        className="group flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3.5 transition-all duration-200 hover:border-primary/30 hover:bg-accent hover:shadow-sm"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
            {title}
          </p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="ml-4 flex shrink-0 items-center gap-3">
          <Badge
            variant="secondary"
            className={`text-[11px] ${getOrderStatusColor(status)}`}
          >
            {status}
          </Badge>
          <span className="text-sm font-bold tabular-nums">
            {formatCurrency(amount)}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Custom Tooltip for charts ─── */
const tooltipStyle = {
  backgroundColor: "oklch(0.17 0.005 285)",
  border: "1px solid oklch(1 0 0 / 10%)",
  borderRadius: "12px",
  fontSize: "12px",
  padding: "8px 12px",
  color: "oklch(0.95 0 0)",
  boxShadow: "0 8px 32px oklch(0 0 0 / 40%)",
};

/* ─── Main Dashboard ─── */
export function DashboardContent({ data }: { data: DashboardData }) {
  const now = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const barData = [
    { name: "Cost Value", value: data.kpis.totalInventoryValue },
    { name: "Retail Value", value: data.kpis.totalRetailValue },
    { name: "Purchase Orders", value: data.kpis.totalPOValue },
    { name: "Sales Orders", value: data.kpis.totalSOValue },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative space-y-6"
    >
      {/* ── Page Header ── */}
      <motion.div
        variants={item}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="animated-gradient-text text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
              <span className="live-dot" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Live · {now}
              </span>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your inventory and operations
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button asChild className="gap-2 shadow-lg shadow-primary/20">
            <Link href="/inventory/products/new">
              <Package className="h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, i) => {
          const value = data.kpis[kpi.key as keyof typeof data.kpis];
          return (
            <KPICard key={kpi.key} kpi={kpi} value={value} index={i} />
          );
        })}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Pie: Category Distribution */}
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="card-premium h-full border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg icon-gradient-blue">
                  <Activity className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Products by Category
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {data.categoryDistribution.length > 0 ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
                    className="flex items-center justify-center"
                  >
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={data.categoryDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="name"
                          strokeWidth={0}
                          animationBegin={200}
                          animationDuration={800}
                        >
                          {data.categoryDistribution.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                    {data.categoryDistribution.map((cat, i) => (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="text-muted-foreground">
                          {cat.name} ({cat.count})
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  message="No categories yet"
                  actionLabel="Add Category"
                  actionHref="/inventory/categories"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar: Value Overview */}
        <motion.div variants={item} className="lg:col-span-4">
          <Card className="card-premium h-full border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg icon-gradient-violet">
                  <BarChart2 className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Value Overview
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={barData}
                    margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.623 0.263 264.376)" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="oklch(0.627 0.265 303.9)" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "oklch(0.65 0.015 285)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "oklch(0.65 0.015 285)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val: any) =>
                        `$${(Number(val) / 1000).toFixed(0)}k`
                      }
                    />
                    <RechartsTooltip
                      formatter={(value: any) => formatCurrency(Number(value || 0))}
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "oklch(1 0 0 / 4%)", radius: 6 }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#barGrad)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={52}
                      animationBegin={300}
                      animationDuration={900}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Alerts + Activity ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <motion.div variants={item}>
          <Card className="card-premium border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg icon-gradient-red">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Low Stock Alerts
                </CardTitle>
                {data.lowStockItems.length > 0 && (
                  <Badge variant="destructive" className="badge-pulse text-[10px]">
                    {data.lowStockItems.length}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                <Link href="/inventory/stock">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.lowStockItems.length > 0 ? (
                <div className="space-y-2.5">
                  {data.lowStockItems.map((product, i) => {
                    const pct = Math.min(
                      100,
                      Math.round((product.currentStock / Math.max(product.minStock * 2, 1)) * 100)
                    );
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, type: "spring" }}
                      >
                        <Link
                          href={`/inventory/products/${product.id}`}
                          className="group flex flex-col gap-2 rounded-xl border border-border/50 bg-card/40 p-3 transition-all hover:border-red-500/30 hover:bg-red-500/5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium group-hover:text-red-500">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.sku} · {product.category}
                              </p>
                            </div>
                            <div className="ml-3 shrink-0 text-right">
                              <p className="text-sm font-bold text-red-500">
                                {product.currentStock}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Min: {product.minStock}
                              </p>
                            </div>
                          </div>
                          {/* Stock level bar */}
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.4 + i * 0.05, duration: 0.7 }}
                            />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
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
          <Card className="card-premium border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg icon-gradient-teal">
                  <Zap className="h-3.5 w-3.5 text-teal-500" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Recent Activity
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                <Link href="/activity">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentActivity.length > 0 ? (
                <ScrollArea className="h-[300px] pr-2">
                  <div className="pt-1">
                    {data.recentActivity.map((log, i) => (
                      <ActivityItem key={log.id} log={log} index={i} />
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

      {/* ── Recent Orders ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Purchase Orders */}
        <motion.div variants={item}>
          <Card className="card-premium border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg icon-gradient-violet">
                  <ShoppingCart className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Purchase Orders
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                <Link href="/orders/purchase">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentPurchaseOrders.length > 0 ? (
                <div className="space-y-2">
                  {data.recentPurchaseOrders.map((order, i) => (
                    <OrderRow
                      key={order.id}
                      href={`/orders/purchase/${order.id}`}
                      title={order.orderNumber}
                      subtitle={order.supplierName}
                      status={order.status}
                      amount={order.totalAmount}
                      index={i}
                    />
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
          <Card className="card-premium border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg icon-gradient-green">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Sales Orders
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                <Link href="/orders/sales">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentSalesOrders.length > 0 ? (
                <div className="space-y-2">
                  {data.recentSalesOrders.map((order, i) => (
                    <OrderRow
                      key={order.id}
                      href={`/orders/sales/${order.id}`}
                      title={order.orderNumber}
                      subtitle={order.customerName}
                      status={order.status}
                      amount={order.totalAmount}
                      index={i}
                    />
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-10 text-center"
    >
      <span className="text-4xl">{icon ?? "📦"}</span>
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      {actionLabel && actionHref && (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
