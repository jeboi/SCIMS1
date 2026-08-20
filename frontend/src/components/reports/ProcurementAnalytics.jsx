"use client";

import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#f59e0b", "#22c55e", "#ef4444", "#3b82f6"];

export default function ProcurementAnalytics({ data, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
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
            <div className="text-center py-8 text-gray-500 bg-white rounded-xl border">
                <p className="text-sm">No procurement data available</p>
                <p className="text-xs text-gray-400">Try adjusting your filters</p>
            </div>
        );
    }

    const summary = data.summary || {};

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border p-4 text-center">
                    <p className="text-xs text-gray-500">Total Requests</p>
                    <p className="text-xl font-bold">{summary.totalRequests || 0}</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-xl font-bold text-yellow-600">{summary.pending || 0}</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                    <p className="text-xs text-gray-500">Approved</p>
                    <p className="text-xl font-bold text-green-600">{summary.approved || 0}</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                    <p className="text-xs text-gray-500">Rejected</p>
                    <p className="text-xl font-bold text-red-600">{summary.rejected || 0}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Status */}
                <div className="bg-white rounded-xl border p-5">
                    <h3 className="text-sm font-semibold mb-4">Request Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.statusDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(data.statusDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Spending Trend */}
                <div className="bg-white rounded-xl border p-5">
                    <h3 className="text-sm font-semibold mb-4">Spending Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.spendingTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="spending" stroke="#8b5cf6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}