"use client";

import { motion } from "framer-motion";
import { 
    Sparkles, 
    ArrowRight, 
    Play, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle2, 
    Layers, 
    BarChart2, 
    ArrowUpRight,
    Search,
    Bell
} from "lucide-react";

export default function Hero({ onLoginClick }) {
    return (
        <section className="relative overflow-hidden pt-12 pb-6">
            {/* Ambient Glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-full max-w-7xl -translate-x-1/2 overflow-hidden blur-[120px] opacity-25">
                <div className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400" />
            </div>

            <div className="mx-auto max-w-7xl px-6 space-y-16">
                
                {/* 1. HERO HEADLINE & CTA CLUSTER */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-sm backdrop-blur-md">
                        <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                        <span>SCIMS Enterprise v2.4 • Hospitality Supply Engine</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                        Precision intelligence for <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                            hospitality supply chains.
                        </span>
                    </h1>

                    <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                        Unify multi-venue F&B inventory, predictive AI reordering, and barcode dock receiving into a real-time, zero-error operational dashboard.
                    </p>

                    {/* ANIMATED CTA BUTTON CLUSTER */}
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        {/* Primary Button: Access Workspace */}
                        <div className="relative group">
                            {/* Ambient Pulsing Glow Layer */}
                            <motion.div 
                                animate={{ 
                                    opacity: [0.4, 0.8, 0.4],
                                    scale: [0.98, 1.03, 0.98]
                                }}
                                transition={{ 
                                    duration: 3, 
                                    repeat: Infinity, 
                                    repeatType: "mirror", 
                                    ease: "easeInOut" 
                                }}
                                className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 blur-md opacity-60"
                            />

                            <motion.button
                                onClick={onLoginClick}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="relative flex items-center gap-2.5 rounded-xl bg-indigo-600 px-7 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 backdrop-blur-md"
                            >
                                <span>Access Workspace</span>
                                <motion.span
                                    initial={{ x: 0 }}
                                    whileHover={{ x: 4 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <ArrowRight size={15} />
                                </motion.span>
                            </motion.button>
                        </div>

                        {/* Secondary Button: Interactive Preview */}
                        <motion.a
                            href="#technology"
                            whileHover={{ 
                                scale: 1.03,
                                borderColor: "rgba(99, 102, 241, 0.5)",
                                backgroundColor: "rgba(15, 23, 42, 0.8)"
                            }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="group relative flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-3.5 text-xs font-semibold text-slate-300 backdrop-blur-md shadow-sm"
                        >
                            <motion.span
                                whileHover={{ scale: 1.15, x: 2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Play size={14} className="text-indigo-400 fill-indigo-400" />
                            </motion.span>
                            <span className="group-hover:text-white transition-colors duration-200">
                                Interactive Preview
                            </span>
                        </motion.a>
                    </div>
                </motion.div>

                {/* 2. DASHBOARD MOCKUP */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-50px" }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-2xl backdrop-blur-xl transition duration-500 hover:border-indigo-500/30"
                >
                    <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-950/60 rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                            <span className="ml-3 text-[11px] font-mono text-slate-500">scims.app/live-operations</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                            <Search size={13} />
                            <Bell size={13} />
                            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 p-4 sm:p-6 bg-slate-950/90 rounded-b-xl">
                        
                        <div className="hidden md:flex col-span-2 flex-col space-y-3 border-r border-slate-800/60 pr-4 text-[11px] font-medium text-slate-400">
                            <div className="flex items-center gap-2 rounded-lg bg-indigo-600/10 px-2.5 py-1.5 text-indigo-400 font-semibold">
                                <Layers size={13} /> Live Stock
                            </div>
                            <div className="flex items-center gap-2 px-2.5 py-1.5 hover:text-white transition cursor-pointer">
                                <BarChart2 size={13} /> Analytics
                            </div>
                            <div className="flex items-center gap-2 px-2.5 py-1.5 hover:text-white transition cursor-pointer">
                                <TrendingUp size={13} /> Reorder AI
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-10 space-y-5">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                
                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 space-y-1 transition duration-300 hover:border-slate-700 hover:-translate-y-0.5">
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                        <span>Total Active SKUs</span>
                                        <ArrowUpRight size={13} className="text-emerald-400" />
                                    </div>
                                    <p className="text-xl font-bold text-white">4,820</p>
                                    <span className="text-[10px] text-emerald-400 font-medium">99.4% In Stock</span>
                                </div>

                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 space-y-1 transition duration-300 hover:border-slate-700 hover:-translate-y-0.5">
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                        <span>Spoilage Risk Index</span>
                                        <AlertTriangle size={13} className="text-amber-400" />
                                    </div>
                                    <p className="text-xl font-bold text-white">1.2%</p>
                                    <span className="text-[10px] text-amber-400 font-medium">-0.8% this week</span>
                                </div>

                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 space-y-1 transition duration-300 hover:border-slate-700 hover:-translate-y-0.5">
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                        <span>Automated POs</span>
                                        <CheckCircle2 size={13} className="text-indigo-400" />
                                    </div>
                                    <p className="text-xl font-bold text-white">142</p>
                                    <span className="text-[10px] text-indigo-400 font-medium">Auto-synced with suppliers</span>
                                </div>

                            </div>

                            {/* Simulated Graph */}
                            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-200">Weekly Inventory Velocity & Variance</span>
                                    <span className="text-[10px] text-indigo-400 font-mono animate-pulse">LIVE UPDATING</span>
                                </div>

                                <div className="grid grid-cols-7 gap-2 items-end h-24 pt-4">
                                    {[65, 80, 45, 90, 75, 95, 60].map((height, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                whileInView={{ height: `${height}%` }}
                                                viewport={{ margin: "-50px" }}
                                                transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                                                className="w-full rounded-t bg-gradient-to-t from-indigo-600 to-cyan-400 transition-all duration-300 hover:brightness-125"
                                            />
                                            <span className="text-[9px] text-slate-500 uppercase font-mono">
                                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                    </div>
                </motion.div>

                {/* 3. EDITORIAL HIGHLIGHT METRICS */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="border-t border-slate-800/60 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8"
                >
                    <div className="transition hover:-translate-y-0.5">
                        <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">0%</p>
                        <p className="text-xs text-slate-400 mt-1">Manual Receiving Errors</p>
                    </div>
                    <div className="transition hover:-translate-y-0.5">
                        <p className="text-2xl sm:text-3xl font-bold text-indigo-400 tracking-tight">38% Avg</p>
                        <p className="text-xs text-slate-400 mt-1">Reduction in Kitchen Spoilage</p>
                    </div>
                    <div className="transition hover:-translate-y-0.5">
                        <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Real-Time</p>
                        <p className="text-xs text-slate-400 mt-1">Multi-Venue Node Audit</p>
                    </div>
                    <div className="transition hover:-translate-y-0.5">
                        <p className="text-2xl sm:text-3xl font-bold text-cyan-400 tracking-tight">&lt; 1 Sec</p>
                        <p className="text-xs text-slate-400 mt-1">Barcode Scan Verification</p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}