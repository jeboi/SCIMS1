/**
 * SCIMS — Canonical Chart Tokens
 *
 * Implements the FleetOps design language's chart rules:
 *   - "Read chart fills from a central tokens file; never declare a private
 *     palette inside a page."
 *   - "Don't render black donut slices. Deepen blues instead."
 *   - Chart heights use canonical classes (chart-h-sm / md / lg).
 *
 * Every recharts component in SCIMS reads colors from these tokens.
 *
 * Usage:
 *   import { CHART } from "@/lib/chart-tokens";
 *   <Bar fill={CHART.primary} />
 */

export const CHART = {
    // ------------------------------------------------------------
    // Core series colors — for any chart's main data series
    // ------------------------------------------------------------
    primary: "#3b82f6",   // blue-500    — neutral data
    success: "#10b981",   // emerald-500 — good outcomes
    warning: "#f59e0b",   // amber-500   — attention needed
    danger:  "#ef4444",   // red-500     — bad outcomes / blockers
    info:    "#06b6d4",   // cyan-500    — informational
    purple:  "#8b5cf6",   // violet-500  — accent
    pink:    "#ec4899",   // pink-500    — accent
    slate:   "#64748b",   // slate-500   — neutral / muted

    // ------------------------------------------------------------
    // Extended palette — for charts with more than 8 series
    // Order matters: read by index when no explicit color is set.
    // ------------------------------------------------------------
    extended: [
        "#3b82f6", // blue-500
        "#10b981", // emerald-500
        "#f59e0b", // amber-500
        "#ef4444", // red-500
        "#8b5cf6", // violet-500
        "#06b6d4", // cyan-500
        "#ec4899", // pink-500
        "#64748b", // slate-500
    ],

    // ------------------------------------------------------------
    // Structural — grid, axis, labels
    // ------------------------------------------------------------
    grid:      "#e2e8f0",  // slate-200
    axis:      "#94a3b8",  // slate-400
    axisLabel: "#64748b",  // slate-500
    gridDash:  "3 3",      // Standard dash pattern

    // ------------------------------------------------------------
    // Tooltip surface (used by recharts Tooltip contentStyle)
    // ------------------------------------------------------------
    tooltip: {
        bg:        "#ffffff",
        border:    "#e2e8f0",
        text:      "#0f172a",  // slate-900
        textMuted: "#64748b",  // slate-500
        radius:    8,
        padding:   "8px 12px",
    },

    // ------------------------------------------------------------
    // Domain-specific series palettes
    // Named by module so each report uses consistent colors for the
    // same concept across the whole app.
    // ------------------------------------------------------------

    /**
     * Delivery statuses — use in any delivery/logistics chart.
     * Matches the tone of the corresponding <StatusBadge> in status.js.
     */
    delivery: {
        pending:    "#f59e0b",  // warning
        inTransit:  "#3b82f6",  // info
        delivered:  "#10b981",  // success
        cancelled:  "#ef4444",  // danger
    },

    /**
     * Purchase order statuses — use in PO-related charts.
     */
    purchaseOrder: {
        pending:    "#f59e0b",
        approved:   "#3b82f6",   // FleetOps rule: no black slices; deepen blue
        processing: "#8b5cf6",
        completed:  "#10b981",
        rejected:   "#ef4444",
    },

    /**
     * Purchase request statuses.
     */
    purchaseRequest: {
        pending:   "#f59e0b",
        approved:  "#10b981",
        rejected:  "#ef4444",
    },

    /**
     * Inventory stock states.
     */
    inventory: {
        inStock:    "#10b981",
        lowStock:   "#f59e0b",
        outOfStock: "#ef4444",
    },

    /**
     * Supplier ratings — bucket by star tier.
     */
    supplier: {
        high:    "#10b981",  // 4-5 stars
        medium:  "#f59e0b",  // 2.5-4 stars
        low:     "#ef4444",  // 0-2.5 stars
        unrated: "#94a3b8",  // slate-400
    },

    /**
     * Inventory transaction types.
     */
    transaction: {
        receiving:    "#10b981",
        issuing:      "#3b82f6",
        transfer_in:  "#06b6d4",
        transfer_out: "#f59e0b",
        adjustment:   "#8b5cf6",
        return:       "#ef4444",
    },
};

/**
 * Canonical chart container heights.
 *
 * Use `.chart-h-sm`, `.chart-h-md`, or `.chart-h-lg` in className —
 * the corresponding pixel heights match these constants.
 */
export const CHART_HEIGHT = {
    sm: 220,
    md: 260,
    lg: 300,
};

/**
 * Common recharts props applied consistently across all charts.
 * Spread these into any <ResponsiveContainer> or chart component.
 */
export const CHART_DEFAULTS = {
    margin: { top: 12, right: 16, left: 0, bottom: 0 },
    animationDuration: 400,
    strokeWidth: 2,
    fontSize: 11,
};

/**
 * Standard tooltip contentStyle object for recharts <Tooltip />.
 * Keeps tooltips consistent across every chart.
 */
export const TOOLTIP_STYLE = {
    backgroundColor: CHART.tooltip.bg,
    border: `1px solid ${CHART.tooltip.border}`,
    borderRadius: `${CHART.tooltip.radius}px`,
    padding: CHART.tooltip.padding,
    fontSize: "12px",
    color: CHART.tooltip.text,
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
};