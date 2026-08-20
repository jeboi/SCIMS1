"use client";

import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function InventoryAnalytics({ data, loading }) {
    console.log("🔵 InventoryAnalytics received:", data);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
                        <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="h-48 bg-gray-100 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                <p className="text-sm">No inventory data available</p>
                <p className="text-xs text-gray-400">Try adjusting your filters</p>
            </div>
        );
    }

    // Safe access with fallbacks
    const trendData = data.trend || [];
    const statusData = data.statusDistribution || [];
    const categoryData = data.byCategory || [];
    const warehouseData = data.byWarehouse || [];

    console.log("🔵 trendData:", trendData);
    console.log("🔵 statusData:", statusData);
    console.log("🔵 categoryData:", categoryData);
    console.log("🔵 warehouseData:", warehouseData);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Trend */}
            <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold mb-4">Inventory Trend</h3>
                {trendData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                        No trend data available
                    </div>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="received" stroke="#22c55e" strokeWidth={2} />
                                <Line type="monotone" dataKey="issued" stroke="#ef4444" strokeWidth={2} />
                                <Line type="monotone" dataKey="ending" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Stock Status Distribution */}
            <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold mb-4">Stock Status Distribution</h3>
                {statusData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                        No status data available
                    </div>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Inventory by Category */}
            <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold mb-4">Inventory by Category</h3>
                {categoryData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                        No category data available
                    </div>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Inventory by Warehouse */}
            <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold mb-4">Inventory by Warehouse</h3>
                {warehouseData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                        No warehouse data available
                    </div>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={warehouseData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}