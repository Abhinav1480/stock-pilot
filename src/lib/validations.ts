import { z } from "zod";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH VALIDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    organizationName: z
      .string()
      .min(2, "Organization name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRODUCT VALIDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  sku: z.string().min(1, "SKU is required").max(50),
  description: z.string().max(2000).optional().nullable(),
  image: z.string().url().optional().nullable(),
  barcode: z.string().max(100).optional().nullable(),
  unit: z.string().default("pcs"),
  costPrice: z.coerce.number().min(0, "Cost price must be positive"),
  sellPrice: z.coerce.number().min(0, "Sell price must be positive"),
  minStock: z.coerce.number().int().min(0).default(0),
  maxStock: z.coerce.number().int().min(0).default(0),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  weight: z.coerce.number().min(0).optional().nullable(),
  dimensions: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).default([]),
  categoryId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CATEGORY VALIDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format").default("#6366f1"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPPLIER VALIDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(200),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  contactName: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  rating: z.coerce.number().int().min(0).max(5).default(0),
  isActive: z.boolean().default(true),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WAREHOUSE VALIDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const warehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required").max(200),
  code: z.string().min(1, "Warehouse code is required").max(20),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  capacity: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const warehouseZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required").max(200),
  code: z.string().min(1, "Zone code is required").max(20),
  type: z.string().default("GENERAL"),
  capacity: z.coerce.number().int().min(0).default(0),
  warehouseId: z.string().min(1, "Warehouse is required"),
});

export type WarehouseInput = z.infer<typeof warehouseSchema>;
export type WarehouseZoneInput = z.infer<typeof warehouseZoneSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDER VALIDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  status: z.enum(["DRAFT", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).default("DRAFT"),
  notes: z.string().max(2000).optional().nullable(),
  expectedDate: z.coerce.date().optional().nullable(),
  tax: z.coerce.number().min(0).default(0),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const salesOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(200),
  customerEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  status: z.enum(["DRAFT", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).default("DRAFT"),
  notes: z.string().max(2000).optional().nullable(),
  tax: z.coerce.number().min(0).default(0),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
export type SalesOrderInput = z.infer<typeof salesOrderSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STOCK MOVEMENT VALIDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const stockMovementSchema = z.object({
  type: z.enum(["INBOUND", "OUTBOUND", "TRANSFER", "ADJUSTMENT", "RETURN"]),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  productId: z.string().min(1, "Product is required"),
  zoneId: z.string().min(1, "Zone is required"),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  batch: z.string().max(100).optional().nullable(),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUERY PARAMS VALIDATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
