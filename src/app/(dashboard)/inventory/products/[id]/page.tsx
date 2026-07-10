import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDateTime,
  getStockStatus,
  getStockStatusColor,
} from "@/lib/utils";
import {
  Package,
  Edit,
  DollarSign,
  TrendingUp,
  Boxes,
  MapPin,
  Layers,
  Calendar,
  History,
  AlertTriangle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Product Details" };

async function getProductDetails(id: string, organizationId: string) {
  const product = await prisma.product.findFirst({
    where: { id, organizationId },
    include: {
      category: { select: { name: true, color: true } },
      supplier: { select: { name: true } },
      stockItems: {
        include: {
          zone: {
            include: {
              warehouse: { select: { name: true, code: true } },
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  const movements = await prisma.stockMovement.findMany({
    where: { stockItem: { productId: id } },
    include: {
      stockItem: {
        include: {
          zone: {
            include: {
              warehouse: { select: { name: true, code: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return { product, movements };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) return notFound();

  const { id } = await params;
  const data = await getProductDetails(id, session.user.organizationId);

  if (!data) return notFound();

  const { product, movements } = data;

  const totalStock = product.stockItems.reduce((sum, si) => sum + si.quantity, 0);
  const costPrice = Number(product.costPrice);
  const sellPrice = Number(product.sellPrice);
  const totalValue = totalStock * costPrice;
  const margin = sellPrice > 0 ? ((sellPrice - costPrice) / sellPrice) * 100 : 0;
  const status = getStockStatus(totalStock, product.minStock, product.maxStock);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={product.name}
          description={`SKU: ${product.sku}`}
          backHref="/inventory/products"
        />
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/inventory/products/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden relative group hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Boxes className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <Badge variant="secondary" className={`text-[10px] ${getStockStatusColor(status)}`}>
                {status.toUpperCase()}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                Min: {product.minStock} / Max: {product.maxStock}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative group hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost Price
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(costPrice)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Total Value: {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative group hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sell Price
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(sellPrice)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Unit profit: {formatCurrency(sellPrice - costPrice)}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative group hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Markup / Margin
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{margin.toFixed(1)}%</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Based on selling price
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Product Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-muted-foreground block">Status</span>
              <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"} className="mt-1">
                {product.status}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Category</span>
              {product.category ? (
                <Badge
                  variant="secondary"
                  className="mt-1 text-xs"
                  style={{
                    backgroundColor: `${product.category.color}15`,
                    color: product.category.color,
                  }}
                >
                  {product.category.name}
                </Badge>
              ) : (
                <span className="text-sm font-medium">—</span>
              )}
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Supplier</span>
              <span className="text-sm font-medium block mt-0.5">
                {product.supplier?.name ?? "—"}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Barcode</span>
              <span className="text-sm font-mono block mt-0.5">
                {product.barcode ?? "—"}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Unit</span>
              <span className="text-sm font-medium block mt-0.5">
                {product.unit}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Weight</span>
              <span className="text-sm font-medium block mt-0.5">
                {product.weight ? `${product.weight} kg` : "—"}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Dimensions</span>
              <span className="text-sm font-medium block mt-0.5">
                {product.dimensions ?? "—"}
              </span>
            </div>
            {product.description && (
              <div>
                <span className="text-xs text-muted-foreground block">Description</span>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
            {product.tags.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Locations & Movements */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Stock Locations</CardTitle>
            </CardHeader>
            <CardContent>
              {product.stockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Warehouse className="h-8 w-8 opacity-20 mb-2" />
                  <p className="text-sm">This product is not stocked in any warehouse zone yet.</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground text-xs font-semibold">
                        <th className="py-2.5">Warehouse</th>
                        <th className="py-2.5">Zone</th>
                        <th className="py-2.5">Batch</th>
                        <th className="py-2.5">Expiry Date</th>
                        <th className="py-2.5 text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {product.stockItems.map((si) => (
                        <tr key={si.id} className="hover:bg-muted/30">
                          <td className="py-3 font-medium flex items-center gap-1.5">
                            <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
                            {si.zone.warehouse.name} ({si.zone.warehouse.code})
                          </td>
                          <td className="py-3 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                              {si.zone.name}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-xs">{si.batch ?? "—"}</td>
                          <td className="py-3 text-muted-foreground text-xs">
                            {si.expiryDate ? new Date(si.expiryDate).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 text-right font-semibold">{si.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent Movements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Activity className="h-8 w-8 opacity-20 mb-2" />
                  <p className="text-sm">No inventory movements recorded for this product.</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground text-xs font-semibold">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Type</th>
                        <th className="py-2.5">Warehouse/Zone</th>
                        <th className="py-2.5">Reference</th>
                        <th className="py-2.5 text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {movements.map((m) => {
                        const mColors = {
                          INBOUND: "bg-emerald-500/10 text-emerald-500",
                          OUTBOUND: "bg-red-500/10 text-red-500",
                          TRANSFER: "bg-blue-500/10 text-blue-500",
                          ADJUSTMENT: "bg-amber-500/10 text-amber-500",
                          RETURN: "bg-violet-500/10 text-violet-500",
                        };
                        return (
                          <tr key={m.id} className="hover:bg-muted/30">
                            <td className="py-3 text-xs text-muted-foreground">
                              {formatDateTime(m.createdAt)}
                            </td>
                            <td className="py-3">
                              <Badge variant="secondary" className={`text-[10px] uppercase font-bold ${mColors[m.type]}`}>
                                {m.type}
                              </Badge>
                            </td>
                            <td className="py-3 text-xs text-muted-foreground">
                              {m.stockItem.zone.warehouse.name} - {m.stockItem.zone.name}
                            </td>
                            <td className="py-3 text-xs font-mono">{m.reference ?? "—"}</td>
                            <td className={`py-3 text-right font-semibold ${m.type === "OUTBOUND" ? "text-red-500" : "text-emerald-500"}`}>
                              {m.type === "OUTBOUND" ? "-" : "+"}{m.quantity}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
