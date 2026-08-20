"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Warehouse, TrendingDown } from "lucide-react";

export default function About() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    return (
        <section id="about" className="relative pt-8 pb-24 sm:pt-12 sm:pb-32 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 space-y-16">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-3xl space-y-4"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
                        ABOUT THE PLATFORM
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        Designed specifically for high-velocity <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            food & beverage logistics.
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        Traditional hospitality inventory relies on disconnected manual entry and reactive ordering. SCIMS unifies the entire lifecycle into a single operational interface.
                    </p>
                </motion.div>

                {/* BENTO GRID LAYOUT */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    
                    {/* Bento Card 1 */}
                    <motion.div 
                        variants={cardVariants}
                        className="md:col-span-2 relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl hover:border-indigo-500/40 transition duration-300 group flex flex-col justify-between"
                    >
                        <div className="space-y-4 max-w-lg">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition duration-300">
                                <Warehouse size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                Automated Multi-Location Warehouse Control
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Assign SKU-level rack mapping across multi-kitchen hotels or restaurant chains. Automated FIFO (First-In, First-Out) protocols prevent ingredient spoilage before stock enters production.
                            </p>
                        </div>

                        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/80 p-4 flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-3">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-slate-300">Rack A-12 • Stock Auto-Mapped</span>
                            </div>
                            <span className="text-indigo-400 font-semibold">FIFO Active</span>
                        </div>
                    </motion.div>

                    {/* Bento Card 2 */}
                    <motion.div 
                        variants={cardVariants}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl hover:border-cyan-500/40 transition duration-300 group flex flex-col justify-between"
                    >
                        <div className="space-y-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition duration-300">
                                <Cpu size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                Consumption & Waste AI Engine
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Our predictive algorithms analyze historical menu spikes and shelf-life metrics to generate exact reorder advisories.
                            </p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-xs text-slate-400">Kitchen Spoilage</span>
                            <span className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                                <TrendingDown size={16} /> -38% Reduced
                            </span>
                        </div>
                    </motion.div>

                    {/* Bento Card 3 */}
                    <motion.div 
                        variants={cardVariants}
                        className="md:col-span-3 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/80 via-indigo-950/30 to-slate-900/80 p-8 backdrop-blur-xl hover:border-indigo-500/40 transition duration-300"
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-xl">
                                <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                    <ShieldCheck size={16} /> Full Digital Procurement Audit
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">
                                    End-to-end purchasing accountability.
                                </h3>
                                <p className="text-sm text-slate-400">
                                    From initial Purchase Request to digital PO sign-offs and dock verification, every single transaction is logged with immutable timestamped records.
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="flex-1 md:flex-none rounded-xl border border-slate-800 bg-slate-950/90 p-4 text-center">
                                    <p className="text-2xl font-extrabold text-white">100%</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">PO Compliance</p>
                                </div>
                                <div className="flex-1 md:flex-none rounded-xl border border-slate-800 bg-slate-950/90 p-4 text-center">
                                    <p className="text-2xl font-extrabold text-indigo-400">Zero</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Ghost Deliveries</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>

            </div>
        </section>
    );
}