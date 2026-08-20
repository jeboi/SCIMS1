"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    FileText, ShoppingCart, Users, Clock,
    CheckCircle, XCircle, AlertTriangle,
    TrendingUp, TrendingDown, Minus, RefreshCw,
    Download, Printer, FileDown, Eye,
    BarChart3, PieChart as PieChartIcon,
    Loader2, Package, Calendar, DollarSign
} from "lucide-react";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    LineChart, Line
} from "recharts";

export default function ProcurementReportsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            
            const [prRes, poRes, supplierRes] = await Promise.all([
                axiosInstance.get("/purchase-requests"),
                axiosInstance.get("/purchase-orders"),
                axiosInstance.get("/suppliers"),
            ]);
            
            const prData = prRes.data?.data || [];
            const poData = poRes.data?.data || [];
            const supplierData = supplierRes.data?.data || [];
            
            setPurchaseRequests(prData);
            setPurchaseOrders(poData);
            setSuppliers(supplierData);
            
            generateReport(prData, poData, supplierData);
            
        } catch (err) {
            console.error(err);
            setError("Failed to load procurement data.");
            toast.error("Failed to load procurement data.");
        } finally {
            setLoading(false);
        }
    };

    const generateReport = (prData, poData, supplierData) => {
        // 1. Summary Stats
        const totalRequests = prData.length;
        const totalOrders = poData.length;
        const totalSuppliers = supplierData.length;
        
        const pendingRequests = prData.filter(pr => pr.status === "pending").length;
        const approvedRequests = prData.filter(pr => pr.status === "approved").length;
        const rejectedRequests = prData.filter(pr => pr.status === "rejected").length;
        
        const pendingOrders = poData.filter(po => po.status === "pending").length;
        const approvedOrders = poData.filter(po => po.status === "approved").length;
        const completedOrders = poData.filter(po => po.status === "completed").length;
        
        // 2. Request Status Distribution
        const requestStatusData = [
            { name: "Pending", value: pendingRequests, color: "#f59e0b" },
            { name: "Approved", value: approvedRequests, color: "#22c55e" },
            { name: "Rejected", value: rejectedRequests, color: "#ef4444" },
        ].filter(d => d.value > 0);
        
        // 3. Order Status Distribution
        const orderStatusData = [
            { name: "Pending", value: pendingOrders, color: "#f59e0b" },
            { name: "Approved", value: approvedOrders, color: "#3b82f6" },
            { name: "Completed", value: completedOrders, color: "#22c55e" },
        ].filter(d => d.value > 0);
        
        // 4. Monthly Request Trend
        const monthlyData = {};
        prData.forEach(pr => {
            if (pr.request_date) {
                const date = new Date(pr.request_date);
                const month = date.toLocaleString('default', { month: 'short' });
                if (!monthlyData[month]) monthlyData[month] = { requests: 0, approved: 0 };
                monthlyData[month].requests += 1;
                if (pr.status === "approved") monthlyData[month].approved += 1;
            }
        });
        const monthlyTrend = Object.entries(monthlyData).map(([month, data]) => ({
            month,
            requests: data.requests,
            approved: data.approved,
        }));
        
        // 5. Supplier Performance
        const supplierPerformance = supplierData.map(supplier => {
            const supplierPOs = poData.filter(po => po.supplier_id === supplier.supplier_id);
            const completed = supplierPOs.filter(po => po.status === "completed").length;
            const pending = supplierPOs.filter(po => po.status === "pending").length;
            const approved = supplierPOs.filter(po => po.status === "approved").length;
            
            return {
                name: supplier.supplier_name,
                total: supplierPOs.length,
                completed,
                pending,
                approved,
                completionRate: supplierPOs.length > 0 ? Math.round((completed / supplierPOs.length) * 100) : 0,
                rating: supplier.rating || 0,
            };
        }).filter(s => s.total > 0).sort((a, b) => b.total - a.total);
        
        // 6. Top Items Requested
        const itemRequestCount = {};
        prData.forEach(pr => {
            if (pr.details) {
                pr.details.forEach(detail => {
                    const itemName = detail.item?.item_name || "Unknown";
                    if (!itemRequestCount[itemName]) itemRequestCount[itemName] = 0;
                    itemRequestCount[itemName] += detail.quantity || 0;
                });
            }
        });
        const topItems = Object.entries(itemRequestCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, quantity]) => ({
                name: name.length > 15 ? name.slice(0, 15) + "..." : name,
                quantity,
            }));
        
        // 7. Approval Rate
        const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0;
        const rejectionRate = totalRequests > 0 ? Math.round((rejectedRequests / totalRequests) * 100) : 0;
        
        setReportData({
            summary: {
                totalRequests,
                totalOrders,
                totalSuppliers,
                pendingRequests,
                approvedRequests,
                rejectedRequests,
                pendingOrders,
                approvedOrders,
                completedOrders,
                approvalRate,
                rejectionRate,
            },
            requestStatusData,
            orderStatusData,
            monthlyTrend,
            supplierPerformance,
            topItems,
        });
    };

    const COLORS = ["#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

    const handleExportCSV = () => {
        if (!reportData) return;
        
        const headers = ["Supplier", "Total POs", "Completed", "Pending", "Approved", "Completion Rate", "Rating"];
        const rows = reportData.supplierPerformance.map(s => [
            `"${s.name}"`,
            s.total,
            s.completed,
            s.pending,
            s.approved,
            `${s.completionRate}%`,
            s.rating,
        ]);
        
        let csv = headers.join(",") + "\n";
        rows.forEach(row => {
            csv += row.join(",") + "\n";
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `procurement_report_${new Date().toISOString().slice(0,10)}.csv`;
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
                <p>No procurement data available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Procurement Reports</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Comprehensive procurement analytics and performance reports.
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
                    <button
                        onClick={handleExportCSV}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                    >
                        <FileDown className="h-4 w-4" />
                        Export CSV
                    </button>
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
                                        <title>Procurement Report</title>
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
                                            <h1>Procurement Report</h1>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalRequests}</p>
                    <p className="text-xs text-gray-500">Total Requests</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <ShoppingCart className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{reportData.summary.totalOrders}</p>
                    <p className="text-xs text-gray-500">Total Orders</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Users className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{reportData.summary.totalSuppliers}</p>
                    <p className="text-xs text-gray-500">Suppliers</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{reportData.summary.approvalRate}%</p>
                    <p className="text-xs text-gray-500">Approval Rate</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{reportData.summary.pendingRequests}</p>
                    <p className="text-xs text-gray-500">Pending Requests</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Package className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-orange-600">{reportData.summary.pendingOrders}</p>
                    <p className="text-xs text-gray-500">Pending Orders</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Status Distribution */}
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Request Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={reportData.requestStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {reportData.requestStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Order Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={reportData.orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {reportData.orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Request Trend */}
                {reportData.monthlyTrend.length > 0 && (
                    <div className="bg-white rounded-lg border p-4 lg:col-span-2">
                        <h3 className="text-sm font-semibold mb-2">Monthly Request Trend</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={reportData.monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Total Requests" />
                                    <Line type="monotone" dataKey="approved" stroke="#22c55e" strokeWidth={2} name="Approved" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Top Items Requested */}
            {reportData.topItems.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">📦 Top Items Requested</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.topItems}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Supplier Performance Table */}
            <div className="bg-white rounded-lg border p-4 report-print">
                <h3 className="text-sm font-semibold mb-3">Supplier Performance</h3>
                {reportData.supplierPerformance.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        No supplier performance data available.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Supplier</th>
                                    <th className="px-4 py-2 text-center font-medium">Total POs</th>
                                    <th className="px-4 py-2 text-center font-medium">Completed</th>
                                    <th className="px-4 py-2 text-center font-medium">Pending</th>
                                    <th className="px-4 py-2 text-center font-medium">Approved</th>
                                    <th className="px-4 py-2 text-center font-medium">Completion Rate</th>
                                    <th className="px-4 py-2 text-center font-medium">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {reportData.supplierPerformance.map((supplier, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{supplier.name}</td>
                                        <td className="px-4 py-2 text-center">{supplier.total}</td>
                                        <td className="px-4 py-2 text-center text-green-600">{supplier.completed}</td>
                                        <td className="px-4 py-2 text-center text-yellow-600">{supplier.pending}</td>
                                        <td className="px-4 py-2 text-center text-blue-600">{supplier.approved}</td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${
                                                            supplier.completionRate > 80 ? 'bg-green-500' :
                                                            supplier.completionRate > 50 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`}
                                                        style={{ width: `${supplier.completionRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs">{supplier.completionRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                ★ {supplier.rating}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}