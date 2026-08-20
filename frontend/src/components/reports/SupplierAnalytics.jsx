"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function SupplierAnalytics({ data, loading }) {
    const [sortField, setSortField] = useState("total_orders");
    const [sortDirection, setSortDirection] = useState("desc");

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

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 bg-white rounded-xl border">
                <p className="text-sm">No supplier data available</p>
                <p className="text-xs text-gray-400">Try adjusting your filters</p>
            </div>
        );
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const sortedData = [...data].sort((a, b) => {
        let aVal = a[sortField] || 0;
        let bVal = b[sortField] || 0;
        if (sortField === "supplier_name") {
            aVal = a.supplier_name || "";
            bVal = b.supplier_name || "";
            return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-30" />;
        return sortDirection === "asc" 
            ? <ChevronUp className="h-3 w-3" />
            : <ChevronDown className="h-3 w-3" />;
    };

    return (
        <div className="overflow-x-auto bg-white rounded-xl border">
            <table className="min-w-full text-sm">
                <thead className="border-b bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer" onClick={() => handleSort("supplier_name")}>
                            <span className="flex items-center gap-1">Supplier <SortIcon field="supplier_name" /></span>
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600 cursor-pointer" onClick={() => handleSort("total_orders")}>
                            <span className="flex items-center justify-center gap-1">Orders <SortIcon field="total_orders" /></span>
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer" onClick={() => handleSort("total_spent")}>
                            <span className="flex items-center justify-end gap-1">Spent <SortIcon field="total_spent" /></span>
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600 cursor-pointer" onClick={() => handleSort("on_time")}>
                            <span className="flex items-center justify-center gap-1">On-Time <SortIcon field="on_time" /></span>
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600 cursor-pointer" onClick={() => handleSort("on_time_rate")}>
                            <span className="flex items-center justify-center gap-1">Rate <SortIcon field="on_time_rate" /></span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {sortedData.map((supplier) => (
                        <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{supplier.supplier_name}</td>
                            <td className="px-4 py-3 text-center">{supplier.total_orders || 0}</td>
                            <td className="px-4 py-3 text-right font-medium">
                                ₱{(supplier.total_spent || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">{supplier.on_time || 0}</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`font-medium ${
                                    supplier.on_time_rate >= 90 ? 'text-green-600' :
                                    supplier.on_time_rate >= 70 ? 'text-yellow-600' :
                                    'text-red-600'
                                }`}>
                                    {supplier.on_time_rate || 0}%
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}