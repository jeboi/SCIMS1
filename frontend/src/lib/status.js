/**
 * SCIMS — Canonical Status Taxonomy
 *
 * Implements the FleetOps design language's status rules:
 *   - "One state = one color, globally"
 *   - "Strict Status Contrast Rule" — base hex for fills, AA-safe 700-variant
 *     for sub-14px text.
 *
 * Every status in the entire app resolves through this file. Never hardcode
 * a status color inside a page.
 *
 * Usage:
 *   import { resolveStatus } from "@/lib/status";
 *   const { label, tone } = resolveStatus("pending");
 */

/**
 * Tone palette — FleetOps-aligned.
 *
 * Each tone carries:
 *   - `bg`      subtle surface tint (for badge background)
 *   - `text`    AA-safe text color for sub-14px (700-variant per spec)
 *   - `border`  1px border color for outlined variants
 *   - `dot`     solid dot color for indicators
 *   - `solid`   saturated fill for large graphical elements (charts, big pills)
 *
 * The base FleetOps hex values are reserved for `solid` (large elements). The
 * `text` color is deliberately darker than the base — per the Strict Status
 * Contrast Rule, sub-14px text must use the AA-safe 700-variant.
 */
export const TONES = {
    success: {
        // FleetOps base: #10b981 (emerald-500)
        bg: "bg-emerald-50",
        text: "text-emerald-700",       // AA-safe 700-variant
        border: "border-emerald-200",
        dot: "bg-emerald-500",
        solid: "bg-emerald-500",
        hex: "#10b981",
        hexText: "#047857",              // emerald-700
    },
    warning: {
        // FleetOps base: #f59e0b (amber-500)
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500",
        solid: "bg-amber-500",
        hex: "#f59e0b",
        hexText: "#b45309",
    },
    danger: {
        // FleetOps base: #ef4444 (red-500)
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-500",
        solid: "bg-red-500",
        hex: "#ef4444",
        hexText: "#b91c1c",
    },
    info: {
        // FleetOps base: #3b82f6 (blue-500)
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500",
        solid: "bg-blue-500",
        hex: "#3b82f6",
        hexText: "#1d4ed8",
    },
    neutral: {
        // FleetOps muted: #6b7280 (gray-500)
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
        dot: "bg-slate-400",
        solid: "bg-slate-500",
        hex: "#6b7280",
        hexText: "#334155",
    },
};

/**
 * Every status across every SCIMS module.
 *
 * Add new statuses here — never hardcode a status color inside a page.
 */
export const STATUS = {
    // ---- Generic ----
    active:     { label: "Active",     tone: "success" },
    inactive:   { label: "Inactive",   tone: "neutral" },
    draft:      { label: "Draft",      tone: "neutral" },
    archived:   { label: "Archived",   tone: "neutral" },

    // ---- Generic workflow ----
    pending:    { label: "Pending",    tone: "warning" },
    approved:   { label: "Approved",   tone: "success" },
    rejected:   { label: "Rejected",   tone: "danger" },
    processing: { label: "Processing", tone: "info" },
    completed:  { label: "Completed",  tone: "success" },
    cancelled:  { label: "Cancelled",  tone: "danger" },

    // ---- Logistics / deliveries ----
    in_transit: { label: "In Transit", tone: "info" },
    delivered:  { label: "Delivered",  tone: "success" },
    submitted:  { label: "Submitted",  tone: "info" },
    received:   { label: "Received",   tone: "success" },

    // ---- Inventory ----
    low_stock:    { label: "Low Stock",    tone: "warning" },
    out_of_stock: { label: "Out of Stock", tone: "danger" },
    in_stock:     { label: "In Stock",     tone: "success" },

    // ---- Suppliers ----
    rated:   { label: "Rated",   tone: "info" },
    unrated: { label: "Unrated", tone: "neutral" },

    // ---- Inventory transactions ----
    receiving:    { label: "Receiving",    tone: "success" },
    issuing:      { label: "Issuing",      tone: "info" },
    transfer_in:  { label: "Transfer In",  tone: "info" },
    transfer_out: { label: "Transfer Out", tone: "warning" },
    adjustment:   { label: "Adjustment",   tone: "neutral" },
    return:       { label: "Return",       tone: "danger" },
};

/**
 * Resolve a raw status string to its canonical entry.
 *
 * Handles:
 *   - Case-insensitive lookup
 *   - Spaces → underscores ("In Transit" → "in_transit")
 *   - Null / undefined → neutral "—"
 *   - Unknown status → neutral with the raw value preserved
 */
export function resolveStatus(status) {
    if (status === null || status === undefined || status === "") {
        return { label: "—", tone: "neutral", key: null };
    }

    const key = String(status).toLowerCase().trim().replace(/\s+/g, "_");
    const entry = STATUS[key];

    if (entry) {
        return { ...entry, key };
    }

    // Unknown status — show raw value with neutral tone (never crash)
    return { label: String(status), tone: "neutral", key };
}

/**
 * Get the Tailwind class bundle for a given tone.
 * Falls back to neutral for safety.
 */
export function toneClasses(tone = "neutral") {
    return TONES[tone] || TONES.neutral;
}