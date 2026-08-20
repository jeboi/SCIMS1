"use client";

import Link from "next/link";
import sidebarMenu from "./sidebar.config";
import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";

export default function Sidebar({ open = true, setOpen }) {
    return (
        <aside
            className={`
                sticky
                top-0
                z-30
                flex
                h-screen
                shrink-0
                flex-col
                bg-[#0b1329]
                text-slate-300
                transition-all
                duration-300
                ease-in-out
                ${open ? "w-[275px]" : "w-[80px]"}
            `}
        >
            {/* Brand / Logo Header */}
            <div
                className={`
                    flex
                    h-20
                    shrink-0
                    items-center
                    border-b
                    border-slate-800/80
                    px-5
                    py-4
                    ${open ? "justify-between" : "justify-center"}
                `}
            >
                <Link
                    href="/dashboard"
                    className="flex min-w-0 items-center gap-3 group focus:outline-none"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-105">
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                    </div>

                    {open && (
                        <div className="flex min-w-0 flex-col">
                            <h1 className="text-sm font-bold tracking-wide text-white leading-tight">
                                SCIMS
                            </h1>
                            <p className="mt-0.5 text-[10.5px] font-medium leading-tight text-slate-400">
                                Supply Chain & Inventory
                            </p>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation Container */}
            <nav className="min-h-0 flex-1 overflow-y-auto px-3.5 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex flex-col gap-4">
                    {sidebarMenu.map((section, sectionIndex) => {
                        if (!Array.isArray(section.items)) return null;

                        return (
                            <div
                                key={
                                    section.category ??
                                    `section-${sectionIndex}`
                                }
                                className="flex flex-col gap-1"
                            >
                                {/* Category Header */}
                                {open && section.category && (
                                    <div className="px-3 pb-1 pt-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500/90">
                                            {section.category}
                                        </p>
                                    </div>
                                )}

                                {/* Menu Items */}
                                <div className="flex flex-col gap-1">
                                    {section.items.map((menu, menuIndex) => {
                                        if (
                                            Array.isArray(menu.children) &&
                                            menu.children.length > 0
                                        ) {
                                            return (
                                                <SidebarGroup
                                                    key={
                                                        menu.title ??
                                                        `group-${sectionIndex}-${menuIndex}`
                                                    }
                                                    title={menu.title}
                                                    icon={menu.icon}
                                                    children={menu.children}
                                                    open={open}
                                                />
                                            );
                                        }

                                        if (typeof menu.href === "string") {
                                            return (
                                                <SidebarItem
                                                    key={
                                                        menu.href ??
                                                        menu.title ??
                                                        `item-${sectionIndex}-${menuIndex}`
                                                    }
                                                    title={menu.title}
                                                    href={menu.href}
                                                    icon={menu.icon}
                                                    open={open}
                                                />
                                            );
                                        }

                                        return null;
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* Sidebar Collapse Toggle */}
            {typeof setOpen === "function" && (
                <div className="shrink-0 border-t border-slate-800/80 p-3">
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className={`
                            flex items-center gap-3 w-full rounded-xl p-2.5 text-xs font-medium text-slate-400 
                            hover:bg-slate-800/60 hover:text-white transition-all duration-200
                            ${open ? "justify-start px-3" : "justify-center"}
                        `}
                        title={open ? "Collapse Sidebar" : "Expand Sidebar"}
                        aria-label={open ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 text-slate-300">
                            <svg
                                className={`h-4 w-4 transition-transform duration-300 ${
                                    !open ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                />
                            </svg>
                        </div>
                        {open && <span>Collapse Sidebar</span>}
                    </button>
                </div>
            )}
        </aside>
    );
}