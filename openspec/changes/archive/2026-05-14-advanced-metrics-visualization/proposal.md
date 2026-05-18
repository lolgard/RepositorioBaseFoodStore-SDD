# Proposal: Advanced Metrics Visualization

## Goal
Enhance the admin dashboard with advanced visualization capabilities, allowing for deeper business analysis through temporal filtering and data portability.

## Motivation
The current dashboard provides a good overview but lacks the ability to analyze trends over different time periods (weekly, monthly, quarterly) or export the data for external reporting. To make the platform more professional, administrators need these tools.

## Non-Goals
- Real-time notifications (this belongs to Change 22).
- Predictive analysis or AI-driven insights.

## User Stories
- **US-079**: As an Admin, I want to filter sales metrics by time range (7d, 30d, 90d) to analyze temporal trends.
- **US-080**: As an Admin, I want to see comparisons against the previous period to understand growth or decline.
- **US-081**: As an Admin, I want to export top products and sales data to CSV for external analysis.

## Proposed Changes
- Update `MetricsService` in the backend to support variable day ranges (already partially supported).
- Update Dashboard UI with a "Time Range Selector" (tabs or dropdown).
- Implement CSV export logic in the frontend using client-side blob generation.
- Enhance the visual representation of "Top Products" and "Sales Evolution" with trend indicators.
