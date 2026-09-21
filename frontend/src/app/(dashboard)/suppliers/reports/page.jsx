"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Users, Star, CheckCircle, XCircle, Clock,
    RefreshCw, Loader2, Search, Filter,
    Award, AlertTriangle, Package, ShoppingCart,
    TrendingUp, TrendingDown, Minus, BarChart3,
    Truck, Calendar, FileText, Download, Printer,
    DollarSign, LineChart as LineChartIcon
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart as RePieChart, Pie, Cell
} from "recharts";

function SupplierReportsContent() {
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [suppliersRes, posRes] = await Promise.all([
                axiosInstance.get("/suppliers"),
                axiosInstance.get("/purchase-orders"),
            ]);

            setSuppliers(suppliersRes.data?.data || []);
            setPurchaseOrders(posRes.data?.data || []);

        } catch (err) {
            console.error(err);
            setError("Failed to load supplier data.");
            toast.error("Failed to load supplier data.");
        } finally {
            setLoading(false);
        }
    };

    const getSupplierStats = (supplierId) => {
        const pos = purchaseOrders.filter(po => po.supplier_id === supplierId);
        return {
            total: pos.length,
            approved: pos.filter(p => p.status === "approved").length,
            pending: pos.filter(p => p.status === "pending").length,
            completed: pos.filter(p => p.status === "completed").length,
            rejected: pos.filter(p => p.status === "rejected").length,
        };
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
            const matchesStatus = filterStatus === "all" || s.status === filterStatus;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === "active").length;
    const inactiveSuppliers = suppliers.filter(s => s.status === "inactive").length;
    const ratedSuppliers = suppliers.filter(s => parseFloat(s.rating || 0) > 0).length;
    const avgRating = suppliers
        .filter(s => parseFloat(s.rating || 0) > 0)
        .reduce((sum, s) => sum + parseFloat(s.rating || 0), 0) / (ratedSuppliers || 1);

    const totalPOs = purchaseOrders.length;
    const completedPOs = purchaseOrders.filter(p => p.status === "completed").length;
    const pendingPOs = purchaseOrders.filter(p => p.status === "pending").length;

    const statusChartData = [
        { name: "Active", value: activeSuppliers, color: "#22c55e" },
        { name: "Inactive", value: inactiveSuppliers, color: "#ef4444" },
    ].filter(d => d.value > 0);

    const ratingDistribution = [
        { range: "5 ★", count: suppliers.filter(s => parseFloat(s.rating || 0) >= 4.5).length, color: "#22c55e" },
        { range: "4 ★", count: suppliers.filter(s => parseFloat(s.rating || 0) >= 3.5 && parseFloat(s.rating || 0) < 4.5).length, color: "#3b82f6" },
        { range: "3 ★", count: suppliers.filter(s => parseFloat(s.rating || 0) >= 2.5 && parseFloat(s.rating || 0) < 3.5).length, color: "#f59e0b" },
        { range: "2 ★", count: suppliers.filter(s => parseFloat(s.rating || 0) >= 1.5 && parseFloat(s.rating || 0) < 2.5).length, color: "#f97316" },
        { range: "1 ★", count: suppliers.filter(s => parseFloat(s.rating || 0) > 0 && parseFloat(s.rating || 0) < 1.5).length, color: "#ef4444" },
        { range: "Unrated", count: suppliers.filter(s => !s.rating || parseFloat(s.rating || 0) === 0).length, color: "#9ca3af" },
    ].filter(d => d.count > 0);

    const poStatusData = [
        { name: "Pending", value: pendingPOs, color: "#f59e0b" },
        { name: "Approved", value: purchaseOrders.filter(p => p.status === "approved").length, color: "#3b82f6" },
        { name: "Completed", value: completedPOs, color: "#22c55e" },
        { name: "Rejected", value: purchaseOrders.filter(p => p.status === "rejected").length, color: "#ef4444" },
    ].filter(d => d.value > 0);

    const supplierPOData = suppliers
        .map(s => ({
            name: s.supplier_name.length > 15 ? s.supplier_name.slice(0, 15) + "..." : s.supplier_name,
            pos: getSupplierStats(s.supplier_id).total,
            rating: parseFloat(s.rating || 0),
        }))
        .filter(s => s.pos > 0)
        .sort((a, b) => b.pos - a.pos);

    const topSuppliers = suppliers
        .map(s => ({
            name: s.supplier_name,
            pos: getSupplierStats(s.supplier_id).total,
            rating: parseFloat(s.rating || 0),
            status: s.status,
        }))
        .filter(s => s.pos > 0)
        .sort((a, b) => b.pos - a.pos)
        .slice(0, 5);

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
                    <h1 className="text-2xl font-semibold">Supplier Reports</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Comprehensive supplier analytics and performance reports.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Refresh — read-only */}
                    <button
                        onClick={loadData}
                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>

                    {/* RBAC: only reports.export can export */}
                    <Can permission={PERMISSIONS.REPORTS_EXPORT}>
                        <button
                            onClick={() => {
                                const headers = ["Supplier", "POs", "Rating", "Status"];
                                const rows = suppliers.map(s => [
                                    `"${s.supplier_name}"`,
                                    getSupplierStats(s.supplier_id).total,
                                    parseFloat(s.rating || 0),
                                    s.status,
                                ]);
                                let csv = headers.join(",") + "\n";
                                rows.forEach(row => {
                                    csv += row.join(",") + "\n";
                                });
                                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `supplier_report_${new Date().toISOString().slice(0,10)}.csv`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                                toast.success("CSV exported successfully!");
                            }}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </button>
                    </Can>

                    {/* Print — read-only */}
                    <button
                        onClick={() => {
                            const printWindow = window.open('', '_blank', 'width=1200,height=800');
                            if (!printWindow) {
                                toast.error("Please allow popups for this site.");
                                return;
                            }
                            const reportContent = document.querySelector('.report-print');
                            if (!reportContent) {
                                toast.error("No content found to print.");
                                return;
                            }
                            const date = new Date().toLocaleString();
                            printWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                    <head>
                                        <title>Supplier Report</title>
                                        <style>
                                            body { font-family: Arial, sans-serif; padding: 40px; }
                                            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                                            .header h1 { font-size: 28px; margin: 0; }
                                            .header p { color: #666; margin: 5px 0; }
                                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                                            th { background-color: #f3f4f6; }
                                            .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
                                            .card { border: 1px solid #ddd; padding: 16px; text-align: center; border-radius: 8px; background: #f9fafb; }
                                            .card-value { font-size: 24px; font-weight: bold; }
                                            .card-label { font-size: 12px; color: #666; }
                                            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                                            @media print { body { padding: 20px; } }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="header">
                                            <h1>Supplier Report</h1>
                                            <p>Generated on: ${date}</p>
                                        </div>
                                        ${reportContent.innerHTML}
                                        <div class="footer">
                                            <p>SCIMS - Supply Chain & Inventory Management System</p>
                                        </div>
                                        <script>
                                            window.onload = function() { window.print(); window.close(); }
                                        <\/script>
                                    </body>
                                </html>
                            `);
                            printWindow.document.close();
                        }}
                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 report-print">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{totalSuppliers}</p>
                    <p className="text-xs text-gray-500">Total Suppliers</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
                    <p className="text-xs text-gray-500">Active</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{inactiveSuppliers}</p>
                    <p className="text-xs text-gray-500">Inactive</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Star className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{ratedSuppliers}</p>
                    <p className="text-xs text-gray-500">Rated</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Award className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{avgRating.toFixed(1)} ★</p>
                    <p className="text-xs text-gray-500">Avg Rating</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{totalPOs}</p>
                    <p className="text-xs text-gray-500">Total POs</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 report-print">
                {statusChartData.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">Supplier Status</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
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
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {ratingDistribution.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">Rating Distribution</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ratingDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8b5cf6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {poStatusData.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">PO Status Distribution</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={poStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {poStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {supplierPOData.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">Supplier PO Distribution</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={supplierPOData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="pos" fill="#3b82f6" name="POs" />
                                    <Bar dataKey="rating" fill="#f59e0b" name="Rating" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Top Suppliers Table */}
            {topSuppliers.length > 0 && (
                <div className="bg-white rounded-lg border p-4 report-print">
                    <h3 className="text-sm font-semibold mb-3">🏆 Top Suppliers by PO Volume</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">#</th>
                                    <th className="px-4 py-2 text-left font-medium">Supplier</th>
                                    <th className="px-4 py-2 text-center font-medium">POs</th>
                                    <th className="px-4 py-2 text-center font-medium">Rating</th>
                                    <th className="px-4 py-2 text-center font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {topSuppliers.map((supplier, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">#{index + 1}</td>
                                        <td className="px-4 py-2">{supplier.name}</td>
                                        <td className="px-4 py-2 text-center">{supplier.pos}</td>
                                        <td className="px-4 py-2 text-center">
                                            {getRatingStars(supplier.rating)}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                supplier.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {supplier.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SupplierReportsPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.REPORTS_VIEW}>
            <SupplierReportsContent />
        </PermissionGuard>
    );
}