"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";               // ← ADDED

const reportGroups = [
    {
        id: "inventory",
        title: "Inventory Reports",
        reports: [
            { name: "Inventory Summary", href: "/inventory/reports", endpoint: "/items", dataKey: "data" },
            { name: "Stock Movement", href: "/inventory/reports", endpoint: "/inventory-transactions", dataKey: "data" },
            { name: "Low Stock Report", href: "/inventory/reports", endpoint: "/items", dataKey: "data" },
            { name: "Inventory Valuation", href: "/inventory/reports", endpoint: "/items", dataKey: "data" },
        ],
    },
    {
        id: "procurement",
        title: "Procurement Reports",
        reports: [
            { name: "Purchase Request Report", href: "/procurement/reports", endpoint: "/purchase-requests", dataKey: "data" },
            { name: "Procurement Spending", href: "/procurement/reports", endpoint: "/purchase-orders", dataKey: "data" },
            { name: "Approval Analysis", href: "/procurement/reports", endpoint: "/purchase-requests", dataKey: "data" },
        ],
    },
    {
        id: "purchase-order",
        title: "Purchase Order Reports",
        reports: [
            { name: "PO Summary", href: "/purchase-orders/reports", endpoint: "/purchase-orders", dataKey: "data" },
            { name: "PO Status Analysis", href: "/purchase-orders/reports", endpoint: "/purchase-orders", dataKey: "data" },
            { name: "PO Spending Report", href: "/purchase-orders/reports", endpoint: "/purchase-orders", dataKey: "data" },
            { name: "Supplier PO Performance", href: "/purchase-orders/reports", endpoint: "/purchase-orders", dataKey: "data" },
        ],
    },
    {
        id: "supplier",
        title: "Supplier Reports",
        reports: [
            { name: "Supplier Performance", href: "/suppliers/reports", endpoint: "/suppliers", dataKey: "data" },
            { name: "Supplier Purchase History", href: "/suppliers/reports", endpoint: "/purchase-orders", dataKey: "data" },
            { name: "Supplier Delivery Performance", href: "/suppliers/reports", endpoint: "/deliveries", dataKey: "data" },
        ],
    },
    {
        id: "warehouse",
        title: "Warehouse Reports",
        reports: [
            { name: "Warehouse Inventory", href: "/warehouse/reports", endpoint: "/warehouses", dataKey: "data" },
            { name: "Storage Utilization", href: "/warehouse/reports", endpoint: "/storage-locations", dataKey: "data" },
            { name: "Stock Transfer Report", href: "/warehouse/reports", endpoint: "/inventory-transactions", dataKey: "data" },
        ],
    },
    {
        id: "logistics",
        title: "Logistics Reports",
        reports: [
            { name: "Delivery Report", href: "/logistics/monitoring", endpoint: "/deliveries", dataKey: "data" },
            { name: "Receiving Report", href: "/logistics/monitoring", endpoint: "/receiving-records", dataKey: "data" },
            { name: "Delivery Performance", href: "/logistics/monitoring", endpoint: "/deliveries", dataKey: "data" },
        ],
    },
];

export default function ReportCards() {
    const [exporting, setExporting] = useState(null);

    const handleExport = async (reportName, endpoint, dataKey = "data") => {
        try {
            setExporting(reportName);
            const loadingToast = toast.loading(`Exporting ${reportName}...`);

            const response = await axiosInstance.get(endpoint);
            const data = response.data?.[dataKey] || [];

            if (data.length === 0) {
                toast.dismiss(loadingToast);
                toast.error("No data available to export.");
                setExporting(null);
                return;
            }

            const headers = Object.keys(data[0]);
            const rows = data.map(item =>
                headers.map(header => {
                    let value = item[header];
                    if (typeof value === 'string' && value.includes(',')) {
                        return `"${value}"`;
                    }
                    if (value === null || value === undefined) {
                        return "";
                    }
                    if (typeof value === 'object') {
                        return JSON.stringify(value);
                    }
                    return value;
                })
            );

            let csv = headers.join(",") + "\n";
            rows.forEach(row => {
                csv += row.join(",") + "\n";
            });

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${reportName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.dismiss(loadingToast);
            toast.success(`${reportName} exported successfully!`);
        } catch (err) {
            console.error("Export failed:", err);
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || "Failed to export report.");
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportGroups.map((group) => (
                <div key={group.title} className="bg-white rounded-xl border p-5">
                    <h3 className="text-sm font-semibold mb-3">{group.title}</h3>
                    <ul className="space-y-2">
                        {group.reports.map((report) => (
                            <li key={report.name} className="flex items-center justify-between hover:bg-gray-50 px-2 py-1 rounded-lg transition">
                                {/* Link is read-only navigation — no gate needed */}
                                <Link href={report.href} className="text-sm text-gray-700 hover:text-blue-600 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    {report.name}
                                </Link>

                                {/* RBAC: exporting a report requires reports.export */}
                                <Can permission={PERMISSIONS.REPORTS_EXPORT}>
                                    <button
                                        onClick={() => handleExport(report.name, report.endpoint, report.dataKey)}
                                        disabled={exporting === report.name}
                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                        title="Export CSV"
                                    >
                                        {exporting === report.name ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4" />
                                        )}
                                    </button>
                                </Can>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}