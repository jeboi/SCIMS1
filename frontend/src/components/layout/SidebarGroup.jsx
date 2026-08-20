"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import SidebarItem from "./SidebarItem";
import clsx from "clsx";

export default function SidebarGroup({
    title,
    icon: Icon,
    children = [],
    open = true,
}) {
    const pathname = usePathname();
    const [groupOpen, setGroupOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 80 });
    const buttonRef = useRef(null);

    const isChildActive = children.some(
        (child) =>
            child.href &&
            (pathname === child.href ||
                (child.href !== "/dashboard" && pathname.startsWith(`${child.href}/`)))
    );

    useEffect(() => {
        if (isChildActive && open) {
            setGroupOpen(true);
        }
    }, [pathname, open, isChildActive]);

    useEffect(() => {
        if (!open) {
            setGroupOpen(false);
        }
    }, [open]);

    const handleMouseEnter = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setFlyoutPos({
                top: rect.top,
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

    const toggleGroup = () => {
        if (!open) return;
        setGroupOpen((current) => !current);
    };

    return (
        <div
            className="relative w-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                suppressHydrationWarning
                ref={buttonRef}
                type="button"
                onClick={toggleGroup}
                aria-expanded={open ? groupOpen : false}
                className={clsx(
                    "group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    open ? "justify-between" : "justify-center",
                    isChildActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-500/50"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                )}
            >
                <span className="flex min-w-0 items-center gap-3">
                    {Icon && (
                        <Icon
                            size={19}
                            strokeWidth={1.8}
                            className={clsx(
                                "shrink-0 transition-colors duration-200",
                                isChildActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"
                            )}
                        />
                    )}

                    {open && (
                        <span className="text-left font-medium leading-tight whitespace-normal break-words">
                            {title}
                        </span>
                    )}
                </span>

                {open &&
                    (groupOpen ? (
                        <ChevronDown
                            size={16}
                            strokeWidth={1.8}
                            className="shrink-0 text-slate-400"
                        />
                    ) : (
                        <ChevronRight
                            size={16}
                            strokeWidth={1.8}
                            className="shrink-0 text-slate-400"
                        />
                    ))}
            </button>

            {/* EXPANDED SUBMODULE LIST */}
            {open && groupOpen && (
                <div className="mt-1 space-y-0.5">
                    {children.map((item, index) => {
                        if (!item?.href) return null;
                        return (
                            <SidebarItem
                                key={item.href ?? item.title ?? `subitem-${index}`}
                                title={item.title}
                                href={item.href}
                                level={1}
                                open={open}
                            />
                        );
                    })}
                </div>
            )}

            {/* COLLAPSED HOVER FLYOUT POP-OUT */}
            {!open && isHovered && (
                <div
                    style={{
                        position: "fixed",
                        top: `${flyoutPos.top}px`,
                        left: `${flyoutPos.left}px`,
                    }}
                    className="z-50 w-72 rounded-2xl border border-slate-700/60 bg-[#0f172a]/95 p-3.5 shadow-2xl shadow-slate-950/80 backdrop-blur-xl animate-in fade-in-0 slide-in-from-left-2 duration-150 ease-out before:absolute before:-left-4 before:top-0 before:h-full before:w-4 before:content-['']"
                >
                    {/* Header: Full Module Title */}
                    <div className="border-b border-slate-800 pb-2.5 mb-2.5 px-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-200 leading-snug whitespace-normal break-words">
                            {title}
                        </p>
                    </div>

                    {/* Submodules List */}
                    <div className="flex flex-col gap-1">
                        {children.map((child, idx) => {
                            if (!child.href) return null;
                            const isSubActive =
                                pathname === child.href ||
                                (child.href !== "/dashboard" &&
                                    pathname.startsWith(`${child.href}/`));

                            return (
                                <Link
                                    key={child.href || idx}
                                    href={child.href}
                                    className={clsx(
                                        "block rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150",
                                        isSubActive
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-600/20"
                                            : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                                    )}
                                >
                                    {child.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}