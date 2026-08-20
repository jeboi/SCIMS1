"use client";

import { useState, useEffect } from "react";
import { Filter, X, Calendar, Warehouse, Package, Users, Truck } from "lucide-react";
import axiosInstance from "@/lib/axios";

export default function ReportFilters({ onApply, onReset, initialFilters = {} }) {
    const [filters, setFilters] = useState({
        dateRange: "30",
        warehouse_id: "",
        category_id: "",
        item_id: "",
        supplier_id: "",
        transaction_type: "",
        status: "",
        ...initialFilters,
    });

    const [warehouses, setWarehouses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [loadingFilters, setLoadingFilters] = useState(false);

    useEffect(() => {
        loadFilterOptions();
    }, []);

    const loadFilterOptions = async () => {
        try {
            setLoadingFilters(true);
            
            const [warehousesRes, categoriesRes, itemsRes, suppliersRes] = await Promise.all([
                axiosInstance.get("/warehouses").catch(() => ({ data: { data: [] } })),
                axiosInstance.get("/categories").catch(() => ({ data: { data: [] } })),
                axiosInstance.get("/items").catch(() => ({ data: { data: [] } })),
                axiosInstance.get("/suppliers").catch(() => ({ data: { data: [] } })),
            ]);

            setWarehouses(warehousesRes.data?.data || []);
            setCategories(categoriesRes.data?.data || []);
            setItems(itemsRes.data?.data || []);
            setSuppliers(suppliersRes.data?.data || []);
        } catch (err) {
            console.error("Failed to load filter options:", err);
        } finally {
            setLoadingFilters(false);
        }
    };

    const handleChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        onApply(filters);
    };

    const handleReset = () => {
        const resetFilters = {
            dateRange: "30",
            warehouse_id: "",
            category_id: "",
            item_id: "",
            supplier_id: "",
            transaction_type: "",
            status: "",
        };
        setFilters(resetFilters);
        onReset();
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== "30");

    return (
        <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filters</span>
                    {hasActiveFilters && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    )}
                    {loadingFilters && (
                        <span className="text-xs text-gray-400">Loading options...</span>
                    )}
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition"
                >
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
            </div>

            {showFilters && (
                <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Date Range */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => handleChange("dateRange", e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                                <option value="180">Last 6 Months</option>
                                <option value="365">Last Year</option>
                            </select>
                        </div>

                        {/* Warehouse */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Warehouse</label>
                            <select
                                value={filters.warehouse_id}
                                onChange={(e) => handleChange("warehouse_id", e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Warehouses</option>
                                {warehouses.map((wh) => (
                                    <option key={wh.warehouse_id} value={wh.warehouse_id}>
                                        {wh.warehouse_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                            <select
                                value={filters.category_id}
                                onChange={(e) => handleChange("category_id", e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Item */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Item</label>
                            <select
                                value={filters.item_id}
                                onChange={(e) => handleChange("item_id", e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Items</option>
                                {items.map((item) => (
                                    <option key={item.item_id} value={item.item_id}>
                                        {item.item_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Supplier */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Supplier</label>
                            <select
                                value={filters.supplier_id}
                                onChange={(e) => handleChange("supplier_id", e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Suppliers</option>
                                {suppliers.map((sup) => (
                                    <option key={sup.supplier_id} value={sup.supplier_id}>
                                        {sup.supplier_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Transaction Type */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Transaction Type</label>
                            <select
                                value={filters.transaction_type}
                                onChange={(e) => handleChange("transaction_type", e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="receiving">Receiving</option>
                                <option value="issuing">Issuing</option>
                                <option value="transfer_in">Transfer In</option>
                                <option value="transfer_out">Transfer Out</option>
                                <option value="adjustment">Adjustment</option>
                                <option value="return">Return</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50 transition"
                        >
                            Reset Filters
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}