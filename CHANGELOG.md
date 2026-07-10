# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-10

### Added
- **Multi-Tenant Architecture**: Support for distinct organizations with separate, isolated access domains.
- **Role-Based Access Control (RBAC)**: Support for OWNER, ADMIN, MANAGER, and VIEWER roles mapping to dashboard options.
- **Premium Animation Upgrade**:
  - CSS custom animations in `globals.css` (e.g., float, shimmer, pulse-glow, gradient-shift).
  - Staggered spring animations via `framer-motion` for page navigation, timeline actions, and KPI card lists.
  - Ambient floating mesh gradient orbs (`AmbientBackground`) rendering behind dark-mode dashboard pages.
- **Framer Motion spring counters**: `AnimatedCounter` component animating KPI numbers up from zero.
- **AI Product Creation**: Automated extraction of product parameters from vendor receipts or invoices.
- **Enhanced Select components**: Native button semantics resolved for `@base-ui/react` elements to improve screen reader accessibility.
- **Interactive UI components**: Integrated `LineSidebar` and `SpotlightCard` interactive elements from React Bits.

### Fixed
- Fixed console warning regarding `nativeButton` prop forwarding in Base UI Dialogs and Popovers.
- Fixed search bails on login page by enclosing dynamic parameter extraction in React `<Suspense>` boundaries.
- Resolved type-checking errors in Recharts type bindings.
