"use client";

import { motion } from "framer-motion";
import { LineChart, QrCode, Cpu, Scan } from "lucide-react";

export default function Features() {
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
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
        <section id="technology" className="relative pt-2 sm:pt-4 pb-24 sm:pb-32">
            <div className="mx-auto max-w-7xl px-6 space-y-16">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-3xl space-y-4"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
                        <Cpu size={14} />
                        <span>CORE TECHNOLOGY</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                        Engineering transparency into every process.
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        Replace guesswork with automated predictive intelligence, mobile scan validation, and real-time vendor order matching.
                    </p>
                </motion.div>

                {/* 2-Column Product Showcase */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-50px" }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    
                    {/* Feature 1: Predictive Analytics */}
                    <motion.div 
                        variants={cardVariants}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3 }}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl flex flex-col justify-between space-y-8 hover:border-slate-700 transition"
                    >
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                <LineChart size={16} /> Predictive Analytics & Forecasting
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                Eliminate purchasing guesswork before stockouts occur.
                            </h3>
                            <p className="text-sm text-slate-400">
                                Cross-reference lead times, seasonal customer volume, and recipe consumption curves to generate auto-drafted Purchase Orders.
                            </p>
                        </div>

                        {/* Interactive UI Mock Card */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-5 space-y-4 shadow-inner">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-300">AI Reorder Advisory #PO-8921</span>
                                <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono">Suggested</span>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between text-slate-400">
                                    <span>Item: Premium Beef Tenderloin</span>
                                    <span className="text-white font-mono">Qty: 40 kg</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Vendor: Prime Meats Co.</span>
                                    <span className="text-emerald-400 font-mono">Lead Time: 18 hrs</span>
                                </div>
                            </div>

                            {/* Animated Progress Bar */}
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <motion.div 
                                    initial={{ width: "0%" }}
                                    whileInView={{ width: "75%" }}
                                    viewport={{ margin: "-50px" }}
                                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full" 
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 2: Smart Dock Scan */}
                    <motion.div 
                        variants={cardVariants}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3 }}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl flex flex-col justify-between space-y-8 hover:border-slate-700 transition"
                    >
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                <QrCode size={16} /> Smart Scan Goods Verification
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                Accelerated receiving dock workflows with 100% precision.
                            </h3>
                            <p className="text-sm text-slate-400">
                                Warehouse staff scan incoming shipments using handheld scanners or mobile devices to instantly verify delivered items against open Purchase Orders.
                            </p>
                        </div>

                        {/* Interactive UI Mock Card with Laser Scanner Line */}
                        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/90 p-5 space-y-3">
                            
                            {/* Dynamic Scanning Laser Animation Line */}
                            <motion.div 
                                animate={{ y: ["0%", "100%", "0%"] }}
                                transition={{ 
                                    duration: 3, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                }}
                                className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-10"
                                style={{ top: 0 }}
                            />
                            
                            <div className="flex items-center justify-between relative z-20">
                                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                                    <Scan size={14} className="animate-spin" />
                                    <span>Scanning SKU-90412...</span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    PO Match Confirmed
                                </span>
                            </div>

                            <p className="text-xs text-slate-300 font-mono relative z-20">
                                Registered: [12x Organic Olive Oil 5L] → Rack B-04
                            </p>
                        </div>
                    </motion.div>

                </motion.div>

            </div>
        </section>
    );
}