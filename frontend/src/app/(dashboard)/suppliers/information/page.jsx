"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Users, Star, CheckCircle, XCircle, Clock,
    Eye, Edit, Loader2, Search, Filter,
    Award, AlertTriangle, Package, ShoppingCart,
    FileText, MapPin, Phone, Mail, Building,
    RefreshCw, Plus, Trash2, Save, X
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can, CanAny } from "@/components/auth/Can";             // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

function SupplierInformationContent() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterRating, setFilterRating] = useState("all");
    const [formData, setFormData] = useState({
        supplier_name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        status: "active",
        rating: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [suppliersRes] = await Promise.all([
                axiosInstance.get("/suppliers"),
            ]);

            const suppliersData = suppliersRes.data?.data || [];
            setSuppliers(suppliersData);

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

    const handleEditSupplier = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            supplier_name: supplier.supplier_name || "",
            contact_person: supplier.contact_person || "",
            phone: supplier.phone || "",
            email: supplier.email || "",
            address: supplier.address || "",
            status: supplier.status || "active",
            rating: supplier.rating || 0,
        });
        setShowEditModal(true);
    };

    const handleDeleteSupplier = async (supplierId) => {
        if (!confirm("Are you sure you want to delete this supplier? This action cannot be undone.")) return;

        try {
            await axiosInstance.delete(`/suppliers/${supplierId}`);
            toast.success("Supplier deleted successfully.");
            loadData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to delete supplier.");
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();

        if (!formData.supplier_name.trim()) {
            toast.error("Supplier name is required.");
            return;
        }

        try {
            setSubmitting(true);
            await axiosInstance.put(`/suppliers/${editingSupplier.supplier_id}`, formData);
            toast.success("Supplier updated successfully.");
            setShowEditModal(false);
            setEditingSupplier(null);
            loadData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update supplier.");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-gray-100 text-gray-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getRatingStars = (rating) => {
        const numericRating = typeof rating === 'string' ? parseFloat(rating) : (rating || 0);
        const fullStars = Math.floor(numericRating);
        const emptyStars = 5 - fullStars;

        return (
            <span className="flex items-center gap-0.5">
                {[...Array(Math.max(0, fullStars))].map((_, i) => (
                    <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                {[...Array(Math.max(0, emptyStars))].map((_, i) => (
                    <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
                ))}
                <span className="ml-1 text-xs text-gray-500">({numericRating.toFixed(1)})</span>
            </span>
        );
    };

    const filteredSuppliers = suppliers
        .filter(s => {
            const matchesSearch = s.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phone?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === "all" || s.status === filterStatus;
            const matchesRating = filterRating === "all" ||
                (filterRating === "high" && parseFloat(s.rating || 0) >= 4) ||
                (filterRating === "medium" && parseFloat(s.rating || 0) >= 2.5 && parseFloat(s.rating || 0) < 4) ||
                (filterRating === "low" && parseFloat(s.rating || 0) < 2.5 && parseFloat(s.rating || 0) > 0) ||
                (filterRating === "unrated" && (!s.rating || parseFloat(s.rating || 0) === 0));
            return matchesSearch && matchesStatus && matchesRating;
        })
        .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === "active").length;
    const inactiveSuppliers = suppliers.filter(s => s.status === "inactive").length;
    const ratedSuppliers = suppliers.filter(s => parseFloat(s.rating || 0) > 0).length;
    const avgRating = suppliers
        .filter(s => parseFloat(s.rating || 0) > 0)
        .reduce((sum, s) => sum + parseFloat(s.rating || 0), 0) / (ratedSuppliers || 1);

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
                    <h1 className="text-2xl font-semibold">Supplier Information</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        View and manage detailed supplier information.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* RBAC: adding suppliers requires suppliers.create */}
                    <Can permission={PERMISSIONS.SUPPLIERS_CREATE}>
                        <button
                            onClick={() => window.location.href = "/suppliers/registration"}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Supplier
                        </button>
                    </Can>

                    {/* Refresh — read-only */}
                    <button
                        onClick={loadData}
                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by name, contact, email, or phone..."
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
                            <th className="px-4 py-3 text-left font-medium">Contact Person</th>
                            <th className="px-4 py-3 text-left font-medium">Phone</th>
                            <th className="px-4 py-3 text-left font-medium">Email</th>
                            <th className="px-4 py-3 text-center font-medium">Rating</th>
                            <th className="px-4 py-3 text-center font-medium">Status</th>

                            {/* RBAC: hide Actions column if user can't edit/delete */}
                            <CanAny permissions={[
                                PERMISSIONS.SUPPLIERS_EDIT,
                                PERMISSIONS.SUPPLIERS_DELETE,
                            ]}>
                                <th className="px-4 py-3 text-center font-medium">Actions</th>
                            </CanAny>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredSuppliers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                    No suppliers found matching the filters.
                                </td>
                            </tr>
                        ) : (
                            filteredSuppliers.map((supplier) => (
                                <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{supplier.supplier_name}</td>
                                    <td className="px-4 py-3">{supplier.contact_person || "—"}</td>
                                    <td className="px-4 py-3">{supplier.phone || "—"}</td>
                                    <td className="px-4 py-3">{supplier.email || "—"}</td>
                                    <td className="px-4 py-3 text-center">
                                        {getRatingStars(supplier.rating || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(supplier.status)}`}>
                                            {supplier.status || "active"}
                                        </span>
                                    </td>

                                    <CanAny permissions={[
                                        PERMISSIONS.SUPPLIERS_EDIT,
                                        PERMISSIONS.SUPPLIERS_DELETE,
                                    ]}>
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

                                                <Can permission={PERMISSIONS.SUPPLIERS_EDIT}>
                                                    <button
                                                        onClick={() => handleEditSupplier(supplier)}
                                                        className="text-yellow-600 hover:text-yellow-800"
                                                        title="Edit Supplier"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </Can>

                                                <Can permission={PERMISSIONS.SUPPLIERS_DELETE}>
                                                    <button
                                                        onClick={() => handleDeleteSupplier(supplier.supplier_id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete Supplier"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </Can>
                                            </div>
                                        </td>
                                    </CanAny>
                                </tr>
                            ))
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
                                    <Building className="h-5 w-5 text-blue-600" />
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
                                <div className="col-span-2 border-t pt-4">
                                    <p className="text-xs font-medium uppercase text-gray-500">Additional Info</p>
                                    <div className="mt-1 text-sm text-gray-600">
                                        <p>Supplier ID: {selectedSupplier.supplier_id}</p>
                                        <p>Created: {selectedSupplier.created_at ? new Date(selectedSupplier.created_at).toLocaleDateString() : "—"}</p>
                                        <p>Last Updated: {selectedSupplier.updated_at ? new Date(selectedSupplier.updated_at).toLocaleDateString() : "—"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                {/* RBAC: Edit button in view modal requires suppliers.edit */}
                                <Can permission={PERMISSIONS.SUPPLIERS_EDIT}>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            handleEditSupplier(selectedSupplier);
                                        }}
                                        className="rounded-lg bg-yellow-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-yellow-700 flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit Supplier
                                    </button>
                                </Can>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Supplier Modal */}
            {showEditModal && editingSupplier && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">Edit Supplier</h2>
                                <p className="text-sm text-gray-500">Update supplier information</p>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Supplier Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.supplier_name}
                                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Contact Person
                                </label>
                                <input
                                    type="text"
                                    value={formData.contact_person}
                                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows="2"
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Rating (1-5)
                                </label>
                                <select
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="0">Not Rated</option>
                                    <option value="1">1 ★</option>
                                    <option value="2">2 ★</option>
                                    <option value="3">3 ★</option>
                                    <option value="4">4 ★</option>
                                    <option value="5">5 ★</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
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
                                        <Save className="h-4 w-4" />
                                    )}
                                    {submitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SupplierInformationPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.SUPPLIERS_VIEW}>
            <SupplierInformationContent />
        </PermissionGuard>
    );
}