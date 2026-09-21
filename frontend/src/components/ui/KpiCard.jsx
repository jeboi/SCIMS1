"use client";

import Link from "next/link";

/**
 * KpiCard — tactile stat card used across dashboards and reports.
 *
 * Implements the FleetOps design language:
 *   - "Tactile Physics Rule": interactive cards spring on hover with
 *     translateY(-3px) scale(1.004) over 280ms cubic-bezier.
 *   - 24px stat radius (rounded-3xl per spec).
 *   - 10% tone icon chip (rounded-2xl).
 *   - Linked cards carry visible focus ring + aria-label naming destination.
 *
 * Usage:
 *   <KpiCard label="Total Items" value={1234} />
 *   <KpiCard
 *       label="Pending POs"
 *       value={7}
 *       href="/purchase-orders/tracking"
 *       tone="warning"
 *       icon={ShoppingCart}
 *   />
 *   <KpiCard
 *       label="Revenue"
 *       value="₱45,200"
 *       note="+12% vs last week"
 *       trend="up"
 *   />
 */
export default function KpiCard({
    label,
    value,
    note,
    trend,               // "up" | "down" | "flat"
    tone = "neutral",    // "neutral" | "success" | "warning" | "danger" | "info"
    icon: Icon,
    href,
    onClick,
    className = "",
}) {
    const isInteractive = Boolean(href || onClick);

    // Tone → ring color used when hovering an interactive card
    const toneRing = {
        neutral: "ring-slate-200",
        success: "ring-emerald-200",
        warning: "ring-amber-200",
        danger:  "ring-red-200",
        info:    "ring-blue-200",
    }[tone];

    // Tone → icon chip background + text
    const toneChip = {
        neutral: "bg-slate-100 text-slate-600",
        success: "bg-emerald-50 text-emerald-600",
        warning: "bg-amber-50 text-amber-600",
        danger:  "bg-red-50 text-red-600",
        info:    "bg-blue-50 text-blue-600",
    }[tone];

    // Trend color
    const trendColor = {
        up:   "text-emerald-600",
        down: "text-red-600",
        flat: "text-slate-500",
    }[trend] || "text-slate-500";

    const trendSymbol = {
        up:   "▲",
        down: "▼",
        flat: "—",
    }[trend] || "";

    const trendLabel = {
        up:   "Trending up",
        down: "Trending down",
        flat: "Stable",
    }[trend] || "";

    // Wrapper: Link if href, div otherwise (with button role if onClick)
    const Wrapper = href ? Link : "div";
    const wrapperProps = href
        ? { href, "aria-label": `${label}: ${value}. Open ${label}.` }
        : onClick
        ? {
              onClick,
              role: "button",
              tabIndex: 0,
              "aria-label": `${label}: ${value}`,
          }
        : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={`
                group relative rounded-3xl border border-slate-200 bg-white p-5
                shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]
                transition-all duration-300
                ${
                    isInteractive
                        ? `cursor-pointer
                           hover:-translate-y-[3px] hover:scale-[1.004]
                           hover:shadow-[0_8px_24px_-8px_rgb(0_0_0_/_0.12)]
                           hover:ring-1 ${toneRing}
                           active:-translate-y-[1px] active:scale-[0.995]
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`
                        : "hover:-translate-y-[1px]"
                }
                ${className}
            `}
            style={{
                // 280ms cubic-bezier [0.32, 0.72, 0, 1] — FleetOps spec
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        {label}
                    </p>

                    <p className="mt-1.5 text-3xl font-semibold text-slate-900 font-data tabular-nums">
                        {value}
                    </p>

                    {note && (
                        <p className="mt-1 text-[11px] text-slate-500">
                            {note}
                        </p>
                    )}
                </div>

                {Icon && (
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneChip}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </div>

            {trend && (
                <p className={`mt-2 text-[11px] font-medium ${trendColor}`}>
                    {trendSymbol} {trendLabel}
                </p>
            )}
        </Wrapper>
    );
}