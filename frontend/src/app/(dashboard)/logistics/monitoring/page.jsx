"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Truck, Package, CheckCircle, Clock, XCircle,
    RefreshCw, Loader2, Eye, AlertTriangle,
    TrendingUp, TrendingDown, Minus, BarChart3,
    FileText, Calendar, User, MapPin,
    ArrowRight, Activity, Bell, Zap
} from "lucide-react";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    LineChart, Line
} from "recharts";

export default function LogisticsMonitoringPage() {
    const [deliveries, setDeliveries] = useState([]);
    const [receivingRecords, setReceivingRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            
            const [deliveriesRes, receivingRes] = await Promise.all([
                axiosInstance.get("/deliveries"),
                axiosInstance.get("/receiving-records"),
            ]);
            
            const deliveriesData = deliveriesRes.data?.data || [];
            const receivingData = receivingRes.data?.data || [];
            
            setDeliveries(deliveriesData);
            setReceivingRecords(receivingData);
            
            generateRecentActivities(deliveriesData, receivingData);
            
        } catch (err) {
            console.error(err);
            setError("Failed to load logistics data.");
            toast.error("Failed to load logistics data.");
        } finally {
            setLoading(false);
        }
    };

    const generateRecentActivities = (deliveriesData, receivingData) => {
        const activities = [];
        
        // Add receiving records as activities
        receivingData.forEach(rec => {
            activities.push({
                id: rec.receiving_id,
                type: "receiving",
                title: `Receiving Record #${rec.receiving_id}`,
                description: `Received at ${rec.warehouse?.warehouse_name || "Unknown"}`,
                date: rec.received_date || rec.created_at,
                status: "completed",
                icon: <Package className="h-4 w-4 text-green-600" />,
            });
        });
        
        // Add deliveries as activities
        deliveriesData.forEach(del => {
            activities.push({
                id: del.delivery_id,
                type: "delivery",
                title: `Delivery ${del.tracking_number || `#${del.delivery_id}`}`,
                description: `Status: ${del.status || "pending"}`,
                date: del.delivery_date || del.created_at,
                status: del.status || "pending",
                icon: <Truck className="h-4 w-4 text-blue-600" />,
            });
        });
        
        // Sort by date (newest first) and take last 10
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivities(activities.slice(0, 10));
    };

    // Stats
    const totalDeliveries = deliveries.length;
    const pendingDeliveries = deliveries.filter(d => d.status === "pending").length;
    const inTransitDeliveries = deliveries.filter(d => d.status === "in_transit").length;
    const deliveredDeliveries = deliveries.filter(d => d.status === "delivered").length;
    const cancelledDeliveries = deliveries.filter(d => d.status === "cancelled").length;
    const totalReceiving = receivingRecords.length;

    // On-Time Delivery Rate (simplified)
    const onTimeRate = totalDeliveries > 0 
        ? Math.round((deliveredDeliveries / totalDeliveries) * 100) 
        : 0;

    // Chart Data
    const statusChartData = [
        { name: "Pending", value: pendingDeliveries, color: "#f59e0b" },
        { name: "In Transit", value: inTransitDeliveries, color: "#3b82f6" },
        { name: "Delivered", value: deliveredDeliveries, color: "#22c55e" },
        { name: "Cancelled", value: cancelledDeliveries, color: "#ef4444" },
    ].filter(d => d.value > 0);

    // Monthly Delivery Trend
    const monthlyData = {};
    deliveries.forEach(del => {
        if (del.delivery_date) {
            const date = new Date(del.delivery_date);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) monthlyData[month] = { total: 0, delivered: 0 };
            monthlyData[month].total += 1;
            if (del.status === "delivered") monthlyData[month].delivered += 1;
        }
    });
    const monthlyTrend = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, total: data.total, delivered: data.delivered }))
        .sort((a, b) => {
            const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return order.indexOf(a.month) - order.indexOf(b.month);
        });

    // Delivery Performance by Warehouse
    const warehousePerformance = {};
    receivingRecords.forEach(rec => {
        const name = rec.warehouse?.warehouse_name || "Unknown";
        if (!warehousePerformance[name]) warehousePerformance[name] = 0;
        warehousePerformance[name] += 1;
    });
    const warehouseData = Object.entries(warehousePerformance)
        .map(([name, value]) => ({ name, deliveries: value }))
        .sort((a, b) => b.deliveries - a.deliveries);

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
                    <h1 className="text-2xl font-semibold">Logistics Monitoring</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Real-time monitoring of logistics operations and deliveries.
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

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Truck className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{totalDeliveries}</p>
                    <p className="text-xs text-gray-500">Total Deliveries</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{pendingDeliveries}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Truck className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{inTransitDeliveries}</p>
                    <p className="text-xs text-gray-500">In Transit</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{deliveredDeliveries}</p>
                    <p className="text-xs text-gray-500">Delivered</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Package className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{totalReceiving}</p>
                    <p className="text-xs text-gray-500">Receiving Records</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Activity className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{onTimeRate}%</p>
                    <p className="text-xs text-gray-500">On-Time Rate</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Delivery Status Distribution */}
                {statusChartData.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">Delivery Status Distribution</h3>
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

                {/* Monthly Delivery Trend */}
                {monthlyTrend.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold mb-2">Monthly Delivery Trend</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
                                    <Line type="monotone" dataKey="delivered" stroke="#22c55e" strokeWidth={2} name="Delivered" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Warehouse Performance */}
                {warehouseData.length > 0 && (
                    <div className="bg-white rounded-lg border p-4 lg:col-span-1">
                        <h3 className="text-sm font-semibold mb-2">Receiving by Warehouse</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={warehouseData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="deliveries" fill="#8b5cf6" name="Receiving Records" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="bg-white rounded-lg border p-4 lg:col-span-1">
                    <h3 className="text-sm font-semibold mb-2">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-blue-600">{deliveries.length}</p>
                            <p className="text-xs text-gray-500">Total Deliveries</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-yellow-600">{pendingDeliveries}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-green-600">{deliveredDeliveries}</p>
                            <p className="text-xs text-gray-500">Delivered</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-purple-600">{totalReceiving}</p>
                            <p className="text-xs text-gray-500">Received</p>
                        </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">On-Time Delivery Rate</span>
                            <span className="text-lg font-bold text-blue-700">{onTimeRate}%</span>
                        </div>
                        <div className="h-2 bg-blue-200 rounded-full mt-1 overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${
                                    onTimeRate >= 80 ? 'bg-green-500' :
                                    onTimeRate >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(onTimeRate, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Recent Activity
                    </h3>
                    <span className="text-xs text-gray-400">
                        {recentActivities.length} recent activities
                    </span>
                </div>
                {recentActivities.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        No recent activities.
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                                <div className="mt-0.5">{activity.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{activity.title}</p>
                                    <p className="text-xs text-gray-500">{activity.description}</p>
                                </div>
                                <div className="text-xs text-gray-400 whitespace-nowrap">
                                    {activity.date ? new Date(activity.date).toLocaleDateString() : "—"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}