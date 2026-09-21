"use client";

import { resolveStatus, toneClasses } from "@/lib/status";

/**
 * StatusBadge — the single component for every status pill in SCIMS.
 *
 * Implements the FleetOps design language:
 *   - "10% tint of the signal color for background"
 *   - "AA-safe 700-variant for text" (per Strict Status Contrast Rule)
 *   - "One state = one color, globally" (via lib/status.js)
 *
 * Usage:
 *   <StatusBadge status="pending" />
 *   <StatusBadge status="approved" size="sm" />
 *   <StatusBadge status="delivered" withDot />
 *   <StatusBadge status={item.status} />      // unknown statuses fall back safely
 */
export default function StatusBadge({
    status,
    size = "md",
    withDot = false,
    className = "",
}) {
    const { label, tone } = resolveStatus(status);
    const c = toneClasses(tone);

    // Size variants
    const sizeCls =
        size === "sm"
            ? "text-[10.5px] px-1.5 py-0.5 gap-1"
            : "text-xs px-2 py-0.5 gap-1.5";

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium border ${c.bg} ${c.text} ${c.border} ${sizeCls} ${className}`}
            // `title` shows the full status on hover if truncated
            title={label}
        >
            {withDot && (
                <span
                    className={`h-1.5 w-1.5 rounded-full ${c.dot}`}
                    aria-hidden="true"
                />
            )}
            <span className="leading-none">{label}</span>
        </span>
    );
}