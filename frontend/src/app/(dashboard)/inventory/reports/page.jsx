"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Package, AlertTriangle, CheckCircle, Clock,
    TrendingUp, TrendingDown, Minus, RefreshCw,
    Download, Printer, FileDown, Eye,
    BarChart3, PieChart as PieChartIcon,
    Loader2
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    LineChart, Line
} from "recharts";

function InventoryReportsContent() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reportData, setReportData] = useState(null);
    const [items, setItems] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dateRange, setDateRange] = useState("30");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [itemsRes, transactionsRes, categoriesRes] = await Promise.all([
                axiosInstance.get("/items"),
                axiosInstance.get("/inventory-transactions"),
                axiosInstance.get("/categories"),
            ]);

            const itemsData = itemsRes.data?.data || [];
            const transactionsData = transactionsRes.data?.data || [];
            const categoriesData = categoriesRes.data?.data || [];

            setItems(itemsData);
            setTransactions(transactionsData);
            setCategories(categoriesData);

            generateReport(itemsData, transactionsData, categoriesData);

        } catch (err) {
            console.error(err);
            setError("Failed to load report data.");
            toast.error("Failed to load report data.");
        } finally {
            setLoading(false);
        }
    };

    const generateReport = (itemsData, transactionsData, categoriesData) => {
        const totalItems = itemsData.length;
        const totalStock = itemsData.reduce((sum, item) => sum + (item.current_stock || 0), 0);
        const lowStockItems = itemsData.filter(item => item.current_stock <= item.reorder_level).length;
        const outOfStockItems = itemsData.filter(item => item.current_stock <= 0).length;
        const activeItems = itemsData.filter(item => item.status === "active").length;
        const inactiveItems = itemsData.filter(item => item.status === "inactive").length;

        const categoryBreakdown = categoriesData.map(cat => {
            const catItems = itemsData.filter(item => item.category_id === cat.category_id);
            return {
                name: cat.category_name,
                count: catItems.length,
                stock: catItems.reduce((sum, item) => sum + (item.current_stock || 0), 0),
            };
        }).filter(cat => cat.count > 0);

        const statusData = [
            { name: "In Stock", value: itemsData.filter(item => item.current_stock > 0 && item.current_stock > item.reorder_level).length, color: "#22c55e" },
            { name: "Low Stock", value: itemsData.filter(item => item.current_stock > 0 && item.current_stock <= item.reorder_level).length, color: "#f59e0b" },
            { name: "Out of Stock", value: itemsData.filter(item => item.current_stock <= 0).length, color: "#ef4444" },
        ];

        const topItemsByStock = [...itemsData]
            .sort((a, b) => (b.current_stock || 0) - (a.current_stock || 0))
            .slice(0, 10)
            .map(item => ({
                name: item.item_name.length > 15 ? item.item_name.slice(0, 15) + "..." : item.item_name,
                stock: item.current_stock || 0,
                reorder: item.reorder_level || 0,
            }));

        const monthlyData = {};
        transactionsData.forEach(tx => {
            if (tx.transaction_type === "transfer_out" || tx.transaction_type === "issuing") {
                const date = new Date(tx.transaction_date);
                const month = date.toLocaleString('default', { month: 'short' });
                if (!monthlyData[month]) monthlyData[month] = 0;
                monthlyData[month] += Math.abs(tx.quantity);
            }
        });
        const monthlyTrend = Object.entries(monthlyData).map(([month, value]) => ({
            month,
            usage: value,
        }));

        const summaryByCategory = categoriesData.map(cat => {
            const catItems = itemsData.filter(item => item.category_id === cat.category_id);
            const totalStock = catItems.reduce((sum, item) => sum + (item.current_stock || 0), 0);
            const totalReorder = catItems.reduce((sum, item) => sum + (item.reorder_level || 0), 0);
            return {
                category: cat.category_name,
                items: catItems.length,
                stock: totalStock,
                reorderLevel: totalReorder,
                health: catItems.filter(item => item.current_stock > item.reorder_level).length,
                lowStock: catItems.filter(item => item.current_stock <= item.reorder_level && item.current_stock > 0).length,
                outOfStock: catItems.filter(item => item.current_stock <= 0).length,
            };
        }).filter(cat => cat.items > 0);

        const lowStockItemsList = itemsData
            .filter(item => item.current_stock <= item.reorder_level && item.status === "active")
            .sort((a, b) => (a.current_stock / a.reorder_level) - (b.current_stock / b.reorder_level))
            .slice(0, 10)
            .map(item => ({
                name: item.item_name,
                stock: item.current_stock || 0,
                reorder: item.reorder_level || 0,
                category: item.category?.category_name || "Uncategorized",
                status: item.current_stock <= 0 ? "Out of Stock" : "Low Stock",
            }));

        setReportData({
            summary: {
                totalItems,
                totalStock,
                lowStockItems,
                outOfStockItems,
                activeItems,
                inactiveItems,
            },
            categoryBreakdown,
            statusData,
            topItemsByStock,
            monthlyTrend,
            summaryByCategory,
            lowStockItemsList,
        });
    };

    const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

    const handleExportCSV = () => {
        if (!reportData) return;

        const headers = ["Category", "Items", "Total Stock", "Reorder Level", "Healthy", "Low Stock", "Out of Stock"];
        const rows = reportData.summaryByCategory.map(cat => [
            `"${cat.category}"`,
            cat.items,
            cat.stock,
            cat.reorderLevel,
            cat.health,
            cat.lowStock,
            cat.outOfStock,
        ]);

        let csv = headers.join(",") + "\n";
        rows.forEach(row => {
            csv += row.join(",") + "\n";
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_report_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("CSV exported successfully!");
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

    if (!reportData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                <p>No data available for reports.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Inventory Reports</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Comprehensive inventory analysis and stock reports.
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
                            onClick={handleExportCSV}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                        >
                            <FileDown className="h-4 w-4" />
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
                            const title = "Inventory Report";

                            printWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                    <head>
                                        <title>Inventory Report</title>
                                        <style>
                                            body { font-family: Arial, sans-serif; padding: 40px; }
                                            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                                            .header h1 { font-size: 28px; margin: 0; }
                                            .header p { color: #666; margin: 5px 0; }
                                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                                            th { background-color: #f3f4f6; font-weight: bold; }
                                            .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
                                            .card { border: 1px solid #ddd; padding: 16px; text-align: center; border-radius: 8px; background: #f9fafb; }
                                            .card-value { font-size: 24px; font-weight: bold; }
                                            .card-label { font-size: 12px; color: #666; }
                                            .status-badge { display: inline-block; padding: 2px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; }
                                            .status-critical { background: #fee2e2; color: #dc2626; }
                                            .status-warning { background: #fef3c7; color: #d97706; }
                                            .status-good { background: #d1fae5; color: #059669; }
                                            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                                            @media print {
                                                body { padding: 20px; }
                                                .no-print { display: none; }
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="header">
                                            <h1>${title}</h1>
                                            <p>Generated on: ${date}</p>
                                        </div>
                                        ${reportContent.innerHTML}
                                        <div class="footer">
                                            <p>SCIMS - Supply Chain & Inventory Management System</p>
                                        </div>
                                        <script>
                                            window.onload = function() {
                                                window.print();
                                                window.close();
                                            }
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Package className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalItems}</p>
                    <p className="text-xs text-gray-500">Total Items</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Package className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{reportData.summary.totalStock}</p>
                    <p className="text-xs text-gray-500">Total Stock</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className={`text-2xl font-bold ${reportData.summary.lowStockItems > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {reportData.summary.lowStockItems}
                    </p>
                    <p className="text-xs text-gray-500">Low Stock</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <p className={`text-2xl font-bold ${reportData.summary.outOfStockItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {reportData.summary.outOfStockItems}
                    </p>
                    <p className="text-xs text-gray-500">Out of Stock</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{reportData.summary.activeItems}</p>
                    <p className="text-xs text-gray-500">Active</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Clock className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-600">{reportData.summary.inactiveItems}</p>
                    <p className="text-xs text-gray-500">Inactive</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Stock Status Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={reportData.statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {reportData.statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {reportData.monthlyTrend.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">Monthly Usage Trend</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={reportData.monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="usage" stroke="#8b5cf6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg border p-4 lg:col-span-1">
                    <h3 className="text-sm font-semibold mb-2">Top Items by Stock</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.topItemsByStock}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="stock" fill="#3b82f6" />
                                <Bar dataKey="reorder" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4 lg:col-span-1">
                    <h3 className="text-sm font-semibold mb-2">Category Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.categoryBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" />
                                <Bar dataKey="stock" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Low Stock Items */}
            {reportData.lowStockItemsList.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        Low Stock Priority List
                        <span className="text-xs text-gray-400 ml-2">Items needing attention</span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Item</th>
                                    <th className="px-4 py-2 text-left font-medium">Category</th>
                                    <th className="px-4 py-2 text-right font-medium">Stock</th>
                                    <th className="px-4 py-2 text-right font-medium">Reorder Level</th>
                                    <th className="px-4 py-2 text-center font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {reportData.lowStockItemsList.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{item.name}</td>
                                        <td className="px-4 py-2">{item.category}</td>
                                        <td className="px-4 py-2 text-right">{item.stock}</td>
                                        <td className="px-4 py-2 text-right">{item.reorder}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                item.status === "Out of Stock"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Category Summary */}
            <div className="bg-white rounded-lg border p-4 report-print">
                <h3 className="text-sm font-semibold mb-3">Category Summary</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Category</th>
                                <th className="px-4 py-2 text-right font-medium">Items</th>
                                <th className="px-4 py-2 text-right font-medium">Total Stock</th>
                                <th className="px-4 py-2 text-right font-medium">Reorder Level</th>
                                <th className="px-4 py-2 text-center font-medium">Healthy</th>
                                <th className="px-4 py-2 text-center font-medium">Low Stock</th>
                                <th className="px-4 py-2 text-center font-medium">Out of Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {reportData.summaryByCategory.map((cat, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{cat.category}</td>
                                    <td className="px-4 py-2 text-right">{cat.items}</td>
                                    <td className="px-4 py-2 text-right">{cat.stock}</td>
                                    <td className="px-4 py-2 text-right">{cat.reorderLevel}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="text-green-600 font-medium">{cat.health}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="text-yellow-600 font-medium">{cat.lowStock}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="text-red-600 font-medium">{cat.outOfStock}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function InventoryReportsPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.REPORTS_VIEW}>
            <InventoryReportsContent />
        </PermissionGuard>
    );
}