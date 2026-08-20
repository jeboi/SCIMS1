"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Warehouse, MapPin, Package, Boxes,
    TrendingUp, TrendingDown, Minus, RefreshCw,
    Download, Printer, FileDown, Eye,
    BarChart3, PieChart as PieChartIcon,
    Loader2, AlertTriangle, CheckCircle, Clock
} from "lucide-react";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    LineChart, Line
} from "recharts";

export default function WarehouseReportsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [warehouses, setWarehouses] = useState([]);
    const [storageLocations, setStorageLocations] = useState([]);
    const [items, setItems] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            
            const [warehousesRes, locationsRes, itemsRes, transactionsRes] = await Promise.all([
                axiosInstance.get("/warehouses"),
                axiosInstance.get("/storage-locations"),
                axiosInstance.get("/items"),
                axiosInstance.get("/inventory-transactions"),
            ]);
            
            const warehousesData = warehousesRes.data?.data || [];
            const locationsData = locationsRes.data?.data || [];
            const itemsData = itemsRes.data?.data || [];
            const transactionsData = transactionsRes.data?.data || [];
            
            setWarehouses(warehousesData);
            setStorageLocations(locationsData);
            setItems(itemsData);
            setTransactions(transactionsData);
            
            generateReport(warehousesData, locationsData, itemsData, transactionsData);
            
        } catch (err) {
            console.error(err);
            setError("Failed to load report data.");
            toast.error("Failed to load report data.");
        } finally {
            setLoading(false);
        }
    };

    const generateReport = (warehousesData, locationsData, itemsData, transactionsData) => {
        // 1. Summary Stats
        const totalWarehouses = warehousesData.length;
        const totalLocations = locationsData.length;
        const totalCapacity = warehousesData.reduce((sum, w) => sum + (w.capacity || 0), 0);
        
        // 2. Warehouse Usage
        const warehouseUsage = warehousesData.map(wh => {
            const locationCount = locationsData.filter(l => l.warehouse_id === wh.warehouse_id).length;
            const activeLocations = locationsData.filter(l => l.warehouse_id === wh.warehouse_id && l.status === "active").length;
            
            // Get item count from transactions (distinct items in this warehouse)
            const warehouseTransactions = transactionsData.filter(tx => tx.warehouse_id === wh.warehouse_id);
            const uniqueItems = new Set(warehouseTransactions.map(tx => tx.item_id)).size;
            
            // Calculate utilization
            const utilization = wh.capacity > 0 
                ? Math.round((warehouseTransactions.reduce((sum, tx) => sum + Math.abs(tx.quantity), 0) / wh.capacity) * 100)
                : 0;
            
            return {
                ...wh,
                locationCount,
                activeLocations,
                uniqueItems,
                totalStock: warehouseTransactions.reduce((sum, tx) => sum + Math.abs(tx.quantity), 0),
                utilization: Math.min(utilization, 100),
            };
        });
        
        // 3. Location Status Distribution
        const locationStatusData = [
            { name: "Active", value: locationsData.filter(l => l.status === "active").length, color: "#22c55e" },
            { name: "Inactive", value: locationsData.filter(l => l.status === "inactive").length, color: "#ef4444" },
        ];
        
        // 4. Location Distribution by Warehouse
        const locationDistribution = warehousesData.map(wh => ({
            name: wh.warehouse_name.length > 15 ? wh.warehouse_name.slice(0, 15) + "..." : wh.warehouse_name,
            locations: locationsData.filter(l => l.warehouse_id === wh.warehouse_id).length,
            capacity: wh.capacity || 0,
        }));
        
        // 5. Warehouse Capacity Utilization Chart
        const capacityData = warehousesData.map(wh => {
            const locs = locationsData.filter(l => l.warehouse_id === wh.warehouse_id);
            const usedCapacity = locs.reduce((sum, l) => sum + (l.capacity || 0), 0);
            return {
                name: wh.warehouse_name.length > 12 ? wh.warehouse_name.slice(0, 12) + "..." : wh.warehouse_name,
                capacity: wh.capacity || 0,
                used: usedCapacity,
            };
        });
        
        // 6. Items per Warehouse
        const itemsPerWarehouse = warehousesData.map(wh => {
            const whTransactions = transactionsData.filter(tx => tx.warehouse_id === wh.warehouse_id);
            const uniqueItems = new Set(whTransactions.map(tx => tx.item_id)).size;
            const totalQty = whTransactions.reduce((sum, tx) => sum + Math.abs(tx.quantity), 0);
            return {
                name: wh.warehouse_name.length > 15 ? wh.warehouse_name.slice(0, 15) + "..." : wh.warehouse_name,
                items: uniqueItems,
                quantity: totalQty,
            };
        });
        
        // 7. Warehouse Health Score
        const warehouseHealth = warehousesData.map(wh => {
            const locs = locationsData.filter(l => l.warehouse_id === wh.warehouse_id);
            const activeLocs = locs.filter(l => l.status === "active").length;
            const totalLocs = locs.length;
            const locHealth = totalLocs > 0 ? Math.round((activeLocs / totalLocs) * 100) : 0;
            
            const whTransactions = transactionsData.filter(tx => tx.warehouse_id === wh.warehouse_id);
            const uniqueItems = new Set(whTransactions.map(tx => tx.item_id)).size;
            const itemHealth = uniqueItems > 0 ? Math.min(Math.round((uniqueItems / itemsData.length) * 100), 100) : 0;
            
            return {
                name: wh.warehouse_name,
                locationHealth: locHealth,
                itemHealth: itemHealth,
                overallHealth: Math.round((locHealth + itemHealth) / 2),
                activeLocations: activeLocs,
                totalLocations: totalLocs,
                uniqueItems: uniqueItems,
            };
        });
        
        setReportData({
            summary: {
                totalWarehouses,
                totalLocations,
                totalCapacity,
                totalStock: transactionsData.reduce((sum, tx) => sum + Math.abs(tx.quantity), 0),
                activeLocations: locationsData.filter(l => l.status === "active").length,
                inactiveLocations: locationsData.filter(l => l.status === "inactive").length,
            },
            warehouseUsage,
            locationStatusData,
            locationDistribution,
            capacityData,
            itemsPerWarehouse,
            warehouseHealth,
        });
    };

    const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

    const handleExportCSV = () => {
        if (!reportData) return;
        
        const headers = ["Warehouse", "Locations", "Active", "Items", "Stock", "Utilization"];
        const rows = reportData.warehouseUsage.map(wh => [
            `"${wh.warehouse_name}"`,
            wh.locationCount,
            wh.activeLocations,
            wh.uniqueItems,
            wh.totalStock,
            `${wh.utilization}%`,
        ]);
        
        let csv = headers.join(",") + "\n";
        rows.forEach(row => {
            csv += row.join(",") + "\n";
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `warehouse_report_${new Date().toISOString().slice(0,10)}.csv`;
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
                    <h1 className="text-2xl font-semibold">Warehouse Reports</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Comprehensive warehouse performance and capacity analysis.
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
                                        <title>Warehouse Report</title>
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
                                            <h1>Warehouse Report</h1>
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
                    <Warehouse className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalWarehouses}</p>
                    <p className="text-xs text-gray-500">Total Warehouses</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <MapPin className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{reportData.summary.totalLocations}</p>
                    <p className="text-xs text-gray-500">Storage Locations</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Boxes className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{reportData.summary.totalCapacity}</p>
                    <p className="text-xs text-gray-500">Total Capacity</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Package className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{reportData.summary.totalStock}</p>
                    <p className="text-xs text-gray-500">Total Stock</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{reportData.summary.activeLocations}</p>
                    <p className="text-xs text-gray-500">Active Locations</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <p className={`text-2xl font-bold ${reportData.summary.inactiveLocations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {reportData.summary.inactiveLocations}
                    </p>
                    <p className="text-xs text-gray-500">Inactive Locations</p>
                </div>
            </div>

            {/* Warehouse Usage Table */}
            <div className="bg-white rounded-lg border p-4 report-print">
                <h3 className="text-sm font-semibold mb-3">Warehouse Usage Summary</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Warehouse</th>
                                <th className="px-4 py-2 text-center font-medium">Locations</th>
                                <th className="px-4 py-2 text-center font-medium">Active</th>
                                <th className="px-4 py-2 text-center font-medium">Items</th>
                                <th className="px-4 py-2 text-right font-medium">Stock</th>
                                <th className="px-4 py-2 text-center font-medium">Utilization</th>
                                <th className="px-4 py-2 text-center font-medium">Health</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {reportData.warehouseUsage.map((wh, index) => {
                                const health = reportData.warehouseHealth.find(h => h.name === wh.warehouse_name);
                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{wh.warehouse_name}</td>
                                        <td className="px-4 py-2 text-center">{wh.locationCount}</td>
                                        <td className="px-4 py-2 text-center">{wh.activeLocations}</td>
                                        <td className="px-4 py-2 text-center">{wh.uniqueItems}</td>
                                        <td className="px-4 py-2 text-right">{wh.totalStock}</td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${
                                                            wh.utilization > 80 ? 'bg-red-500' :
                                                            wh.utilization > 50 ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`}
                                                        style={{ width: `${Math.min(wh.utilization, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs">{wh.utilization}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                health?.overallHealth > 70 ? 'bg-green-100 text-green-800' :
                                                health?.overallHealth > 40 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {health?.overallHealth || 0}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location Status Distribution */}
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Location Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={reportData.locationStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {reportData.locationStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Locations per Warehouse */}
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Locations per Warehouse</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.locationDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="locations" fill="#3b82f6" name="Locations" />
                                <Bar dataKey="capacity" fill="#8b5cf6" name="Capacity" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Items per Warehouse */}
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Items per Warehouse</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.itemsPerWarehouse}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="items" fill="#22c55e" name="Items" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Warehouse Health */}
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Warehouse Health Score</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.warehouseHealth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Bar dataKey="overallHealth" fill="#8b5cf6" name="Health %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}