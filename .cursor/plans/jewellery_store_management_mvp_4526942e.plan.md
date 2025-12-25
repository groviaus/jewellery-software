---
name: Jewellery Store Management MVP
overview: "Build a complete jewellery store management MVP with 6 modules: Authentication, Store Settings, Inventory Management, Customer Management, Billing/POS, and Reports. Implementation will be phase-by-phase with verification at each step."
todos:
  - id: phase0-setup
    content: "Phase 0: Set up project infrastructure - Install dependencies, configure Supabase, set up Shadcn UI, create database schema with RLS policies, and set up environment variables"
    status: completed
  - id: phase1-auth
    content: "Phase 1: Implement Authentication Module - Create login page, API routes, middleware for protected routes, and session management. Verify login/logout works."
    status: completed
    dependencies:
      - phase0-setup
  - id: phase2-settings
    content: "Phase 2: Implement Store Settings Module - Create settings page, API routes, and form. Store name, GST number, address, and GST rate configuration. Verify settings persist."
    status: completed
    dependencies:
      - phase1-auth
  - id: phase3-inventory
    content: "Phase 3: Implement Inventory Management Module - Create inventory pages (list, add, edit), API routes, item form with all attributes (metal_type, purity, weights, making_charge, etc.), search functionality. Verify CRUD operations work."
    status: completed
    dependencies:
      - phase2-settings
  - id: phase4-customers
    content: "Phase 4: Implement Customer Management Module - Create customer pages, API routes, customer form, purchase history view. Verify customer CRUD and history display."
    status: completed
    dependencies:
      - phase3-inventory
  - id: phase5-billing
    content: "Phase 5: Implement Billing/POS Module - Create POS screen, invoice generation, GST calculations, PDF generation, stock auto-reduction. Verify complete billing flow and calculations."
    status: completed
    dependencies:
      - phase4-customers
  - id: phase6-reports
    content: "Phase 6: Implement Reports Module - Create reports pages, daily sales report, stock summary, revenue tracking. Verify reports display correct data."
    status: completed
    dependencies:
      - phase5-billing
  - id: phase7-dashboard
    content: "Phase 7: Create Dashboard - Build main dashboard with today's sales, stock count, recent transactions, and quick navigation. Verify all stats are accurate."
    status: completed
    dependencies:
      - phase6-reports
---

# Jewellery Store Managem

ent MVP - Complete Implementation Plan

## Overview

This plan implements a complete jewellery store management system following the specifications in `src/app/plans/plans.txt`. The implementation will be done in phases, with each module verified before proceeding to the next.

## Architecture

```javascript
Frontend (Next.js 16 + React 19)
├── UI Layer (Shadcn UI + Tailwind CSS)
├── API Routes (Next.js API Routes)
└── Data Layer (Supabase Client)

Backend (Supabase)
├── PostgreSQL Database
├── Row Level Security (RLS)
└── Authentication
```



## Phase-by-Phase Implementation

### Phase 0: Project Setup & Infrastructure

**Dependencies to Install:**

- `@supabase/supabase-js` - Supabase client with mcp
- `@supabase/ssr` - Server-side Supabase
- `shadcn/ui` components (button, card, input, table, dialog, form, etc.)
- `react-hook-form` + `zod` - Form validation
- `@tanstack/react-query` - Data fetching
- `jspdf` + `jspdf-autotable` - PDF invoice generation
- `date-fns` - Date formatting
- store - Zustand

**Files to Create:**

- `src/lib/supabase/client.ts` - Supabase client
- `src/lib/supabase/server.ts` - Server-side Supabase
- `src/lib/supabase/middleware.ts` - Auth middleware
- `src/components/ui/` - Shadcn components directory
- `components.json` - Shadcn config
- `.env.local` - Environment variables template

**Database Schema (Supabase):**

- `users` table (extends Supabase auth.users)
- `store_settings` table
- `items` table
- `customers` table
- `invoices` table
- `invoice_items` table

### Phase 1: Authentication Module (Module 6)

**Files:**

- `src/app/login/page.tsx` - Login page
- `src/app/api/auth/login/route.ts` - Login API
- `src/middleware.ts` - Route protection
- `src/app/(protected)/layout.tsx` - Protected routes layout
- `src/components/auth/LoginForm.tsx` - Login form component

**Features:**

- Owner login (email/password)
- Protected routes middleware
- Session management
- Redirect to dashboard after login

**Verification:**

- Login works
- Protected routes redirect to login
- Session persists on refresh

### Phase 2: Store Settings Module (Module 5)

**Files:**

- `src/app/(protected)/settings/page.tsx` - Settings page
- `src/app/api/settings/route.ts` - Settings API (GET/PUT)
- `src/components/settings/StoreSettingsForm.tsx` - Settings form
- `src/lib/hooks/useStoreSettings.ts` - Settings hook

**Features:**

- Store name, GST number, address
- GST rate configuration (default 3%)
- Currency display (INR)
- Save/update settings

**Verification:**

- Settings save and load correctly
- Settings persist across sessions

### Phase 3: Inventory Management Module (Module 2)

**Files:**

- `src/app/(protected)/inventory/page.tsx` - Inventory list page
- `src/app/(protected)/inventory/new/page.tsx` - Add item page
- `src/app/(protected)/inventory/[id]/edit/page.tsx` - Edit item page
- `src/app/api/inventory/route.ts` - Inventory API (GET/POST)
- `src/app/api/inventory/[id]/route.ts` - Item API (GET/PUT/DELETE)
- `src/components/inventory/ItemForm.tsx` - Item form component
- `src/components/inventory/InventoryTable.tsx` - Items table
- `src/lib/types/inventory.ts` - TypeScript types

**Features:**

- Add/edit/delete jewellery items
- Item attributes: name, metal_type, purity, gross_weight, net_weight, making_charge, quantity, sku
- Search by name/SKU
- Stock list view
- Auto-reduce stock on sale (handled in billing module)

**Verification:**

- CRUD operations work
- Search functionality works
- Stock quantities display correctly

### Phase 4: Customer Management Module (Module 3)

**Files:**

- `src/app/(protected)/customers/page.tsx` - Customers list page
- `src/app/(protected)/customers/new/page.tsx` - Add customer page
- `src/app/api/customers/route.ts` - Customers API (GET/POST)
- `src/app/api/customers/[id]/route.ts` - Customer API (GET/PUT/DELETE)
- `src/app/api/customers/[id]/history/route.ts` - Purchase history API
- `src/components/customers/CustomerForm.tsx` - Customer form
- `src/components/customers/CustomerTable.tsx` - Customers table
- `src/components/customers/PurchaseHistory.tsx` - History component
- `src/lib/types/customer.ts` - TypeScript types

**Features:**

- Add/edit customers (name, phone)
- Customer list view
- Purchase history per customer
- Customer selection in billing

**Verification:**

- Customer CRUD works
- Purchase history displays correctly
- Customer can be selected in billing

### Phase 5: Billing/POS Module (Module 1)

**Files:**

- `src/app/(protected)/billing/page.tsx` - POS billing screen
- `src/app/(protected)/billing/invoice/[id]/page.tsx` - Invoice view/print
- `src/app/api/billing/invoice/route.ts` - Create invoice API
- `src/app/api/billing/invoice/[id]/route.ts` - Get invoice API
- `src/app/api/billing/invoice/[id]/pdf/route.ts` - PDF generation API
- `src/components/billing/POSScreen.tsx` - Main POS component
- `src/components/billing/ItemSelector.tsx` - Item selection
- `src/components/billing/CustomerSelector.tsx` - Customer selection
- `src/components/billing/InvoicePreview.tsx` - Invoice preview
- `src/components/billing/InvoicePDF.tsx` - PDF invoice component
- `src/lib/utils/calculations.ts` - GST and total calculations
- `src/lib/types/billing.ts` - TypeScript types

**Features:**

- POS-style billing interface
- Add items to cart
- Auto-calculate: gold value, making charges, GST, grand total
- Customer selection/creation
- Generate invoice
- Print/download PDF invoice
- Auto-reduce inventory stock
- Invoice numbering

**Verification:**

- Billing flow works end-to-end
- Calculations are correct (GST, totals)
- Stock reduces automatically
- PDF generates correctly
- Invoice saves to database

### Phase 6: Reports Module (Module 4)

**Files:**

- `src/app/(protected)/reports/page.tsx` - Reports dashboard
- `src/app/(protected)/reports/daily/page.tsx` - Daily sales report
- `src/app/api/reports/daily/route.ts` - Daily sales API
- `src/app/api/reports/stock/route.ts` - Stock summary API
- `src/components/reports/DailySalesReport.tsx` - Daily sales component
- `src/components/reports/StockSummary.tsx` - Stock summary component
- `src/components/reports/RevenueChart.tsx` - Revenue chart (optional)
- `src/lib/types/reports.ts` - TypeScript types

**Features:**

- Daily sales summary
- Total revenue (date range)
- Sold items list
- Current stock summary
- Export to PDF/CSV (optional)

**Verification:**

- Reports display correct data
- Date filtering works
- Export functions work (if implemented)

### Phase 7: Dashboard (Entry Point)

**Files:**

- `src/app/(protected)/dashboard/page.tsx` - Main dashboard
- `src/components/dashboard/StatsCards.tsx` - Today's stats
- `src/components/dashboard/RecentSales.tsx` - Recent sales list
- `src/app/api/dashboard/stats/route.ts` - Dashboard stats API

**Features:**

- Today's sales summary
- Stock count
- Recent transactions
- Quick actions

**Verification:**

- Dashboard loads correctly
- Stats are accurate
- Navigation works

## Database Schema Details

### Tables Structure

```sql
-- Store Settings
store_settings (
  id uuid primary key,
  user_id uuid references auth.users,
  store_name text,
  gst_number text,
  address text,
  gst_rate decimal default 3.0,
  created_at timestamp,
  updated_at timestamp
)

-- Items
items (
  id uuid primary key,
  user_id uuid references auth.users,
  name text,
  metal_type text, -- 'Gold', 'Silver', 'Diamond'
  purity text, -- '22K', '18K', etc.
  gross_weight decimal,
  net_weight decimal,
  making_charge decimal,
  quantity integer default 1,
  sku text unique,
  created_at timestamp,
  updated_at timestamp
)

-- Customers
customers (
  id uuid primary key,
  user_id uuid references auth.users,
  name text,
  phone text,
  created_at timestamp,
  updated_at timestamp
)

-- Invoices
invoices (
  id uuid primary key,
  user_id uuid references auth.users,
  customer_id uuid references customers(id),
  invoice_number text unique,
  total_amount decimal,
  gst_amount decimal,
  gold_value decimal,
  making_charges decimal,
  created_at timestamp
)

-- Invoice Items
invoice_items (
  id uuid primary key,
  invoice_id uuid references invoices(id),
  item_id uuid references items(id),
  quantity integer,
  weight decimal,
  price decimal,
  created_at timestamp
)
```



## Key Implementation Details

1. **Authentication**: Use Supabase Auth with email/password. Single user (owner) only.
2. **RLS Policies**: All tables have RLS enabled, users can only access their own data.
3. **GST Calculation**: Applied on (gold_value + making_charges) at configured rate.
4. **Stock Management**: Quantity reduces automatically when item is sold.
5. **Invoice Numbering**: Auto-generated sequential numbers (INV-001, INV-002, etc.)
6. **PDF Generation**: Server-side PDF generation using jsPDF for invoices.

## File Structure

```javascript
src/
├── app/
│   ├── (protected)/          # Protected routes
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── customers/
│   │   ├── billing/
│   │   ├── reports/
│   │   └── settings/
│   ├── login/
│   ├── api/                   # API routes
│   └── layout.tsx
├── components/
│   ├── ui/                    # Shadcn components
│   ├── auth/
│   ├── inventory/
│   ├── customers/
│   ├── billing/
│   ├── reports/
│   └── dashboard/
├── lib/
│   ├── supabase/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── middleware.ts
```



## Verification Checklist Per Phase

Each phase must pass these checks before proceeding:

- [ ] All CRUD operations work
- [ ] Data persists correctly
- [ ] UI is responsive and functional
- [ ] No console errors
- [ ] TypeScript types are correct
- [ ] RLS policies work (user isolation)
- [ ] Forms validate correctly
- [ ] Error handling is in place

## Dependencies Summary

**Core:**

- next, react, react-dom (already installed)
- @supabase/supabase-js, @supabase/ssr
- tailwindcss (already installed)

**UI:**

- shadcn/ui components
- react-hook-form, zod
- @radix-ui/react-* (via shadcn)

**Data:**

- @tanstack/react-query