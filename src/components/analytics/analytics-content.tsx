"use client";

import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";

interface AnalyticsData {
  productsByStatus: Array<{ status: string; count: number }>;
  ordersByStatus: Array<{ status: string; count: number; total: number }>;
  topProducts: Array<{ name: string; stock: number }>;
  monthlyRevenue: Array<{ month: string; purchases: number; sales: number }>;
  movementTypes: Array<{ type: string; count: number }>;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export function AnalyticsContent({ data }: { data: AnalyticsData }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <PageHeader title="Analytics" description="Insights and performance metrics" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
            <CardContent>
              {data.monthlyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" name="Sales" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="purchases" name="Purchases" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  No revenue data yet. Create some orders to see analytics.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products by Stock */}
        <motion.div variants={item}>
          <Card>
            <CardHeader><CardTitle>Top Products by Stock</CardTitle></CardHeader>
            <CardContent>
              {data.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.topProducts.slice(0, 8)} layout="vertical" margin={{ left: 60 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="stock" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center py-16 text-muted-foreground">No product data</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Movement Types */}
        <motion.div variants={item}>
          <Card>
            <CardHeader><CardTitle>Stock Movements</CardTitle></CardHeader>
            <CardContent>
              {data.movementTypes.length > 0 ? (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={data.movementTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="count" nameKey="type" strokeWidth={0}>
                        {data.movementTypes.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 text-muted-foreground">No movement data yet</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Products by Status */}
        <motion.div variants={item}>
          <Card>
            <CardHeader><CardTitle>Products by Status</CardTitle></CardHeader>
            <CardContent>
              {data.productsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.productsByStatus}>
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill={CHART_COLORS[3]} radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center py-16 text-muted-foreground">No products yet</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders by Status */}
        <motion.div variants={item}>
          <Card>
            <CardHeader><CardTitle>Purchase Orders by Status</CardTitle></CardHeader>
            <CardContent>
              {data.ordersByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.ordersByStatus}>
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => name === "total" ? formatCurrency(v) : v} />
                    <Bar dataKey="count" name="Count" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center py-16 text-muted-foreground">No orders yet</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
