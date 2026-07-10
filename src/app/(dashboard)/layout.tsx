"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar, AppHeader, MobileSidebar } from "@/components/layout/app-shell";
import { AmbientBackground } from "@/components/ui/ambient-bg";
import { useMobile } from "@/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMobile();
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient floating orbs — behind everything */}
      <AmbientBackground />

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          !isMobile && (sidebarCollapsed ? "lg:ml-[68px]" : "lg:ml-[260px]")
        )}
      >
        <AppHeader
          isCollapsed={isMobile ? true : sidebarCollapsed}
          onToggleSidebar={() => {
            if (isMobile) {
              setMobileOpen(true);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
        />
        <main className="relative z-10 flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
