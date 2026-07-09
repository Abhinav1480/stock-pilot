export const APP_NAME = "StockPilot Pro";
export const APP_DESCRIPTION =
  "Smart Inventory & Warehouse Management Platform for Modern Businesses";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const ITEMS_PER_PAGE = 20;

export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  VIEWER: "VIEWER",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Administrator",
  MANAGER: "Manager",
  VIEWER: "Viewer",
};

export const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 4,
  ADMIN: 3,
  MANAGER: 2,
  VIEWER: 1,
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  INBOUND: "Inbound",
  OUTBOUND: "Outbound",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
  RETURN: "Return",
};

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
] as const;

export const UNIT_OPTIONS = [
  { value: "pcs", label: "Pieces" },
  { value: "kg", label: "Kilograms" },
  { value: "g", label: "Grams" },
  { value: "lb", label: "Pounds" },
  { value: "oz", label: "Ounces" },
  { value: "l", label: "Liters" },
  { value: "ml", label: "Milliliters" },
  { value: "m", label: "Meters" },
  { value: "ft", label: "Feet" },
  { value: "box", label: "Boxes" },
  { value: "pack", label: "Packs" },
  { value: "pallet", label: "Pallets" },
] as const;

export const WAREHOUSE_ZONE_TYPES = [
  { value: "GENERAL", label: "General Storage" },
  { value: "COLD", label: "Cold Storage" },
  { value: "HAZARDOUS", label: "Hazardous Materials" },
  { value: "RECEIVING", label: "Receiving Dock" },
  { value: "SHIPPING", label: "Shipping Dock" },
  { value: "RETURNS", label: "Returns Processing" },
  { value: "QUARANTINE", label: "Quarantine" },
] as const;

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: "Package",
    children: [
      { title: "Products", href: "/inventory/products" },
      { title: "Categories", href: "/inventory/categories" },
      { title: "Stock Levels", href: "/inventory/stock" },
    ],
  },
  {
    title: "Warehouses",
    href: "/warehouses",
    icon: "Warehouse",
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: "Truck",
  },
  {
    title: "Orders",
    href: "/orders",
    icon: "ShoppingCart",
    children: [
      { title: "Purchase Orders", href: "/orders/purchase" },
      { title: "Sales Orders", href: "/orders/sales" },
    ],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: "BarChart3",
  },
  {
    title: "Activity",
    href: "/activity",
    icon: "Activity",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "Settings",
  },
] as const;

export const CHART_COLORS = [
  "hsl(262, 83%, 58%)",
  "hsl(221, 83%, 53%)",
  "hsl(174, 72%, 46%)",
  "hsl(43, 96%, 56%)",
  "hsl(346, 87%, 58%)",
  "hsl(142, 71%, 45%)",
  "hsl(291, 64%, 42%)",
  "hsl(24, 95%, 53%)",
] as const;
