"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    ShoppingCart, CheckCircle, XCircle, Clock,
    RefreshCw, Loader2, Search, Filter,
    DollarSign, TrendingUp, TrendingDown, Minus,
    FileText, Download, Printer, Award,
    Package, Truck, Calendar, User, BarChart3
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from "recharts";

function PurchaseOrderReportsContent() {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axiosInstance.get("/purchase-orders");
            setPurchaseOrders(response.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load purchase order data.");
            toast.error("Failed to load purchase order data.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: "Pending",
            approved: "Approved",
            rejected: "Rejected",
            processing: "Processing",
            completed: "Completed",
        };
        return labels[status] || status;
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            processing: "bg-blue-100 text-blue-800",
            completed: "bg-purple-100 text-purple-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const filteredPOs = purchaseOrders
        .filter(po => {
            if (filterStatus === "all") return true;
            return po.status === filterStatus;
        })
        .filter(po => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                po.po_number?.toLowerCase().includes(search) ||
                po.supplier?.supplier_name?.toLowerCase().includes(search)
            );
        })
        .filter(po => {
            if (dateRange.from && po.po_date) {
                const date = new Date(po.po_date);
                const from = new Date(dateRange.from);
                if (date < from) return false;
            }
            if (dateRange.to && po.po_date) {
                const date = new Date(po.po_date);
                const to = new Date(dateRange.to);
                if (date > to) return false;
            }
            return true;
        });

    const totalPOs = purchaseOrders.length;
    const totalSpending = purchaseOrders.reduce((sum, po) => {
        return sum + (po.details?.reduce((s, d) => s + parseFloat(d.subtotal || 0), 0) || 0);
    }, 0);

    const statusCounts = {
        pending: purchaseOrders.filter(po => po.status === "pending").length,
        approved: purchaseOrders.filter(po => po.status === "approved").length,
        rejected: purchaseOrders.filter(po => po.status === "rejected").length,
        processing: purchaseOrders.filter(po => po.status === "processing").length,
        completed: purchaseOrders.filter(po => po.status === "completed").length,
    };

    const statusChartData = [
        { name: "Pending", value: statusCounts.pending, color: "#f59e0b" },
        { name: "Approved", value: statusCounts.approved, color: "#3b82f6" },
        { name: "Processing", value: statusCounts.processing, color: "#8b5cf6" },
        { name: "Completed", value: statusCounts.completed, color: "#22c55e" },
        { name: "Rejected", value: statusCounts.rejected, color: "#ef4444" },
    ].filter(d => d.value > 0);

    const monthlyData = {};
    purchaseOrders.forEach(po => {
        if (po.po_date) {
            const date = new Date(po.po_date);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) monthlyData[month] = { total: 0, completed: 0 };
            monthlyData[month].total += 1;
            if (po.status === "completed") monthlyData[month].completed += 1;
        }
    });
    const monthlyTrend = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, total: data.total, completed: data.completed }))
        .sort((a, b) => {
            const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return order.indexOf(a.month) - order.indexOf(b.month);
        });

    const supplierSpending = purchaseOrders
        .filter(po => po.supplier)
        .reduce((acc, po) => {
            const name = po.supplier.supplier_name;
            if (!acc[name]) acc[name] = 0;
            const total = po.details?.reduce((s, d) => s + parseFloat(d.subtotal || 0), 0) || 0;
            acc[name] += total;
            return acc;
        }, {});
    const supplierSpendingData = Object.entries(supplierSpending)
        .map(([name, value]) => ({
            name: name.length > 15 ? name.slice(0, 15) + "..." : name,
            spending: value,
        }))
        .sort((a, b) => b.spending - a.spending);

    const itemCount = {};
    purchaseOrders.forEach(po => {
        po.details?.forEach(d => {
            const itemName = d.item?.item_name || "Unknown";
            if (!itemCount[itemName]) itemCount[itemName] = 0;
            itemCount[itemName] += d.quantity || 0;
        });
    });
    const topItems = Object.entries(itemCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, quantity]) => ({
            name: name.length > 15 ? name.slice(0, 15) + "..." : name,
            quantity,
        }));

    const supplierPerformance = purchaseOrders
        .filter(po => po.supplier)
        .reduce((acc, po) => {
            const name = po.supplier.supplier_name;
            if (!acc[name]) acc[name] = { total: 0, completed: 0 };
            acc[name].total += 1;
            if (po.status === "completed") acc[name].completed += 1;
            return acc;
        }, {});
    const supplierPerformanceData = Object.entries(supplierPerformance)
        .map(([name, data]) => ({
            name: name.length > 15 ? name.slice(0, 15) + "..." : name,
            total: data.total,
            completed: data.completed,
            rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);

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
                    <h1 className="text-2xl font-semibold">Purchase Order Reports</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Comprehensive purchase order analytics and performance reports.
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
                                const headers = ["PO #", "Supplier", "Date", "Status", "Items", "Total"];
                                const rows = filteredPOs.map(po => {
                                    const total = po.details?.reduce((s, d) => s + parseFloat(d.subtotal || 0), 0) || 0;
                                    return [
                                        `"${po.po_number || po.po_id}"`,
                                        `"${po.supplier?.supplier_name || "—"}"`,
                                        `"${po.po_date ? new Date(po.po_date).toLocaleDateString() : "—"}"`,
                                        `"${getStatusLabel(po.status)}"`,
                                        po.details?.length || 0,
                                        total.toFixed(2),
                                    ];
                                });
                                let csv = headers.join(",") + "\n";
                                rows.forEach(row => {
                                    csv += row.join(",") + "\n";
                                });
                                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `po_report_${new Date().toISOString().slice(0,10)}.csv`;
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
                                        <title>PO Report</title>
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
                                            <h1>Purchase Order Report</h1>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 report-print">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{totalPOs}</p>
                    <p className="text-xs text-gray-500">Total POs</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{statusCounts.completed}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">₱{totalSpending.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Total Spend</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 report-print">
                {statusChartData.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">PO Status Distribution</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
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

                {monthlyTrend.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">Monthly PO Trend</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
                                    <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} name="Completed" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {supplierSpendingData.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">Spending by Supplier</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={supplierSpendingData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
                                    <Bar dataKey="spending" fill="#8b5cf6" name="Spending" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {topItems.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">Top Items Ordered</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topItems}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="quantity" fill="#f59e0b" name="Quantity" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Supplier Performance Table */}
            {supplierPerformanceData.length > 0 && (
                <div className="bg-white rounded-lg border p-4 report-print">
                    <h3 className="text-sm font-semibold mb-3">Supplier Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Supplier</th>
                                    <th className="px-4 py-2 text-center font-medium">Total POs</th>
                                    <th className="px-4 py-2 text-center font-medium">Completed</th>
                                    <th className="px-4 py-2 text-center font-medium">Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {supplierPerformanceData.map((supplier, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{supplier.name}</td>
                                        <td className="px-4 py-2 text-center">{supplier.total}</td>
                                        <td className="px-4 py-2 text-center text-green-600">{supplier.completed}</td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            supplier.rate > 80 ? 'bg-green-500' :
                                                            supplier.rate > 50 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`}
                                                        style={{ width: `${supplier.rate}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-medium ${
                                                    supplier.rate > 80 ? 'text-green-600' :
                                                    supplier.rate > 50 ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`}>
                                                    {supplier.rate}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PO Summary Table */}
            <div className="bg-white rounded-lg border p-4 report-print">
                <h3 className="text-sm font-semibold mb-3">PO Summary</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">PO #</th>
                                <th className="px-4 py-2 text-left font-medium">Supplier</th>
                                <th className="px-4 py-2 text-left font-medium">Date</th>
                                <th className="px-4 py-2 text-center font-medium">Status</th>
                                <th className="px-4 py-2 text-center font-medium">Items</th>
                                <th className="px-4 py-2 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredPOs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                                        No purchase orders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPOs.map((po) => {
                                    const total = po.details?.reduce((s, d) => s + parseFloat(d.subtotal || 0), 0) || 0;
                                    return (
                                        <tr key={po.po_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium">{po.po_number || `PO #${po.po_id}`}</td>
                                            <td className="px-4 py-2">{po.supplier?.supplier_name || "—"}</td>
                                            <td className="px-4 py-2">
                                                {po.po_date ? new Date(po.po_date).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(po.status)}`}>
                                                    {getStatusLabel(po.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">{po.details?.length || 0}</td>
                                            <td className="px-4 py-2 text-right font-medium">₱{total.toFixed(2)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function PurchaseOrderReportsPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.REPORTS_VIEW}>
            <PurchaseOrderReportsContent />
        </PermissionGuard>
    );
}