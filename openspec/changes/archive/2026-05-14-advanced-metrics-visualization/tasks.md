# Tasks: Advanced Metrics Visualization

- [x] **Infrastructure & API**
  - [x] Add `days` parameter to `getTopProducts` and `getOrdersByStatus` in `metrics-api.ts` if backend supports it (optional).
  - [x] Create utility `frontend/src/shared/lib/export-utils.ts` for CSV generation.

- [x] **Dashboard Enhancement**
  - [x] Implement `TimeRangeSelector` component in `DashboardPage.tsx`.
  - [x] Update state management to refetch on range change.
  - [x] Add trend mock indicators to `StatCard`.
  - [x] Integrate export buttons for "Sales Evolution" and "Top Products".

- [x] **Testing & Verification**
  - [x] Verify that selecting different ranges updates the bars correctly.
  - [x] Verify that CSV download contains the expected data rows.
  - [x] Ensure Midnight aesthetic is maintained with the new controls.
