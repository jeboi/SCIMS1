"use client";

import { motion } from "framer-motion";
import { Cpu, BrainCircuit, TrendingUp, Sparkles } from "lucide-react";

export default function AIPredictiveShowcase() {
    const forecastAdvisories = [
        {
            item: "Premium Beef Tenderloin",
            vendor: "Prime Meats Co.",
            historicalUsage: "420kg / week",
            aiPrediction: "515kg",
            variance: "+22.6%",
            reason: "Upcoming Grand Palace Banquet (WBS 3.1)",
            stockStatus: "Action Required",
            confidence: 94,
        },
        {
            item: "Local Organic Olive Oil 5L",
            vendor: "Agape Harvest",
            historicalUsage: "85 units / week",
            aiPrediction: "102 units",
            variance: "+20%",
            reason: "Menu Spike (Mediterranean Menu Expansion)",
            stockStatus: "Suggested Reorder",
            confidence: 88,
        },
        {
            item: "Restaurant Pantry Flour 25kg",
            vendor: "Metro Flour Mills",
            historicalUsage: "110 bags / week",
            aiPrediction: "108 bags",
            variance: "-1.8%",
            reason: "Inventory Transaction Normalization",
            stockStatus: "In Stock",
            confidence: 97,
        },
    ];

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
        <section id="ai-analytics" className="relative py-24 sm:py-32 border-t border-white/10 bg-slate-950/80 backdrop-blur-md overflow-hidden">
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-[120px]" />

            <div className="mx-auto max-w-7xl px-6 space-y-16">
                
                {/* 1. Header & Title */}
                <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-3xl space-y-4 mx-auto text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
                        <Cpu size={14} className="text-indigo-400" />
                        <span>AI-Powered Predictive Analytics • WBS 2.4</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        Predictive Forecasting for F&B Operations.
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Replace reactive reordering with AI-driven demand planning. SCIMS analyzes historical consumption curves, seasonal spikes, and production schedules to automate reorder advisories and optimize gross margins.
                    </p>
                </motion.div>

                {/* 2. Dashboard Mockup Panel */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-slate-900/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-10 hover:border-slate-700 transition duration-300"
                >
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                                <BrainCircuit size={26} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                Live Consumption & Spoilage Advisory Feed
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider bg-indigo-950/60 border border-indigo-800/50 px-4 py-1 rounded-full">
                            <Sparkles size={14} className="animate-pulse" />
                            <span>AI Forecast Node Active</span>
                        </div>
                    </div>

                    {/* Forecast Grid List */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ margin: "-100px" }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {forecastAdvisories.map((advisory, idx) => (
                            <motion.div 
                                key={idx} 
                                variants={cardVariants}
                                className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/90 p-5 space-y-5 hover:border-indigo-500/50 transition duration-300 group"
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-slate-300 group-hover:text-white transition">{advisory.item}</span>
                                        <span className={`rounded-md px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${advisory.stockStatus === 'Action Required' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : advisory.stockStatus === 'In Stock' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' }`}>
                                            {advisory.stockStatus}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-mono text-slate-400">Vendor: {advisory.vendor}</p>
                                    <p className="text-[11px] font-medium text-slate-200">AI Logic: {advisory.reason}</p>
                                </div>

                                <div className="space-y-3 border-t border-slate-800/80 pt-4">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-widest text-[10px] font-semibold">
                                            <TrendingUp size={14} className="text-indigo-400" />
                                            <span>Usage Prediction</span>
                                        </div>
                                        <span className="text-xl font-bold text-white">{advisory.aiPrediction}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                                        <span>Historical Usage: {advisory.historicalUsage}</span>
                                        <span className={`${advisory.variance.startsWith('+') ? 'text-indigo-400' : 'text-slate-500'}`}>Variance: {advisory.variance}</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[11px] font-medium text-slate-400">
                                        <span>AI Model Confidence Score</span>
                                        <span className="font-bold text-white font-mono">{advisory.confidence}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700/80">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${advisory.confidence}%` }}
                                            transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                                            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5"
                                        />
                                    </div>
                                </div>

                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="border-t border-slate-800/60 pt-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="transition hover:-translate-y-0.5">
                            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 tracking-tight">38% Avg</p>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Reduction in Perishable Kitchen Spoilage</p>
                        </div>
                        <div className="transition hover:-translate-y-0.5">
                            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">94.2%</p>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Stock Demand Forecast Accuracy</p>
                        </div>
                        <div className="transition hover:-translate-y-0.5">
                            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Real-Time</p>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Auto-Inventory Reorder Advisories</p>
                        </div>
                        <div className="transition hover:-translate-y-0.5">
                            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight">Zero-Cost</p>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Manual Pantry Entry Discrepancy</p>
                        </div>
                    </div>

                </motion.div>

            </div>
        </section>
    );
}