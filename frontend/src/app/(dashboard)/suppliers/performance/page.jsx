"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Users, Star, CheckCircle, XCircle, Clock,
    Eye, RefreshCw, Loader2, Search, Filter,
    Award, AlertTriangle, Package, ShoppingCart,
    TrendingUp, TrendingDown, Minus, BarChart3,
    Truck, Calendar, FileText, Download, Printer
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/utils/permissions";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from "recharts";

function SupplierPerformanceContent() {
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            
            const [suppliersRes, posRes, deliveriesRes] = await Promise.all([
                axiosInstance.get("/suppliers"),
                axiosInstance.get("/purchase-orders"),
                axiosInstance.get("/deliveries"),
            ]);
            
            setSuppliers(suppliersRes.data?.data || []);
            setPurchaseOrders(posRes.data?.data || []);
            setDeliveries(deliveriesRes.data?.data || []);
            
        } catch (err) {
            console.error(err);
            setError("Failed to load performance data.");
            toast.error("Failed to load performance data.");
        } finally {
            setLoading(false);
        }
    };

    const getSupplierPerformance = (supplierId) => {
        const pos = purchaseOrders.filter(po => po.supplier_id === supplierId);
        const totalPOs = pos.length;
        
        // Get deliveries for this supplier's POs
        const poIds = pos.map(po => po.po_id);
        const supplierDeliveries = deliveries.filter(d => poIds.includes(d.po_id));
        const delivered = supplierDeliveries.filter(d => d.status === "delivered").length;
        const inTransit = supplierDeliveries.filter(d => d.status === "in_transit").length;
        const pending = supplierDeliveries.filter(d => d.status === "pending").length;
        
        // Calculate on-time delivery rate (simplified)
        const onTimeRate = totalPOs > 0 ? Math.round((delivered / totalPOs) * 100) : 0;
        
        // Calculate completion rate
        const completed = pos.filter(po => po.status === "completed" || po.status === "delivered").length;
        const completionRate = totalPOs > 0 ? Math.round((completed / totalPOs) * 100) : 0;
        
        return {
            totalPOs,
            delivered,
            inTransit,
            pending,
            onTimeRate,
            completionRate,
        };
    };

    const getPerformanceScore = (supplier) => {
        const perf = getSupplierPerformance(supplier.supplier_id);
        const rating = parseFloat(supplier.rating || 0);
        
        // Calculate weighted score
        const onTimeScore = perf.onTimeRate || 0;
        const completionScore = perf.completionRate || 0;
        const ratingScore = (rating / 5) * 100;
        
        // Weight: OnTime 40%, Completion 35%, Rating 25%
        const weightedScore = (onTimeScore * 0.4) + (completionScore * 0.35) + (ratingScore * 0.25);
        return Math.round(weightedScore);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "bg-green-100 text-green-800";
        if (score >= 60) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    const getScoreBadge = (score) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        return "Needs Improvement";
    };

    const getRatingStars = (rating) => {
        const numericRating = typeof rating === 'string' ? parseFloat(rating) : (rating || 0);
        const fullStars = Math.floor(numericRating);
        const emptyStars = 5 - fullStars;
        
        return (
            <span className="flex items-center gap-0.5">
                {[...Array(Math.max(0, fullStars))].map((_, i) => (
                    <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                {[...Array(Math.max(0, emptyStars))].map((_, i) => (
                    <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
                ))}
                <span className="ml-1 text-xs text-gray-500">({numericRating.toFixed(1)})</span>
            </span>
        );
    };

    const filteredSuppliers = suppliers
        .filter(s => {
            const matchesSearch = s.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
            const perf = getSupplierPerformance(s.supplier_id);
            const score = getPerformanceScore(s);
            
            if (filterStatus === "excellent") return score >= 80;
            if (filterStatus === "good") return score >= 60 && score < 80;
            if (filterStatus === "needs_improvement") return score < 60;
            return true;
        })
        .sort((a, b) => getPerformanceScore(b) - getPerformanceScore(a));

    // Chart Data
    const statusChartData = [
        { name: "Excellent", value: suppliers.filter(s => getPerformanceScore(s) >= 80).length, color: "#22c55e" },
        { name: "Good", value: suppliers.filter(s => getPerformanceScore(s) >= 60 && getPerformanceScore(s) < 80).length, color: "#f59e0b" },
        { name: "Needs Improvement", value: suppliers.filter(s => getPerformanceScore(s) < 60).length, color: "#ef4444" },
    ].filter(d => d.value > 0);

    // Performance comparison chart
    const performanceData = suppliers.map(s => ({
        name: s.supplier_name.length > 15 ? s.supplier_name.slice(0, 15) + "..." : s.supplier_name,
        score: getPerformanceScore(s),
        rating: parseFloat(s.rating || 0) * 20,
        completion: getSupplierPerformance(s.supplier_id).completionRate,
        onTime: getSupplierPerformance(s.supplier_id).onTimeRate,
    }));

    // Stats
    const totalSuppliers = suppliers.length;
    const avgPerformance = suppliers.length > 0 
        ? Math.round(suppliers.reduce((sum, s) => sum + getPerformanceScore(s), 0) / suppliers.length) 
        : 0;

    const handleViewSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
                <p>{error}</p>
                <button onClick={loadData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Supplier Performance Monitoring</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Track and monitor supplier performance metrics in real-time.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={loadData}
                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{totalSuppliers}</p>
                    <p className="text-xs text-gray-500">Total Suppliers</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Award className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{avgPerformance}%</p>
                    <p className="text-xs text-gray-500">Avg Performance</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Truck className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">
                        {suppliers.filter(s => getPerformanceScore(s) >= 80).length}
                    </p>
                    <p className="text-xs text-gray-500">Top Performers</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">
                        {suppliers.filter(s => getPerformanceScore(s) < 60).length}
                    </p>
                    <p className="text-xs text-gray-500">Needs Improvement</p>
                </div>
            </div>

            {/* Performance Distribution Chart */}
            {statusChartData.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Performance Distribution</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Performance Comparison Chart */}
            {performanceData.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Performance Comparison</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="score" fill="#8b5cf6" name="Overall Score" />
                                <Bar dataKey="onTime" fill="#3b82f6" name="On-Time Delivery %" />
                                <Bar dataKey="completion" fill="#22c55e" name="Completion %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by supplier name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Suppliers</option>
                        <option value="excellent">Excellent (80%+)</option>
                        <option value="good">Good (60-79%)</option>
                        <option value="needs_improvement">Needs Improvement (-60%)</option>
                    </select>
                </div>
                <button
                    onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                    }}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                >
                    Clear
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="min-w-full text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Supplier</th>
                            <th className="px-4 py-3 text-center font-medium">Rating</th>
                            <th className="px-4 py-3 text-center font-medium">POs</th>
                            <th className="px-4 py-3 text-center font-medium">On-Time</th>
                            <th className="px-4 py-3 text-center font-medium">Completion</th>
                            <th className="px-4 py-3 text-center font-medium">Score</th>
                            <th className="px-4 py-3 text-center font-medium">Status</th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredSuppliers.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                    No suppliers found.
                                </td>
                            </tr>
                        ) : (
                            filteredSuppliers.map((supplier) => {
                                const perf = getSupplierPerformance(supplier.supplier_id);
                                const score = getPerformanceScore(supplier);
                                const scoreLabel = getScoreBadge(score);
                                const scoreColor = getScoreColor(score);
                                
                                return (
                                    <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{supplier.supplier_name}</td>
                                        <td className="px-4 py-3 text-center">
                                            {getRatingStars(supplier.rating || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-center">{perf.totalPOs}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-medium ${
                                                perf.onTimeRate >= 80 ? 'text-green-600' :
                                                perf.onTimeRate >= 60 ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                                {perf.onTimeRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-medium ${
                                                perf.completionRate >= 80 ? 'text-green-600' :
                                                perf.completionRate >= 60 ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                                {perf.completionRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {score}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${scoreColor}`}>
                                                {scoreLabel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleViewSupplier(supplier)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {showModal && selectedSupplier && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="w-full max-w-2xl rounded-xl bg-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Award className="h-5 w-5 text-blue-600" />
                                    {selectedSupplier.supplier_name}
                                </h2>
                                <p className="text-sm text-gray-500">Performance Details</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Score Overview */}
                            {(() => {
                                const perf = getSupplierPerformance(selectedSupplier.supplier_id);
                                const score = getPerformanceScore(selectedSupplier);
                                const scoreLabel = getScoreBadge(score);
                                const scoreColor = getScoreColor(score);
                                return (
                                    <div className={`p-4 rounded-lg border ${scoreColor}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">Overall Performance Score</p>
                                                <p className="text-3xl font-bold">{score}%</p>
                                                <p className="text-sm">{scoreLabel}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Rating</p>
                                                <div className="mt-1">{getRatingStars(selectedSupplier.rating || 0)}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Metrics */}
                            {(() => {
                                const perf = getSupplierPerformance(selectedSupplier.supplier_id);
                                return (
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="text-center bg-gray-50 rounded-lg p-3">
                                            <p className="text-2xl font-bold text-blue-600">{perf.totalPOs}</p>
                                            <p className="text-xs text-gray-500">Total POs</p>
                                        </div>
                                        <div className="text-center bg-gray-50 rounded-lg p-3">
                                            <p className="text-2xl font-bold text-green-600">{perf.delivered}</p>
                                            <p className="text-xs text-gray-500">Delivered</p>
                                        </div>
                                        <div className="text-center bg-gray-50 rounded-lg p-3">
                                            <p className="text-2xl font-bold text-yellow-600">{perf.inTransit}</p>
                                            <p className="text-xs text-gray-500">In Transit</p>
                                        </div>
                                        <div className="text-center bg-gray-50 rounded-lg p-3">
                                            <p className="text-2xl font-bold text-red-600">{perf.pending}</p>
                                            <p className="text-xs text-gray-500">Pending</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Performance Breakdown */}
                            {(() => {
                                const perf = getSupplierPerformance(selectedSupplier.supplier_id);
                                const breakdownData = [
                                    { name: "On-Time Delivery", value: perf.onTimeRate, color: "#3b82f6" },
                                    { name: "Completion Rate", value: perf.completionRate, color: "#22c55e" },
                                    { name: "Rating Score", value: parseFloat(selectedSupplier.rating || 0) * 20, color: "#f59e0b" },
                                ];
                                return (
                                    <div className="border-t pt-4">
                                        <h3 className="text-sm font-semibold mb-2">Performance Breakdown</h3>
                                        <div className="space-y-2">
                                            {breakdownData.map((item, index) => (
                                                <div key={index}>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">{item.name}</span>
                                                        <span className="font-medium">{item.value}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full`}
                                                            style={{ 
                                                                width: `${Math.min(item.value, 100)}%`,
                                                                backgroundColor: item.color 
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="flex justify-end border-t pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SupplierPerformancePage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.SUPPLIERS_VIEW}>
            <SupplierPerformanceContent />
        </PermissionGuard>
    );
}