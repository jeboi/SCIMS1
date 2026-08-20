"use client";

import { useState, useEffect } from "react";
import { RefreshCw, BarChart3 } from "lucide-react";
import { toast } from "react-hot-toast";

import ReportFilters from "@/components/reports/ReportFilters";
import ReportKpiCards from "@/components/reports/ReportKpiCards";
import InventoryAnalytics from "@/components/reports/InventoryAnalytics";
import ProcurementAnalytics from "@/components/reports/ProcurementAnalytics";
import SupplierAnalytics from "@/components/reports/SupplierAnalytics";
import LogisticsAnalytics from "@/components/reports/LogisticsAnalytics";
import LowStockTable from "@/components/reports/LowStockTable";
import ReportCards from "@/components/reports/ReportCards";
import { reportsApi } from "@/features/reports/reports.api";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [metrics, setMetrics] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);
    const [procurementData, setProcurementData] = useState(null);
    const [supplierData, setSupplierData] = useState([]);
    const [logisticsData, setLogisticsData] = useState(null);
    const [lowStockItems, setLowStockItems] = useState([]);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            
            const [metricsRes, inventoryRes, procurementRes, supplierRes, logisticsRes] = await Promise.all([
                reportsApi.getMetrics(),
                reportsApi.getInventoryAnalytics(),
                reportsApi.getProcurementAnalytics(),
                reportsApi.getSupplierAnalytics(),
                reportsApi.getLogisticsAnalytics(),
            ]);

            // Set metrics
            setMetrics(metricsRes?.data || null);
            
            // Set inventory data
            setInventoryData(inventoryRes?.data || null);
            
            // Set procurement data
            setProcurementData(procurementRes?.data || null);
            
            // Set supplier data - ensure it's an array
            const suppliers = supplierRes?.data?.suppliers || [];
            setSupplierData(Array.isArray(suppliers) ? suppliers : []);
            
            // Set logistics data
            setLogisticsData(logisticsRes?.data || null);
            
            // Set low stock items - ensure it's an array
            const lowStock = inventoryRes?.data?.lowStockItems || [];
            setLowStockItems(Array.isArray(lowStock) ? lowStock : []);
            
        } catch (err) {
            console.error("Failed to load reports data:", err);
            toast.error("Failed to load reports data");
            // Set empty data on error
            setMetrics(null);
            setInventoryData(null);
            setProcurementData(null);
            setSupplierData([]);
            setLogisticsData(null);
            setLowStockItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        loadAllData();
    };

    const handleResetFilters = () => {
        setFilters({});
        loadAllData();
    };

    const handleRefresh = () => {
        loadAllData();
        toast.success("Reports refreshed");
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        Reports & Analytics
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Monitor inventory, supply chain, procurement, warehouse, supplier, and logistics performance.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleRefresh}
                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Global Filters */}
            <ReportFilters 
                onApply={handleApplyFilters} 
                onReset={handleResetFilters}
                initialFilters={filters}
            />

            {/* KPI Cards */}
            <ReportKpiCards data={metrics} loading={loading} />

            {/* Inventory Analytics */}
            <section>
                <h2 className="text-lg font-semibold mb-4">📦 Inventory Analytics</h2>
                <InventoryAnalytics data={inventoryData} loading={loading} />
            </section>

            {/* Low Stock Table */}
            <section>
                <h2 className="text-lg font-semibold mb-4">⚠️ Items Requiring Attention</h2>
                <div className="bg-white rounded-xl border p-5">
                    <LowStockTable items={lowStockItems} loading={loading} />
                </div>
            </section>

            {/* Procurement Analytics */}
            <section>
                <h2 className="text-lg font-semibold mb-4">🛒 Procurement Analytics</h2>
                <ProcurementAnalytics data={procurementData} loading={loading} />
            </section>

            {/* Supplier Analytics */}
            <section>
                <h2 className="text-lg font-semibold mb-4">🏢 Supplier Analytics</h2>
                <SupplierAnalytics data={supplierData} loading={loading} />
            </section>

            {/* Logistics Analytics */}
            <section>
                <h2 className="text-lg font-semibold mb-4">🚚 Logistics & Receiving Analytics</h2>
                <LogisticsAnalytics data={logisticsData} loading={loading} />
            </section>

            {/* AI Predictive Analytics (Placeholder) */}
            <section>
                <h2 className="text-lg font-semibold mb-4">🤖 AI-Powered Predictive Analytics</h2>
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-8 text-center">
                    <div className="flex flex-col items-center">
                        <BarChart3 className="h-12 w-12 text-indigo-400 mb-3" />
                        <h3 className="text-lg font-medium text-indigo-800">AI Forecasting Coming Soon</h3>
                        <p className="text-sm text-indigo-600 max-w-md mt-1">
                            Predictive analytics will be available when the AI backend is fully integrated.
                            This feature will provide demand forecasting, stock-out risk analysis, and reorder recommendations.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">Demand Forecast</span>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">Stock-Out Risk</span>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">Reorder Recommendations</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Available Reports */}
            <section>
                <h2 className="text-lg font-semibold mb-4">📄 Available Reports</h2>
                <ReportCards />
            </section>
        </div>
    );
}