"use client";

import { PackageCheck, ArrowRight, Sparkles } from "lucide-react";

export default function Navbar({ onLoginClick }) {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-20">
                {/* Brand Logo */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                        <PackageCheck size={22} className="transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight text-white leading-none">
                            SCIMS
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase mt-0.5">
                            Supply Intelligence
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
                    <a href="#about" className="transition hover:text-white hover:scale-105 duration-200">
                        About Platform
                    </a>
                    <a href="#technology" className="transition hover:text-white hover:scale-105 duration-200">
                        Core Technology
                    </a>
                    <a href="#ai-analytics" className="transition hover:text-white hover:scale-105 duration-200">
                        AI Predictive Showcase
                    </a>
                </nav>

                {/* Actions & Status */}
                <div className="flex items-center gap-4">
                    {/* Operational Badge */}
                    <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Systems Live</span>
                    </div>

                    {/* Sign In CTA Button */}
                    <button
                        onClick={onLoginClick}
                        className="relative group overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-500/35 transition-all duration-300 active:scale-95"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <span>Sign In</span>
                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>
        </header>
    );
}