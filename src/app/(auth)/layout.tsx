import { Package } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-chart-4/80 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJzLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyIDUuMzczLTEyIDEyLTEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">{APP_NAME}</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <blockquote className="space-y-2">
            <p className="text-2xl font-medium leading-relaxed text-white/90">
              &ldquo;StockPilot Pro transformed how we manage inventory
              across our 12 warehouses. Real-time visibility has reduced
              stockouts by 73%.&rdquo;
            </p>
            <footer className="text-sm text-white/70">
              — Sarah Chen, VP Operations at TechFlow Inc.
            </footer>
          </blockquote>
        </div>
        <div className="relative text-sm text-white/50">
          © {new Date().getFullYear()} StockPilot Pro
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 lg:px-8">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
