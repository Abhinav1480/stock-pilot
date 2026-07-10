# 🌌 StockPilot Pro

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.x-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2d3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Vercel Deployed](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)](https://stock-pilot-8a2z.vercel.app/)

### 🚀 A Premium, Multi-Tenant, AI-Powered Inventory & Warehouse Management Platform

[**Live Demo**](https://stock-pilot-8a2z.vercel.app/) • [**Documentation**](docs/) • [**Report Bug**](.github/ISSUE_TEMPLATE/bug_report.md) • [**Request Feature**](.github/ISSUE_TEMPLATE/feature_request.md)

</div>

---

## 📖 Introduction

**StockPilot Pro** is a modern, enterprise-grade, multi-tenant inventory and warehouse management system designed to streamline supply chains. Driven by AI document parsing, featuring micro-animations, and styled with premium glassmorphism aesthetics, it delivers a state-of-the-art interface tailored for high-growth startups and modern logistics.

---

## 🖼️ Visual Showcase

### Dark Mode (Space Navy Aesthetic)
![Dashboard - Dark Mode](docs/screenshots/dashboard.png)

### Light Mode
![Dashboard - Light Mode](docs/screenshots/light_mode.png)

### Mobile Responsive Interface
![Mobile View](docs/screenshots/mobile_view.png)

---

## ⚡ Main Core Features

<kbd>
<img src="docs/screenshots/ai_product_creation.png" alt="AI Product Dialog" width="100%">
</kbd>

### 🤖 1. AI Product Extraction & OCR
* **Smart Parsing**: Instantly parse vendor receipts, invoice PDFs, or barcodes using AI extraction to automatically retrieve name, price, stock quantity, SKU, and classification categories.
* **Review UI**: Side-by-side editing interface where you can review cropped invoice uploads and make manual adjustments before saving products.

### 🏢 2. Multi-Tenant Organization Management
* **Data Isolation**: Multi-tenant database design. Every record belongs to an `Organization`. Access control is fully partitioned at database query levels.
* **Role-Based Access Control (RBAC)**: Supports roles (`OWNER`, `ADMIN`, `MANAGER`, `VIEWER`) mapping permissions across form creation, category editing, and analytics.

### 📊 3. Interactive Analytics & Timelines
* **Interactive Graphs**: Responsive area and bar charts featuring vibrant oklch color gradients powered by Recharts.
* **Audit Trail & Timelines**: Full timeline logging of all operations (CREATION, UPDATE, DELETION, LOGIN, EXPORT) to track team actions.

### 📦 4. Inventory, Warehouses, & Suppliers
* **Multi-Warehouse Routing**: Track inventory across multiple locations. Move stock items seamlessly between warehouses.
* **Purchase & Sales Orders**: Monitor sales flows, register incoming purchase requests, and link orders with specific suppliers.
* **Low Stock Alerts**: Automatic, visual indicators for items falling below safety margins, with glowing amber-to-red alert animations.

---

## 🛠️ Technology Stack

StockPilot Pro is built on top of a highly optimized Next.js + PostgreSQL architecture:

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) using Server Components and Optimistic Updates.
* **Language**: [TypeScript](https://www.typescriptlang.org/) for complete type-safety.
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with customized oklch space navy color tokens and modern keyframe animations.
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) coupled with [Prisma ORM](https://www.prisma.io/).
* **State & Query Management**: [TanStack Query v5](https://tanstack.com/query/latest) for declarative caching and optimistic mutations.
* **Authentication**: [NextAuth.js v5 (Beta)](https://next-auth.js.org/) supporting robust multi-tenant token strategies.
* **Animation & UI Primitives**: [Framer Motion](https://www.framer.com/motion/) for micro-interactions, spring-based counters, and [Base UI](https://base-ui.com/) for fully accessible controls.

---

## 📂 Repository Folder Structure

```bash
stockpilot-pro/
├── .github/                  # CI Workflows, Issue & PR templates
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── pull_request_template.md
│   └── workflows/
│       └── ci.yml
├── docs/                     # Visual assets and documentation
│   └── screenshots/
├── prisma/                   # Prisma database schemas and migration configurations
│   └── schema.prisma
├── public/                   # Static public assets (logos, fallback images)
├── src/                      # Source Code
│   ├── app/                  # Next.js App Router Pages and Layouts
│   ├── components/           # Reusable UI & Layout Components
│   │   ├── dashboard/        # Dashboard layout widgets
│   │   ├── inventory/        # Forms and search dialogs for items
│   │   ├── orders/           # Purchase & Sales order forms
│   │   ├── shared/           # DataTables, command palettes, page headers
│   │   └── ui/               # Lower-level primitives (Buttons, Selects, Orbs)
│   ├── hooks/                # Custom React Hooks
│   ├── lib/                  # Library utilities (zod validations, helpers, constants)
│   └── middleware.ts         # Global routing and NextAuth redirection
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory. Use the following keys:

```env
# Database Connections
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host:port/dbname"

# NextAuth Configurations
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-long-openssl-generated-secret"
AUTH_SECRET="same-as-above-secret"

# UploadThing Integration (Optional for invoice uploads)
UPLOADTHING_TOKEN="your-uploadthing-api-token"

# Node Settings
NODE_ENV="development"
```

---

## 🏁 Quick Installation Guide

Ensure you have [Node.js](https://nodejs.org/) (v20+) and a running [PostgreSQL](https://www.postgresql.org/) database.

### 1. Clone the repository
```bash
git clone https://github.com/Abhinav1480/stock-pilot.git
cd stock-pilot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Apply migrations & Generate database client
```bash
npx prisma db push
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛣️ Future Product Roadmap

- [ ] **AI-Powered Demand Forecasting**: Automate re-order trigger algorithms based on historical purchase orders and sales curves.
- [ ] **Barcode Scanning via Mobile Camera**: Native WebRTC video capture directly parsing barcodes to increment or decrement warehouse quantities.
- [ ] **Supplier Portal Integrations**: Dedicated VIEWER portal for external suppliers to update purchase order shipment tracking numbers.
- [ ] **Offline Synchronization**: Service-worker caching layer to support offline warehouse operations.

---

## 📄 License & Standards

This project is licensed under the [MIT License](LICENSE).
Our code practices are guided by our [Contributing Policy](CONTRIBUTING.md) and [Contributor Code of Conduct](CODE_OF_CONDUCT.md). Please report any vulnerabilities directly using the guidelines in our [Security Guidelines](SECURITY.md).
