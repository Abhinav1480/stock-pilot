"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  LayoutDashboard,
  Warehouse,
  Truck,
  ShoppingCart,
  BarChart3,
  Activity,
  Settings,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { ROLE_LABELS } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrentUser, useMobile, useCommandK } from "@/hooks";
import { APP_NAME } from "@/lib/constants";
import { CommandPalette } from "@/components/shared/command-palette";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  ShoppingCart,
  BarChart3,
  Activity,
  Settings,
};

interface NavItem {
  title: string;
  href: string;
  icon: string;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
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
  { title: "Warehouses", href: "/warehouses", icon: "Warehouse" },
  { title: "Suppliers", href: "/suppliers", icon: "Truck" },
  {
    title: "Orders",
    href: "/orders",
    icon: "ShoppingCart",
    children: [
      { title: "Purchase Orders", href: "/orders/purchase" },
      { title: "Sales Orders", href: "/orders/sales" },
    ],
  },
  { title: "Analytics", href: "/analytics", icon: "BarChart3" },
  { title: "Activity", href: "/activity", icon: "Activity" },
  { title: "Settings", href: "/settings", icon: "Settings" },
];

function NavLink({
  item,
  isCollapsed,
}: {
  item: NavItem;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const [isOpen, setIsOpen] = useState(isActive && !!item.children);
  const Icon = iconMap[item.icon] ?? Package;

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.children?.[0]?.href ?? item.href}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.title}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.title}
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 space-y-0.5 border-l border-border/50 pl-3 pt-1">
              {item.children.map((child) => {
                const childActive = pathname === child.href;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
                      childActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <ChevronRight className="h-3 w-3" />
                    {child.title}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppSidebar({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const { user } = useCurrentUser();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border/50 bg-sidebar transition-all duration-300",
        isCollapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border/50 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-base font-bold tracking-tight"
            >
              {APP_NAME}
            </motion.span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.slice(0, -1).map((item) => (
            <NavLink key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom */}
      <div className="border-t border-border/50 p-3">
        <NavLink
          item={navItems[navItems.length - 1]}
          isCollapsed={isCollapsed}
        />
        <Separator className="my-2" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="truncate text-sm font-medium">
                    {user?.name ?? "User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email ?? ""}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                signOut({ callbackUrl: "/login" });
                toast.success("Signed out successfully");
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function AppHeader({
  isCollapsed,
  onToggleSidebar,
}: {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);

  useCommandK(useCallback(() => setCommandOpen(true), []));

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl transition-all duration-300 sm:px-6",
          isCollapsed ? "ml-[68px]" : "ml-[260px]"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Search */}
        <button
          onClick={() => setCommandOpen(true)}
          className="group flex h-9 flex-1 max-w-md items-center gap-2 rounded-lg border border-border/50 bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-accent"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search everything...</span>
          <kbd className="ml-auto hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  3
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
                <span className="text-xs font-semibold">Notifications</span>
                <Badge variant="outline" className="text-[10px]">3 New</Badge>
              </div>
              <div className="max-h-64 overflow-y-auto p-1 space-y-1">
                <div className="flex flex-col gap-1 rounded-md p-2 hover:bg-accent text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Low Stock Alert</span>
                    <span className="text-[10px] text-muted-foreground">5m ago</span>
                  </div>
                  <p className="text-muted-foreground">Product "Wireless Keyboard" is below minimum threshold in Warehouse A.</p>
                </div>
                <div className="flex flex-col gap-1 rounded-md p-2 hover:bg-accent text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Purchase Order Received</span>
                    <span className="text-[10px] text-muted-foreground">1h ago</span>
                  </div>
                  <p className="text-muted-foreground">PO #1002 has been marked as confirmed by Supplier Inc.</p>
                </div>
                <div className="flex flex-col gap-1 rounded-md p-2 hover:bg-accent text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Transfer Completed</span>
                    <span className="text-[10px] text-muted-foreground">2h ago</span>
                  </div>
                  <p className="text-muted-foreground">150 units of "USB-C Cable" transferred from Main to Secondary Zone.</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}

export function MobileSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-border/50 bg-sidebar lg:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
              <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Package className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-base font-bold">{APP_NAME}</span>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} isCollapsed={false} />
                ))}
              </nav>
            </ScrollArea>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
