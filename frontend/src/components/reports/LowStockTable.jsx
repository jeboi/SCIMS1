"use client";

import Link from "next/link";
import { AlertTriangle, Eye, CheckCircle } from "lucide-react";

export default function LowStockTable({ items, loading }) {
    // Ensure items is always an array
    const safeItems = Array.isArray(items) ? items : [];

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-2"></div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded mb-1"></div>
                ))}
            </div>
        );
    }

    if (safeItems.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm">All items are well-stocked</p>
                <p className="text-xs text-gray-400">No items require immediate attention</p>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const colors = {
            critical: "bg-red-100 text-red-800",
            low: "bg-yellow-100 text-yellow-800",
            out_of_stock: "bg-red-100 text-red-800",
            overstock: "bg-blue-100 text-blue-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getRecommendedAction = (status) => {
        const actions = {
            critical: "Urgent Reorder",
            low: "Reorder",
            out_of_stock: "Immediate Action",
            overstock: "Review Stock",
        };
        return actions[status] || "Monitor";
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="border-b bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Item</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Warehouse</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">Stock</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">Reorder Level</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">View</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {safeItems.map((item) => (
                        <tr key={item.item_id || Math.random()} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{item.item_name || "Unknown"}</td>
                            <td className="px-4 py-3">{item.category?.category_name || "—"}</td>
                            <td className="px-4 py-3">{item.warehouse?.warehouse_name || "Main"}</td>
                            <td className="px-4 py-3 text-right font-medium">{item.current_stock || 0}</td>
                            <td className="px-4 py-3 text-right">{item.reorder_level || 0}</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(item.status || "low")}`}>
                                    {item.status?.replace("_", " ") || "Low Stock"}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-xs font-medium text-blue-600">
                                    {getRecommendedAction(item.status || "low")}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <Link href="/inventory/items" className="text-blue-600 hover:text-blue-800">
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-3 text-right">
                <Link href="/inventory/items" className="text-sm text-blue-600 hover:text-blue-800">
                    View All →
                </Link>
            </div>
        </div>
    );
}