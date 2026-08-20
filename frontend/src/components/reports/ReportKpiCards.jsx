"use client";

import { Package, AlertTriangle, ShoppingCart, ClipboardList, Truck, DollarSign } from "lucide-react";

export default function ReportKpiCards({ data, loading }) {
    const cards = [
        {
            key: "totalItems",
            title: "Total Items",
            value: data?.totalItems || 0,
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            key: "lowStockItems",
            title: "Low Stock",
            value: data?.lowStockItems || 0,
            icon: AlertTriangle,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
        },
        {
            key: "outOfStockItems",
            title: "Out of Stock",
            value: data?.outOfStockItems || 0,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50",
        },
        {
            key: "pendingRequests",
            title: "Pending Requests",
            value: data?.pendingRequests || 0,
            icon: ShoppingCart,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            key: "pendingOrders",
            title: "Pending Orders",
            value: data?.pendingOrders || 0,
            icon: ClipboardList,
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
        {
            key: "pendingDeliveries",
            title: "Pending Deliveries",
            value: data?.pendingDeliveries || 0,
            icon: Truck,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            key: "totalInventoryValue",
            title: "Inventory Value",
            value: data?.totalInventoryValue || 0,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50",
            format: "currency",
        },
        {
            key: "inventoryTurnover",
            title: "Inventory Turnover",
            value: data?.inventoryTurnover || 0,
            icon: Package,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            format: "decimal",
        },
    ];

    const formatValue = (value, format) => {
        if (format === "currency") {
            return `₱${value.toFixed(2)}`;
        }
        if (format === "decimal") {
            return value.toFixed(1);
        }
        if (value > 999) {
            return value.toLocaleString();
        }
        return value;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
                        <div className="h-8 w-8 bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded mb-1"></div>
                        <div className="h-5 w-12 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {cards.map((card) => {
                const Icon = card.icon;
                const displayValue = formatValue(card.value, card.format);

                return (
                    <div key={card.key} className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition">
                        <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                            <Icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider truncate">
                            {card.title}
                        </p>
                        <p className="text-base font-bold text-gray-900 mt-0.5">
                            {displayValue}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}