"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function SidebarItem({
    title,
    href,
    icon: Icon,
    level = 0,
    open = true,
}) {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);
    const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 80 });
    const itemRef = useRef(null);

    if (!href) return null;

    const active =
        pathname === href ||
        (href !== "/dashboard" && pathname.startsWith(`${href}/`));

    const handleMouseEnter = () => {
        if (!open && itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            setFlyoutPos({
                top: rect.top + rect.height / 2,
                left: rect.right + 10,
            });
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (!open) {
            setIsHovered(false);
        }
    };

    return (
        <div
            className="relative w-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link
                ref={itemRef}
                href={href}
                className={clsx(
                    "group flex min-w-0 items-center rounded-xl text-sm font-medium transition-all duration-200",
                    open
                        ? "px-3 py-2.5"
                        : "justify-center px-2 py-2.5",
                    level > 0 && open && "ml-4 text-xs",
                    active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-500/50"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                )}
            >
                {Icon && (
                    <Icon
                        size={19}
                        strokeWidth={1.8}
                        className={clsx(
                            "shrink-0 transition-colors duration-200",
                            open && "mr-3",
                            active
                                ? "text-white"
                                : "text-slate-400 group-hover:text-slate-100"
                        )}
                    />
                )}

                {open && (
                    <span className="min-w-0 leading-tight whitespace-normal break-words">
                        {title}
                    </span>
                )}
            </Link>

            {/* SINGLE ITEM FLOATING BADGE TOOLTIP */}
            {!open && isHovered && (
                <div
                    style={{
                        position: "fixed",
                        top: `${flyoutPos.top}px`,
                        left: `${flyoutPos.left}px`,
                        transform: "translateY(-50%)",
                    }}
                    className="z-50 whitespace-nowrap rounded-xl border border-slate-700/60 bg-[#0f172a]/95 px-3.5 py-2 text-xs font-semibold text-slate-100 shadow-xl shadow-slate-950/80 backdrop-blur-xl animate-in fade-in-0 slide-in-from-left-2 duration-150 ease-out"
                >
                    {title}
                </div>
            )}
        </div>
    );
}