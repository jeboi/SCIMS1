"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from 'react-hot-toast';
import {
    Menu, Search, Bell, User, Settings, LogOut,
    UserCircle, Activity, Shield, Key, ChevronDown,
    Sparkles, Zap, Package, Building
} from "lucide-react";

export default function Header({ sidebarOpen, onToggleSidebar }) {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+K or Cmd+K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                e.stopPropagation();
                
                // Try to find and focus the search input
                const searchInput = document.getElementById('global-search');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                } else {
                    // If search input isn't in DOM yet, open search mode
                    setSearchOpen(true);
                    setTimeout(() => {
                        const input = document.getElementById('global-search');
                        if (input) {
                            input.focus();
                            input.select();
                        }
                    }, 100);
                }
            }
            
            // Escape key to close dropdowns
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setDropdownOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/login");
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout error:", error);
            router.push("/login");
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    const dropdownItems = [
        {
            section: "Account",
            items: [
                { 
                    icon: UserCircle, 
                    label: "Account Profile", 
                    href: "/settings/account-profile"  // ✅ Fixed path
                },
                { 
                    icon: Activity, 
                    label: "Activity Log", 
                    href: "/settings/activity-log"     // ✅ Fixed path
                },
            ]
        },
        {
            section: "System",
            items: [
                { 
                    icon: Building, 
                    label: "System Preferences", 
                    href: "/settings/system-preferences" // ✅ Fixed path
                },
                { 
                    icon: Shield, 
                    label: "Security & Password", 
                    href: "/settings/security-password"  // ✅ Fixed path
                },
            ]
        },
        {
            section: "Support",
            items: [
                { 
                    icon: Package, 
                    label: "About SCIMS", 
                    href: "/about" 
                },
                { 
                    icon: Sparkles, 
                    label: "What's New", 
                    href: "/whats-new" 
                },
            ]
        },
    ];

    const getUserInitials = () => {
        if (!user) return "U";
        const name = user.name || user.first_name || "User";
        return name.charAt(0).toUpperCase();
    };

    const getUserName = () => {
        if (!user) return "System User";
        return user.name || user.first_name || "System User";
    };

    const getUserRole = () => {
        if (!user) return "Administrator";
        return user.role || user.status || "Administrator";
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl transition-all sm:px-6">
            {/* Left Section */}
            <div className="flex min-w-0 items-center gap-3.5">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/50 text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
                >
                    <Menu className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-105" />
                </button>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="truncate text-base font-bold tracking-tight text-slate-900">
                            Dashboard
                        </h1>
                        <span className="hidden items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 ring-1 ring-inset ring-blue-500/10 md:inline-flex">
                            <Sparkles className="h-3 w-3" />
                            SCIMS v1.0
                        </span>
                    </div>
                    <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
                        Supply Chain & Inventory Management System
                    </p>
                </div>
            </div>

            {/* Center Section - Search Bar */}
            <div className="hidden flex-1 items-center justify-center px-4 lg:flex">
                <div className="relative w-full max-w-md" ref={searchRef}>
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        id="global-search"
                        type="text"
                        placeholder="Search SKU, orders, items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchOpen(true)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                        className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/60 pl-9 pr-12 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-inner outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-sm">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
                {/* Mobile Search Toggle */}
                <button
                    type="button"
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/50 text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95 lg:hidden"
                >
                    <Search className="h-[18px] w-[18px]" />
                </button>

                {/* Notifications */}
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/50 text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
                >
                    <Bell className="h-[18px] w-[18px]" />
                    <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white"></span>
                    </span>
                </button>

                <div className="hidden h-5 w-px bg-slate-200/80 sm:block"></div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2.5 rounded-xl border p-1.5 transition-all duration-200 focus:outline-none border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 font-bold text-white shadow-md shadow-slate-900/10">
                            <span className="text-xs uppercase tracking-wider">{getUserInitials()}</span>
                        </div>
                        <div className="hidden text-left xl:block">
                            <p className="max-w-[130px] truncate text-xs font-semibold leading-tight text-slate-900">
                                {getUserName()}
                            </p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50">
                            {/* User Info Header */}
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3 border-b border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 font-bold text-white shadow-md shadow-slate-900/10">
                                        <span className="text-sm uppercase tracking-wider">{getUserInitials()}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{getUserName()}</p>
                                        <p className="text-xs text-slate-500">{user?.email || "admin@scims.com"}</p>
                                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-green-600">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                            </span>
                                            Active Session
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="p-1.5">
                                {dropdownItems.map((section, sectionIdx) => (
                                    <div key={section.section}>
                                        {sectionIdx > 0 && <div className="my-1 border-t border-slate-100" />}
                                        <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                            {section.section}
                                        </p>
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.label}
                                                    href={item.href}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
                                                >
                                                    <Icon className="h-4 w-4 text-slate-400" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-slate-200 p-1.5">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>

                            {/* Keyboard shortcut hint */}
                            <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-1.5 text-[10px] text-slate-400">
                                Press <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-500">Esc</kbd> to close
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Search Modal */}
            {searchOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setSearchOpen(false)}>
                    <div className="mx-4 mt-16 rounded-xl bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                id="global-search"
                                type="text"
                                placeholder="Search SKU, orders, items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                                className="h-12 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                autoFocus
                            />
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="rounded-lg border px-4 py-1.5 text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}