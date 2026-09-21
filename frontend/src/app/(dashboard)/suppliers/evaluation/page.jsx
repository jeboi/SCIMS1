"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Users, Star, CheckCircle, XCircle, Clock,
    TrendingUp, TrendingDown, Minus, RefreshCw,
    Eye, Edit, Loader2, Search, Filter,
    Award, AlertTriangle, Package, ShoppingCart,
    FileText, BarChart3, PieChart as PieChartIcon
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";

function SupplierEvaluationContent() {
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingForm, setRatingForm] = useState({ rating: 0, notes: "" });
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterRating, setFilterRating] = useState("all");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [suppliersRes, posRes] = await Promise.all([
                axiosInstance.get("/suppliers"),
                axiosInstance.get("/purchase-orders"),
            ]);

            const suppliersData = suppliersRes.data?.data || [];
            const posData = posRes.data?.data || [];

            setSuppliers(suppliersData);
            setPurchaseOrders(posData);

        } catch (err) {
            console.error(err);
            setError("Failed to load supplier data.");
            toast.error("Failed to load supplier data.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
    };

    const handleOpenRatingModal = (supplier) => {
        setSelectedSupplier(supplier);
        setRatingForm({ rating: supplier.rating || 0, notes: "" });
        setShowRatingModal(true);
    };

    const handleRatingChange = (value) => {
        setRatingForm((prev) => ({ ...prev, rating: value }));
    };

    const handleSubmitRating = async (e) => {
        e.preventDefault();

        if (ratingForm.rating < 1 || ratingForm.rating > 5) {
            toast.error("Please select a rating between 1 and 5.");
            return;
        }

        try {
            setSubmitting(true);
            await axiosInstance.put(`/suppliers/${selectedSupplier.supplier_id}`, {
                ...selectedSupplier,
                rating: ratingForm.rating,
            });

            toast.success(`Supplier rating updated to ${ratingForm.rating} ★`);
            setShowRatingModal(false);
            setSelectedSupplier(null);
            loadData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update rating.");
        } finally {
            setSubmitting(false);
        }
    };

    const getSupplierStats = (supplierId) => {
        const pos = purchaseOrders.filter(po => po.supplier_id === supplierId);
        const total = pos.length;
        const completed = pos.filter(po => po.status === "completed" || po.status === "delivered").length;
        const pending = pos.filter(po => po.status === "pending").length;
        const approved = pos.filter(po => po.status === "approved").length;
        const rejected = pos.filter(po => po.status === "rejected").length;

        return {
            total,
            completed,
            pending,
            approved,
            rejected,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    };

    const getRatingStars = (rating) => {
        const numericRating = typeof rating === 'string' ? parseFloat(rating) : (rating || 0);
        const fullStars = Math.floor(numericRating);
        const halfStar = numericRating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <span className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                {halfStar && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
                ))}
                <span className="ml-1 text-xs text-gray-500">({numericRating.toFixed(1)})</span>
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-gray-100 text-gray-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const filteredSuppliers = suppliers
        .filter(s => {
            const matchesSearch = s.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === "all" || s.status === filterStatus;
            const matchesRating = filterRating === "all" ||
                (filterRating === "high" && s.rating >= 4) ||
                (filterRating === "medium" && s.rating >= 2.5 && s.rating < 4) ||
                (filterRating === "low" && s.rating < 2.5 && s.rating > 0) ||
                (filterRating === "unrated" && !s.rating);
            return matchesSearch && matchesStatus && matchesRating;
        })
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === "active").length;
    const inactiveSuppliers = suppliers.filter(s => s.status === "inactive").length;
    const ratedSuppliers = suppliers.filter(s => s.rating > 0).length;
    const avgRating = suppliers
        .filter(s => s.rating > 0)
        .reduce((sum, s) => sum + parseFloat(s.rating || 0), 0) / (ratedSuppliers || 1);

    const ratingDistribution = [
        { range: "5 ★", count: suppliers.filter(s => parseFloat(s.rating) >= 4.5).length, color: "#22c55e" },
        { range: "4 ★", count: suppliers.filter(s => parseFloat(s.rating) >= 3.5 && parseFloat(s.rating) < 4.5).length, color: "#3b82f6" },
        { range: "3 ★", count: suppliers.filter(s => parseFloat(s.rating) >= 2.5 && parseFloat(s.rating) < 3.5).length, color: "#f59e0b" },
        { range: "2 ★", count: suppliers.filter(s => parseFloat(s.rating) >= 1.5 && parseFloat(s.rating) < 2.5).length, color: "#f97316" },
        { range: "1 ★", count: suppliers.filter(s => parseFloat(s.rating) > 0 && parseFloat(s.rating) < 1.5).length, color: "#ef4444" },
        { range: "Unrated", count: suppliers.filter(s => !s.rating || parseFloat(s.rating) === 0).length, color: "#9ca3af" },
    ].filter(d => d.count > 0);

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
                    <h1 className="text-2xl font-semibold">Supplier Evaluation</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Evaluate and rate supplier performance based on delivery and quality.
                    </p>
                </div>
                <button
                    onClick={loadData}
                    className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{totalSuppliers}</p>
                    <p className="text-xs text-gray-500">Total Suppliers</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
                    <p className="text-xs text-gray-500">Active</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{inactiveSuppliers}</p>
                    <p className="text-xs text-gray-500">Inactive</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Star className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{ratedSuppliers}</p>
                    <p className="text-xs text-gray-500">Rated</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Award className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{avgRating.toFixed(1)} ★</p>
                    <p className="text-xs text-gray-500">Avg Rating</p>
                </div>
            </div>

            {/* Rating Distribution Chart */}
            {ratingDistribution.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Rating Distribution</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ratingDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by supplier name, contact, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-40">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="w-full sm:w-40">
                    <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Ratings</option>
                        <option value="high">High (4-5 ★)</option>
                        <option value="medium">Medium (2.5-4 ★)</option>
                        <option value="low">Low (1-2.5 ★)</option>
                        <option value="unrated">Unrated</option>
                    </select>
                </div>
                <button
                    onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                        setFilterRating("all");
                    }}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                >
                    Clear
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="min-w-full text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Supplier</th>
                            <th className="px-4 py-3 text-left font-medium">Contact</th>
                            <th className="px-4 py-3 text-left font-medium">Email</th>
                            <th className="px-4 py-3 text-center font-medium">Rating</th>
                            <th className="px-4 py-3 text-center font-medium">POs</th>
                            <th className="px-4 py-3 text-center font-medium">Completion</th>
                            <th className="px-4 py-3 text-center font-medium">Status</th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredSuppliers.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                    No suppliers found matching the filters.
                                </td>
                            </tr>
                        ) : (
                            filteredSuppliers.map((supplier) => {
                                const stats = getSupplierStats(supplier.supplier_id);
                                return (
                                    <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{supplier.supplier_name}</td>
                                        <td className="px-4 py-3">{supplier.contact_person || "—"}</td>
                                        <td className="px-4 py-3">{supplier.email || "—"}</td>
                                        <td className="px-4 py-3 text-center">
                                            {getRatingStars(supplier.rating || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-center">{stats.total}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-sm font-medium ${
                                                stats.completionRate > 80 ? 'text-green-600' :
                                                stats.completionRate > 50 ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                                {stats.completionRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(supplier.status)}`}>
                                                {supplier.status || "active"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* View is read-only */}
                                                <button
                                                    onClick={() => handleViewSupplier(supplier)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                {/* RBAC: rating requires suppliers.evaluate */}
                                                <Can permission={PERMISSIONS.SUPPLIERS_EVALUATE}>
                                                    <button
                                                        onClick={() => handleOpenRatingModal(supplier)}
                                                        className="text-yellow-600 hover:text-yellow-800"
                                                        title="Rate Supplier"
                                                    >
                                                        <Star className="h-4 w-4" />
                                                    </button>
                                                </Can>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Supplier Modal */}
            {showModal && selectedSupplier && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="w-full max-w-2xl rounded-xl bg-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    {selectedSupplier.supplier_name}
                                </h2>
                                <p className="text-sm text-gray-500">Supplier Details</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Contact Person</p>
                                    <p className="text-sm font-medium">{selectedSupplier.contact_person || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Email</p>
                                    <p className="text-sm">{selectedSupplier.email || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Phone</p>
                                    <p className="text-sm">{selectedSupplier.phone || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(selectedSupplier.status)}`}>
                                        {selectedSupplier.status || "active"}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-medium uppercase text-gray-500">Address</p>
                                    <p className="text-sm">{selectedSupplier.address || "—"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-medium uppercase text-gray-500">Rating</p>
                                    <div className="mt-1">{getRatingStars(selectedSupplier.rating || 0)}</div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold mb-2">Performance Summary</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {getSupplierStats(selectedSupplier.supplier_id).total}
                                        </p>
                                        <p className="text-xs text-gray-500">Total POs</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {getSupplierStats(selectedSupplier.supplier_id).completed}
                                        </p>
                                        <p className="text-xs text-gray-500">Completed</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {getSupplierStats(selectedSupplier.supplier_id).pending}
                                        </p>
                                        <p className="text-xs text-gray-500">Pending</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {getSupplierStats(selectedSupplier.supplier_id).completionRate}%
                                        </p>
                                        <p className="text-xs text-gray-500">Completion Rate</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end border-t pt-4">
                                {/* RBAC: rate action requires suppliers.evaluate */}
                                <Can permission={PERMISSIONS.SUPPLIERS_EVALUATE}>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            handleOpenRatingModal(selectedSupplier);
                                        }}
                                        className="rounded-lg bg-yellow-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-yellow-700 flex items-center gap-2"
                                    >
                                        <Star className="h-4 w-4" />
                                        Rate Supplier
                                    </button>
                                </Can>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50 ml-3"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && selectedSupplier && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowRatingModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">Rate Supplier</h2>
                                <p className="text-sm text-gray-500">{selectedSupplier.supplier_name}</p>
                            </div>
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRating} className="p-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Rating (1-5)
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingChange(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`h-8 w-8 transition ${
                                                    star <= ratingForm.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300 hover:text-yellow-200"
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        {ratingForm.rating > 0 ? `${ratingForm.rating} ★` : "Select rating"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Notes (optional)
                                </label>
                                <textarea
                                    value={ratingForm.notes}
                                    onChange={(e) => setRatingForm({ ...ratingForm, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Add notes about supplier performance..."
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRatingModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-lg bg-yellow-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Star className="h-4 w-4" />
                                    )}
                                    {submitting ? "Saving..." : "Save Rating"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SupplierEvaluationPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.SUPPLIERS_VIEW}>
            <SupplierEvaluationContent />
        </PermissionGuard>
    );
}