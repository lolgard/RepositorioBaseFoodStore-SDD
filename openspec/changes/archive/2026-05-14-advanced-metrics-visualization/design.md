# Design: Advanced Metrics Visualization

## Overview
The design focuses on adding interactive controls to the existing Dashboard without introducing heavy charting libraries, maintaining the Midnight aesthetic through optimized CSS visualizations and standard export formats.

## Backend Changes
- **MetricsService**: No changes needed as `get_sales_evolution` already accepts a `days` parameter.
- Ensure `get_top_products` also supports a `days` range if possible (currently it takes `limit`). *Correction*: Let's stick to the current API and focus on UI interactivity.

## Frontend Changes
- **DashboardPage.tsx**:
  - State addition: `days` (default 30).
  - Effect update: Re-fetch all metrics when `days` changes.
  - UI Addition: A tab-style selector (7d, 30d, 90d, 365d) in the header.
  - UI Addition: "Export to CSV" buttons in each card.
- **Trend Indicators**:
  - Add simple +/- percentage indicators if data allows (mocked or calculated if we fetch 2x the period).

## Export Logic
- Implement a `downloadAsCSV(data, filename)` utility.
- Format `SalesPoint` and `TopProduct` arrays into CSV strings.
- Trigger browser download using `URL.createObjectURL`.

## Components
- **TimeRangeSelector**: A group of buttons with glassmorphic styles.
- **StatCard Enhancement**: Small trend arrows (up/down).
