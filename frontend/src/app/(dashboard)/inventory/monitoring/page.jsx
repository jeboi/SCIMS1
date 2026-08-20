"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Search, AlertTriangle, Package, Filter, X, Loader2 } from "lucide-react";

export default function InventoryMonitoringPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        status: "",
        category_id: "",
        low_stock_only: false,
    });
    const [categories, setCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({
        totalItems: 0,
        totalStock: 0,
        lowStockCount: 0,
        categoriesCount: 0,
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            // Fetch items and categories in parallel
            const [itemsRes, categoriesRes] = await Promise.all([
                axiosInstance.get("/items"),
                axiosInstance.get("/categories"),
            ]);

            const itemsData = itemsRes.data?.data || [];
            const categoriesData = categoriesRes.data?.data || [];

            setItems(itemsData);
            setCategories(categoriesData);

            // Calculate stats
            const totalStock = itemsData.reduce((sum, item) => sum + (item.current_stock || 0), 0);
            const lowStockItems = itemsData.filter(item => 
                item.current_stock <= item.reorder_level && item.status === "active"
            );

            setStats({
                totalItems: itemsData.length,
                totalStock: totalStock,
                lowStockCount: lowStockItems.length,
                categoriesCount: categoriesData.length,
            });

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load inventory data.");
            toast.error("Failed to load inventory data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Apply filters and search
    const filteredItems = items.filter((item) => {
        // Search filter
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
            item.item_name?.toLowerCase().includes(search) ||
            item.barcode?.toLowerCase().includes(search) ||
            item.category?.category_name?.toLowerCase().includes(search);

        // Status filter
        const matchesStatus = filters.status ? item.status === filters.status : true;

        // Category filter
        const matchesCategory = filters.category_id 
            ? item.category_id === parseInt(filters.category_id) 
            : true;

        // Low stock filter
        const matchesLowStock = filters.low_stock_only 
            ? item.current_stock <= item.reorder_level 
            : true;

        return matchesSearch && matchesStatus && matchesCategory && matchesLowStock;
    });

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: "",
            category_id: "",
            low_stock_only: false,
        });
        setSearchTerm("");
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-gray-100 text-gray-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStockStatus = (item) => {
        if (item.current_stock <= 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
        if (item.current_stock <= item.reorder_level) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
        return { label: "In Stock", color: "bg-green-100 text-green-800" };
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
                <AlertTriangle className="h-12 w-12 mb-4" />
                <p>{error}</p>
                <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
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
                    <h1 className="text-2xl font-semibold">Inventory Monitoring</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Monitor current stock levels and inventory status.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-5">
                    <p className="text-sm text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold">{stats.totalItems}</p>
                </div>
                <div className="bg-white rounded-lg border p-5">
                    <p className="text-sm text-gray-500">Total Stock Units</p>
                    <p className="text-2xl font-bold">{stats.totalStock}</p>
                </div>
                <div className="bg-white rounded-lg border p-5">
                    <p className="text-sm text-gray-500">Low Stock Items</p>
                    <p className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-yellow-600' : ''}`}>
                        {stats.lowStockCount}
                    </p>
                </div>
                <div className="bg-white rounded-lg border p-5">
                    <p className="text-sm text-gray-500">Categories</p>
                    <p className="text-2xl font-bold">{stats.categoriesCount}</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-lg border p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search by item name, barcode, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {Object.values(filters).some(v => v) && (
                            <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                                {Object.values(filters).filter(v => v).length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50"
                    >
                        Clear All
                    </button>
                </div>

                {showFilters && (
                    <div className="flex flex-wrap items-end gap-4 pt-4 border-t">
                        <div>
                            <label className="block text-xs font-medium text-gray-600">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                                className="mt-1 rounded border px-3 py-1.5 text-sm"
                            >
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600">Category</label>
                            <select
                                value={filters.category_id}
                                onChange={(e) => handleFilterChange("category_id", e.target.value)}
                                className="mt-1 rounded border px-3 py-1.5 text-sm"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600">&nbsp;</label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.low_stock_only}
                                    onChange={(e) => handleFilterChange("low_stock_only", e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Low Stock Only
                            </label>
                        </div>
                        <button
                            onClick={() => {
                                setShowFilters(false);
                                clearFilters();
                            }}
                            className="text-sm text-red-500 hover:text-red-700"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500">
                Showing {filteredItems.length} of {items.length} items
            </div>

            {/* Table */}
            {filteredItems.length === 0 ? (
                <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No items found matching your criteria.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Item Name</th>
                                <th className="px-4 py-3 text-left font-medium">Barcode</th>
                                <th className="px-4 py-3 text-left font-medium">Category</th>
                                <th className="px-4 py-3 text-left font-medium">Unit</th>
                                <th className="px-4 py-3 text-right font-medium">Stock</th>
                                <th className="px-4 py-3 text-right font-medium">Reorder Level</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Stock Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredItems.map((item) => {
                                const stockStatus = getStockStatus(item);
                                return (
                                    <tr key={item.item_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{item.item_name}</td>
                                        <td className="px-4 py-3">{item.barcode || "—"}</td>
                                        <td className="px-4 py-3">
                                            {item.category?.category_name || "—"}
                                        </td>
                                        <td className="px-4 py-3">{item.unit || "—"}</td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {item.current_stock}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {item.reorder_level}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stockStatus.color}`}>
                                                {stockStatus.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}