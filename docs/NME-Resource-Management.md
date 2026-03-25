# NME Resource Management Dashboard - Developer Guide

This document explains the NME Resource Management feature for junior developers. It covers the architecture, database structure, and how data flows through the application.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Database Schema](#database-schema)
4. [How It Works](#how-it-works)
5. [Component Breakdown](#component-breakdown)
6. [Data Flow](#data-flow)
7. [Key Concepts](#key-concepts)

---

## Overview

The NME Resource Management dashboard allows users to:
- Select an NME (New Molecular Entity) from a dropdown
- View FTE (Full-Time Equivalent) demand for that NME
- See a monthly chart showing resource utilization by role
- View studies and staff assignments linked to the NME

**URL:** `/rm/nme`

---

## File Structure

```
src/
├── app/
│   └── rm/
│       └── nme/
│           └── page.tsx          # Main page component (server-side)
├── components/
│   └── rm/
│       ├── NMESelector.tsx       # Dropdown to select NME (client-side)
│       ├── FTEDemandChart.tsx    # Recharts bar chart (reused)
│       └── AllocationTable.tsx   # Study allocation table (reused)
├── types/
│   └── resource-management.ts    # TypeScript interfaces
└── lib/
    └── prisma.ts                 # Database connection

scripts/
└── seed_rm_data.py               # Python script to populate database

prisma/
└── views/
    └── v_rm_monthly_by_nme.sql   # SQL view definition
```

---

## Database Schema

### Tables

#### `rm_study`
Stores study information linked to NMEs.

| Column     | Type | Description                          |
|------------|------|--------------------------------------|
| id         | TEXT | Primary key (e.g., "ABC", "NME-004-S1") |
| phase      | INT  | Clinical trial phase (1, 2, 3)       |
| status     | TEXT | Study status ("Active")              |
| complexity | TEXT | "Low", "Medium", or "High"           |
| nme_id     | TEXT | Foreign key to NME table             |

#### `rm_study_segment`
Stores time-based work segments for each study.

| Column       | Type  | Description                        |
|--------------|-------|------------------------------------|
| id           | INT   | Primary key (auto-increment)       |
| study_id     | TEXT  | Foreign key to rm_study            |
| activity     | TEXT  | "Start Up", "Conduct", "Close Out" |
| start_date   | DATE  | When the segment begins            |
| end_date     | DATE  | When the segment ends              |
| complexity   | TEXT  | Complexity level                   |
| role         | TEXT  | Staff role for this work           |
| phase        | INT   | Clinical phase                     |
| days         | INT   | Duration in days                   |
| fte_per_month| FLOAT | FTE required per month             |

#### `rm_monthly_fte`
Stores calculated monthly FTE values (prorated).

| Column     | Type  | Description                    |
|------------|-------|--------------------------------|
| id         | INT   | Primary key                    |
| segment_id | INT   | Foreign key to rm_study_segment|
| month_date | DATE  | First day of month             |
| fte_value  | FLOAT | Prorated FTE for that month    |

#### `rm_personnel`
Stores staff member information.

| Column           | Type  | Description              |
|------------------|-------|--------------------------|
| id               | INT   | Primary key              |
| name             | TEXT  | Staff member name        |
| total_allocation | FLOAT | Total FTE capacity (0-1) |
| adjustment       | FLOAT | FTE adjustments          |

#### `rm_staff_assignment`
Links staff to studies with allocation percentages.

| Column         | Type  | Description                |
|----------------|-------|----------------------------|
| id             | INT   | Primary key                |
| study_id       | TEXT  | Foreign key to rm_study    |
| personnel_id   | INT   | Foreign key to rm_personnel|
| role           | TEXT  | Role in this assignment    |
| allocation_pct | FLOAT | Percentage allocated (0-1) |

### Database View

#### `v_rm_monthly_by_nme`
Aggregates monthly FTE by NME and role for efficient querying.

```sql
CREATE VIEW v_rm_monthly_by_nme AS
SELECT
  m.month_date,
  TO_CHAR(m.month_date, 'Mon-YY') AS month_label,
  s.nme_id,
  seg.role,
  SUM(m.fte_value) AS fte_demand
FROM rm_monthly_fte m
JOIN rm_study_segment seg ON seg.id = m.segment_id
JOIN rm_study s ON s.id = seg.study_id
WHERE s.nme_id IS NOT NULL
GROUP BY m.month_date, s.nme_id, seg.role;
```

---

## How It Works

### 1. User Visits `/rm/nme`

The page is a **Server Component** (runs on the server, not in the browser).

```typescript
// src/app/rm/nme/page.tsx
export default async function NMERMPage({
  searchParams,
}: {
  searchParams: Promise<{ nme?: string }>;
}) {
  const { nme: selectedNmeId } = await searchParams;
  // ...
}
```

### 2. Server Fetches NME List

```typescript
const nmeRows = await prisma.$queryRaw<NMEOption[]>`
  SELECT id, code, name FROM "NME" ORDER BY code
`;
```

### 3. If No NME Selected → Show Empty State

The page displays a prompt asking the user to select an NME.

### 4. If NME Selected → Fetch Data

```typescript
// Get monthly FTE data for this NME
const monthlyRaw = await prisma.$queryRaw<NMEMonthlyRoleDemand[]>`
  SELECT month_date, month_label, nme_id, role, fte_demand::float
  FROM v_rm_monthly_by_nme
  WHERE nme_id = ${selectedNmeId}
  ORDER BY month_date, role
`;
```

### 5. Transform Data for Chart

The raw data is "pivoted" into a format the chart component expects:

```typescript
// Raw data: [{ month: "Jan-24", role: "Clinical Scientist", fte: 0.5 }, ...]
// Pivoted:  [{ month: "Jan-24", "Clinical Scientist": 0.5, "Medical Monitor": 0.3, ... }]
```

### 6. Render Components

The server returns HTML with:
- Summary cards (studies, FTE totals)
- FTE demand chart
- Studies table

---

## Component Breakdown

### `NMESelector.tsx` (Client Component)

This is marked with `"use client"` because it needs interactivity.

```typescript
"use client";

import { useRouter } from "next/navigation";

export function NMESelector({ nmes, selectedId }: NMESelectorProps) {
  const router = useRouter();

  const handleChange = (value: string) => {
    // Navigate to same page with ?nme=<id> parameter
    router.push(`/rm/nme?nme=${value}`);
  };

  return (
    <Select value={selectedId} onValueChange={handleChange}>
      {/* ... dropdown options */}
    </Select>
  );
}
```

**Key Points:**
- Uses `useRouter` to change the URL when user selects an NME
- The page re-renders with new data because the URL changed

### `FTEDemandChart.tsx` (Client Component)

A reusable Recharts stacked bar chart.

```typescript
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export function FTEDemandChart({ data }: { data: MonthlyDemandChartRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={data}>
        <Bar dataKey="Clinical Scientist" stackId="a" fill="#6366f1" />
        <Bar dataKey="Medical Monitor" stackId="a" fill="#10b981" />
        <Bar dataKey="Clinical RA" stackId="a" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

**Key Points:**
- `stackId="a"` makes bars stack on top of each other
- Each role has a different color

### `SummaryCard` (Inline Component)

A simple display component for metrics.

```typescript
function SummaryCard({ icon: Icon, label, value, sub, iconBg, valueColor }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTION                              │
│                   Selects NME from dropdown                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      URL CHANGE                                  │
│              /rm/nme?nme=cmn3g4lnw00011ascs1382ns0              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVER COMPONENT                               │
│                   (page.tsx runs)                                │
│                                                                  │
│  1. Read searchParams.nme                                        │
│  2. Query database for NME list                                  │
│  3. Query v_rm_monthly_by_nme for FTE data                      │
│  4. Query rm_study for studies list                              │
│  5. Transform data for chart                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER HTML                                   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ SummaryCard  │  │ SummaryCard  │  │ SummaryCard  │           │
│  │   Studies    │  │  Total FTE   │  │   Peak FTE   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │            FTEDemandChart                        │            │
│  │    (Client Component - interactive)              │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │            Studies Table                         │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### Server vs Client Components

| Server Component | Client Component |
|------------------|------------------|
| Runs on server only | Runs in browser |
| Can access database directly | Cannot access database |
| Cannot use React hooks | Can use useState, useEffect |
| Cannot handle user events | Can handle onClick, onChange |
| Default in Next.js App Router | Must add `"use client"` |

**In this feature:**
- `page.tsx` is a Server Component (fetches data)
- `NMESelector.tsx` is a Client Component (handles user selection)
- `FTEDemandChart.tsx` is a Client Component (interactive chart)

### FTE (Full-Time Equivalent)

FTE measures how much of a person's time is allocated:
- 1.0 FTE = Full-time (100%)
- 0.5 FTE = Half-time (50%)
- 0.25 FTE = Quarter-time (25%)

### Prorated FTE

When a study segment spans partial months, the FTE is prorated:

```
FTE for month = (FTE per month) × (days active in month / total days in month)
```

Example: If a segment with 1.0 FTE/month starts on Jan 15:
- Days active in January = 17 (Jan 15-31)
- Total days in January = 31
- Prorated FTE = 1.0 × (17/31) = 0.55

### SQL Views

A view is like a saved query. Instead of writing complex JOINs every time, we create a view once:

```sql
-- Without view (complex query every time):
SELECT ... FROM rm_monthly_fte m
JOIN rm_study_segment seg ON seg.id = m.segment_id
JOIN rm_study s ON s.id = seg.study_id
WHERE s.nme_id = ?
GROUP BY ...

-- With view (simple query):
SELECT * FROM v_rm_monthly_by_nme WHERE nme_id = ?
```

### Prisma Raw Queries

We use `prisma.$queryRaw` for complex SQL that Prisma's ORM doesn't handle well:

```typescript
// Using raw SQL with template literals
const data = await prisma.$queryRaw<MyType[]>`
  SELECT * FROM my_table WHERE id = ${myVariable}
`;
```

**Security:** The `${variable}` syntax is safe - Prisma automatically prevents SQL injection.

---

## Common Tasks

### Adding a New Summary Card

1. Calculate the metric in `page.tsx`
2. Add a new `<SummaryCard>` component:

```typescript
<SummaryCard
  icon={YourIcon}
  label="Your Label"
  value={yourValue}
  sub="Description"
  iconBg="bg-purple-50"
  valueColor="text-purple-700"
/>
```

### Adding a New Role to the Chart

1. Update the `MonthlyDemandChartRow` interface in `types/resource-management.ts`
2. Update the pivot logic in `page.tsx`
3. Add a new `<Bar>` in `FTEDemandChart.tsx`

### Modifying the Studies Table

Edit the `NMEStudiesTable` function in `page.tsx`:
- Add new columns to `<thead>`
- Add new `<td>` cells to the row mapping

---

## Troubleshooting

### "No resource data available"

**Cause:** The selected NME has no studies with FTE segments.

**Fix:** Run the seed script to generate data:
```bash
DATABASE_URL="your-connection-string" python scripts/seed_rm_data.py
```

### Chart Not Rendering

**Cause:** Client component not hydrating properly.

**Check:**
1. Is `"use client"` at the top of the component?
2. Are Recharts dependencies installed?
3. Check browser console for errors.

### Data Not Updating

**Cause:** The page uses `force-dynamic`, so it should always fetch fresh data.

**Check:**
1. Verify database has the data: query `v_rm_monthly_by_nme` directly
2. Check Vercel logs for query errors
3. Ensure environment variables are set correctly

---

## Further Reading

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
