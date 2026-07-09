"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  ShoppingCart,
  BarChart3,
  Activity,
  Settings,
  Plus,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationCommands = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/inventory/products", icon: Package },
  { title: "Categories", href: "/inventory/categories", icon: Package },
  { title: "Stock Levels", href: "/inventory/stock", icon: Package },
  { title: "Warehouses", href: "/warehouses", icon: Warehouse },
  { title: "Suppliers", href: "/suppliers", icon: Truck },
  { title: "Purchase Orders", href: "/orders/purchase", icon: ShoppingCart },
  { title: "Sales Orders", href: "/orders/sales", icon: ShoppingCart },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Activity Log", href: "/activity", icon: Activity },
  { title: "Settings", href: "/settings", icon: Settings },
];

const quickActions = [
  { title: "New Product", href: "/inventory/products/new", icon: Plus },
  { title: "New Supplier", href: "/suppliers/new", icon: Plus },
  { title: "New Purchase Order", href: "/orders/purchase/new", icon: Plus },
  { title: "New Sales Order", href: "/orders/sales/new", icon: Plus },
  { title: "New Warehouse", href: "/warehouses/new", icon: Plus },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  function runCommand(command: () => void) {
    onOpenChange(false);
    command();
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6">
            <Search className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No results found.</p>
          </div>
        </CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.href}
              value={action.title}
              onSelect={() => runCommand(() => router.push(action.href))}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {navigationCommands.map((cmd) => (
            <CommandItem
              key={cmd.href}
              value={cmd.title}
              onSelect={() => runCommand(() => router.push(cmd.href))}
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              {cmd.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
