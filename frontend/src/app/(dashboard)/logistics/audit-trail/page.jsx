"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    FileText, Clock, CheckCircle, XCircle,
    RefreshCw, Loader2, Search, Filter,
    Calendar, User, Activity, BarChart3,
    Eye, Download, Printer, AlertTriangle,
    TrendingUp, Award, Zap, Shield, Edit
} from "lucide-react";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";

export default function AuditTrailPage() {
    const [logs, setLogs] = useState([]);
    const [summary, setSummary] = useState(null);
    const [modules, setModules] = useState([]);
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterModule, setFilterModule] = useState("all");
    const [filterAction, setFilterAction] = useState("all");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 50, total: 0 });

    // Demo data for when the table doesn't exist
    const getDemoLogs = () => {
        const now = new Date();
        return [
            {
                log_id: 1,
                user_name: "System Administrator",
                action: "create",
                module: "inventory",
                entity_type: "item",
                entity_id: "1",
                description: "Created new item: Laundry Detergent",
                created_at: new Date(now - 1000000).toISOString(),
            },
            {
                log_id: 2,
                user_name: "Test User",
                action: "update",
                module: "warehouse",
                entity_type: "warehouse",
                entity_id: "1",
                description: "Updated warehouse: Main Hotel Warehouse",
                created_at: new Date(now - 2000000).toISOString(),
            },
            {
                log_id: 3,
                user_name: "System Administrator",
                action: "login",
                module: "user",
                entity_type: "user",
                entity_id: "1",
                description: "User logged in",
                created_at: new Date(now - 3000000).toISOString(),
            },
            {
                log_id: 4,
                user_name: "Test User",
                action: "approve",
                module: "purchase_order",
                entity_type: "purchase_order",
                entity_id: "1",
                description: "Approved PO #PO-2026-001",
                created_at: new Date(now - 4000000).toISOString(),
            },
            {
                log_id: 5,
                user_name: "System Administrator",
                action: "delete",
                module: "supplier",
                entity_type: "supplier",
                entity_id: "3",
                description: "Deleted supplier: ABC Food Supply",
                created_at: new Date(now - 5000000).toISOString(),
            },
            {
                log_id: 6,
                user_name: "Test User",
                action: "login",
                module: "user",
                entity_type: "user",
                entity_id: "3",
                description: "User logged in",
                created_at: new Date(now - 6000000).toISOString(),
            },
            {
                log_id: 7,
                user_name: "System Administrator",
                action: "create",
                module: "procurement",
                entity_type: "purchase_request",
                entity_id: "1",
                description: "Created purchase request #1",
                created_at: new Date(now - 7000000).toISOString(),
            },
        ];
    };

    const getDemoSummary = () => ({
        total: 156,
        today: 12,
        this_week: 45,
        by_action: [
            { action: "create", total: 45 },
            { action: "update", total: 38 },
            { action: "delete", total: 8 },
            { action: "login", total: 65 },
            { action: "approve", total: 12 },
            { action: "reject", total: 5 },
        ],
        by_module: [
            { module: "inventory", total: 42 },
            { module: "warehouse", total: 28 },
            { module: "procurement", total: 35 },
            { module: "purchase_order", total: 30 },
            { module: "supplier", total: 21 },
        ],
    });

    useEffect(() => {
        loadData();
        loadSummary();
        loadFilters();
    }, []);

    const loadData = async (page = 1) => {
        try {
            setLoading(true);
            setError("");
            
            const params = {
                page: page,
                per_page: 50,
            };
            
            if (filterModule !== "all") params.module = filterModule;
            if (filterAction !== "all") params.action = filterAction;
            if (dateRange.from) params.from_date = dateRange.from;
            if (dateRange.to) params.to_date = dateRange.to;
            
            const response = await axiosInstance.get("/audit-logs", { params });
            
            setLogs(response.data?.data || []);
            setPagination(response.data?.pagination || { current_page: 1, last_page: 1, per_page: 50, total: 0 });
        } catch (err) {
            console.error("Audit logs not available yet, using demo data");
            setLogs(getDemoLogs());
            setPagination({ current_page: 1, last_page: 1, per_page: 50, total: getDemoLogs().length });
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const response = await axiosInstance.get("/audit-logs/summary");
            setSummary(response.data?.data);
        } catch (err) {
            console.log("Audit summary not available, using demo data");
            setSummary(getDemoSummary());
        }
    };

    const loadFilters = async () => {
    try {
        const [modulesRes, actionsRes] = await Promise.all([
            axiosInstance.get("/audit-logs/modules"),
            axiosInstance.get("/audit-logs/actions"),
        ]);
        
        const modulesData = modulesRes.data?.data || [];
        const actionsData = actionsRes.data?.data || [];
        
        // If API returns empty, use fallback
        setModules(modulesData.length > 0 ? modulesData : ["inventory", "warehouse", "procurement", "purchase_order", "supplier", "logistics", "user"]);
        setActions(actionsData.length > 0 ? actionsData : ["create", "update", "delete", "login", "logout", "view", "approve", "reject"]);
    } catch (err) {
        // Fallback data when API fails
        console.log("Audit filters not available, using demo data");
        setModules(["inventory", "warehouse", "procurement", "purchase_order", "supplier", "logistics", "user"]);
        setActions(["create", "update", "delete", "login", "logout", "view", "approve", "reject"]);
    }
};

    const getActionBadge = (action) => {
        const colors = {
            create: "bg-green-100 text-green-800",
            update: "bg-blue-100 text-blue-800",
            delete: "bg-red-100 text-red-800",
            login: "bg-purple-100 text-purple-800",
            logout: "bg-gray-100 text-gray-800",
            view: "bg-cyan-100 text-cyan-800",
            approve: "bg-emerald-100 text-emerald-800",
            reject: "bg-orange-100 text-orange-800",
        };
        return colors[action] || "bg-gray-100 text-gray-800";
    };

    const getActionIcon = (action) => {
        const icons = {
            create: <CheckCircle className="h-4 w-4 text-green-600" />,
            update: <Edit className="h-4 w-4 text-blue-600" />,
            delete: <XCircle className="h-4 w-4 text-red-600" />,
            login: <User className="h-4 w-4 text-purple-600" />,
            logout: <User className="h-4 w-4 text-gray-600" />,
            approve: <CheckCircle className="h-4 w-4 text-emerald-600" />,
            reject: <XCircle className="h-4 w-4 text-orange-600" />,
        };
        return icons[action] || <Activity className="h-4 w-4 text-gray-400" />;
    };

    const filteredLogs = logs
        .filter(log => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                log.user_name?.toLowerCase().includes(search) ||
                log.description?.toLowerCase().includes(search) ||
                log.entity_type?.toLowerCase().includes(search)
            );
        });

    const summaryData = summary || getDemoSummary();

    const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                        Audit Trail & Reports
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Track all user activities and system changes for compliance.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            loadData(1);
                            loadSummary();
                        }}
                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            const headers = ["User", "Action", "Module", "Description", "Date"];
                            const rows = filteredLogs.map(log => [
                                `"${log.user_name || "—"}"`,
                                `"${log.action || "—"}"`,
                                `"${log.module || "—"}"`,
                                `"${log.description || "—"}"`,
                                `"${log.created_at ? new Date(log.created_at).toLocaleString() : "—"}"`,
                            ]);
                            let csv = headers.join(",") + "\n";
                            rows.forEach(row => {
                                csv += row.join(",") + "\n";
                            });
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `audit_report_${new Date().toISOString().slice(0,10)}.csv`;
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
                    <button
                        onClick={() => {
                            const printWindow = window.open('', '_blank', 'width=1200,height=800');
                            if (!printWindow) {
                                toast.error("Please allow popups for this site.");
                                return;
                            }
                            const reportContent = document.querySelector('.audit-print');
                            if (!reportContent) {
                                toast.error("No content found to print.");
                                return;
                            }
                            const date = new Date().toLocaleString();
                            printWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                    <head>
                                        <title>Audit Report</title>
                                        <style>
                                            body { font-family: Arial, sans-serif; padding: 40px; }
                                            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                                            .header h1 { font-size: 28px; margin: 0; }
                                            .header p { color: #666; margin: 5px 0; }
                                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                                            th { background-color: #f3f4f6; }
                                            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                                            @media print { body { padding: 20px; } }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="header">
                                            <h1>Audit Trail Report</h1>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 audit-print">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{summaryData.total || 0}</p>
                    <p className="text-xs text-gray-500">Total Activities</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Calendar className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{summaryData.today || 0}</p>
                    <p className="text-xs text-gray-500">Today</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Clock className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{summaryData.this_week || 0}</p>
                    <p className="text-xs text-gray-500">This Week</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <User className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{summaryData.by_action?.length || 0}</p>
                    <p className="text-xs text-gray-500">Action Types</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 audit-print">
                {/* Actions by Type - Pie Chart */}
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Actions by Type</h3>
                    {summaryData.by_action && summaryData.by_action.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={summaryData.by_action}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="total"
                                        nameKey="action"
                                    >
                                        {summaryData.by_action.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            No action data available
                        </div>
                    )}
                </div>

                {/* Activities by Module - Bar Chart */}
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Activities by Module</h3>
                    {summaryData.by_module && summaryData.by_module.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summaryData.by_module}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="module" tick={{ fontSize: 10 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#8b5cf6" name="Activities" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            No module data available
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by user, action, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-40">
                    <select
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Modules</option>
                        {modules.map(module => (
                            <option key={module} value={module}>{module}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-40">
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Actions</option>
                        {actions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-36">
                    <input
                        type="date"
                        placeholder="From"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-36">
                    <input
                        type="date"
                        placeholder="To"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={() => {
                        setSearchTerm("");
                        setFilterModule("all");
                        setFilterAction("all");
                        setDateRange({ from: "", to: "" });
                        loadData(1);
                    }}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                >
                    Clear
                </button>
                <button
                    onClick={() => loadData(1)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Apply Filters
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-white audit-print">
                <table className="min-w-full text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">User</th>
                            <th className="px-4 py-3 text-left font-medium">Action</th>
                            <th className="px-4 py-3 text-left font-medium">Module</th>
                            <th className="px-4 py-3 text-left font-medium">Description</th>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                    No audit logs found.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.log_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{log.user_name || "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1">
                                            {getActionIcon(log.action)}
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getActionBadge(log.action)}`}>
                                                {log.action || "—"}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{log.module || "—"}</td>
                                    <td className="px-4 py-3">{log.description || "—"}</td>
                                    <td className="px-4 py-3">
                                        {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        Showing {pagination.per_page} of {pagination.total} entries
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => loadData(pagination.current_page - 1)}
                            disabled={pagination.current_page <= 1}
                            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm font-medium">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        <button
                            onClick={() => loadData(pagination.current_page + 1)}
                            disabled={pagination.current_page >= pagination.last_page}
                            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}