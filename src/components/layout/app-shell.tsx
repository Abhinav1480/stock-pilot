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
  Sparkles,
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
              "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
              isActive
                ? "bg-primary/15 text-primary nav-active-glow"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active-pill-collapsed"
                className="absolute inset-0 rounded-xl bg-primary/10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="relative h-5 w-5" />
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
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary nav-active-glow"
            : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active-pill"
            className="absolute inset-0 rounded-xl bg-primary/8"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        {/* Left accent bar */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-bar"
            className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Icon className="relative h-4 w-4 shrink-0" />
        <span className="relative">{item.title}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.title}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-4 space-y-0.5 border-l border-border/40 pl-3 pt-1">
              {item.children.map((child, i) => {
                const childActive = pathname === child.href;
                return (
                  <motion.div
                    key={child.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                        childActive
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                      )}
                    >
                      <ChevronRight className={cn("h-3 w-3 transition-transform", childActive && "translate-x-0.5")} />
                      {child.title}
                    </Link>
                  </motion.div>
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
      {/* Ambient glow at top of sidebar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/5 to-transparent" />

      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border/50 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30"
          >
            <Package className="h-4 w-4 text-primary-foreground" />
            {/* Shine overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="text-base font-bold tracking-tight"
              >
                {APP_NAME}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-0.5">
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
        <Separator className="my-2 opacity-50" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-all hover:bg-accent/70",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <div className="relative">
                <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/20 ring-offset-1 ring-offset-sidebar transition-all group-hover:ring-primary/40">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-500/20 text-xs font-semibold text-primary">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-500" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="truncate text-sm font-semibold">
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
              <p className="text-sm font-semibold">{user?.name}</p>
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
  const [searchFocused, setSearchFocused] = useState(false);

  useCommandK(useCallback(() => setCommandOpen(true), []));

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/50 bg-background/75 px-4 backdrop-blur-xl transition-all duration-300 sm:px-6",
          isCollapsed ? "ml-[68px]" : "ml-[260px]"
        )}
      >
        {/* Subtle gradient line at bottom of header */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Search */}
        <motion.button
          onClick={() => setCommandOpen(true)}
          animate={{ borderColor: searchFocused ? "oklch(0.623 0.263 264.376 / 50%)" : "oklch(1 0 0 / 10%)" }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="group flex h-9 flex-1 max-w-md items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3 text-sm text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-muted hover:shadow-sm"
          whileHover={{ scale: 1.005 }}
        >
          <Search className="h-4 w-4 transition-colors group-hover:text-primary" />
          <span className="hidden sm:inline">Search everything...</span>
          <kbd className="ml-auto hidden rounded-lg border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </motion.button>

        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9, rotate: 15 }}>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            </Button>
          </motion.div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8"
                aria-label="Notifications"
                asChild
              >
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Bell className="h-4 w-4" />
                  <span className="badge-pulse absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    3
                  </span>
                </motion.button>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Notifications</span>
                  <span className="live-dot" />
                </div>
                <Badge variant="outline" className="text-[10px]">3 New</Badge>
              </div>
              <div className="max-h-64 overflow-y-auto p-1">
                {[
                  {
                    title: "Low Stock Alert",
                    desc: 'Product "Wireless Keyboard" is below minimum threshold in Warehouse A.',
                    time: "5m ago",
                    color: "bg-red-500",
                  },
                  {
                    title: "Purchase Order Received",
                    desc: "PO #1002 has been marked as confirmed by Supplier Inc.",
                    time: "1h ago",
                    color: "bg-emerald-500",
                  },
                  {
                    title: "Transfer Completed",
                    desc: '150 units of "USB-C Cable" transferred from Main to Secondary Zone.',
                    time: "2h ago",
                    color: "bg-blue-500",
                  },
                ].map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-3 rounded-lg p-2.5 text-xs hover:bg-accent"
                  >
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.color}`} />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="mt-0.5 text-muted-foreground">{n.desc}</p>
                    </div>
                  </motion.div>
                ))}
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
            transition={{ type: "spring", damping: 22, stiffness: 180 }}
            className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-border/50 bg-sidebar lg:hidden"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/5 to-transparent" />
            <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
              <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30">
                  <Package className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-base font-bold">{APP_NAME}</span>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="flex flex-col gap-0.5">
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
