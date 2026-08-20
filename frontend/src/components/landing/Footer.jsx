"use client";

import { PackageCheck, ArrowRight } from "lucide-react";

export default function Footer({ onLoginClick }) {
    return (
        <footer className="border-t border-white/10 bg-slate-950 py-16 text-slate-400 text-xs">
            <div className="mx-auto max-w-7xl px-6 space-y-12">
                
                {/* CTA Callout Box */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/50 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Ready to modernize your supply operations?
                        </h3>
                        <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                            Sign in to your role-based workspace to manage live inventories, review purchase requests, or view real-time supply chain analytics.
                        </p>
                    </div>

                    <button
                        onClick={onLoginClick}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 text-xs font-bold text-white transition shadow-lg shadow-indigo-600/30 whitespace-nowrap active:scale-95"
                    >
                        <span>Access Workspace</span>
                        <ArrowRight size={14} />
                    </button>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                            <PackageCheck size={18} />
                        </div>
                        <span className="font-bold text-white tracking-tight">SCIMS Platform</span>
                    </div>

                    <p>© 2026 SCIMS Platform. Enterprise Hotel & Restaurant Inventory Systems.</p>

                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>All Systems Operational</span>
                    </div>
                </div>

            </div>
        </footer>
    );
}