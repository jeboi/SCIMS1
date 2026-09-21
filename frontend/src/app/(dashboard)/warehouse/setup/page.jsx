"use client";

import { useEffect, useState } from "react";
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from "@/services/api";
import { toast } from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can, CanAny } from "@/components/auth/Can";             // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

const initialForm = {
    warehouse_name: "",
    location: "",
    capacity: "",
    status: "active",
};

function WarehouseSetupContent() {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getWarehouses();
            setWarehouses(response.data || []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load warehouses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (warehouse = null) => {
        if (warehouse) {
            setEditingId(warehouse.warehouse_id);
            setForm({
                warehouse_name: warehouse.warehouse_name,
                location: warehouse.location || "",
                capacity: warehouse.capacity || "",
                status: warehouse.status || "active",
            });
        } else {
            setEditingId(null);
            setForm(initialForm);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (saving) return;
        setShowModal(false);
        setForm(initialForm);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.warehouse_name.trim()) {
            toast.error("Warehouse name is required.");
            return;
        }
        if (!form.location.trim()) {
            toast.error("Location is required.");
            return;
        }
        const payload = {
            warehouse_name: form.warehouse_name.trim(),
            location: form.location.trim(),
            capacity: Number(form.capacity) || 0,
            status: form.status,
        };

        try {
            setSaving(true);
            if (editingId) {
                await updateWarehouse(editingId, payload);
                toast.success("Warehouse updated successfully.");
            } else {
                await createWarehouse(payload);
                toast.success("Warehouse created successfully.");
            }
            setShowModal(false);
            setForm(initialForm);
            setEditingId(null);
            fetchWarehouses();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Operation failed.";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this warehouse?")) return;
        try {
            await deleteWarehouse(id);
            toast.success("Warehouse deleted.");
            fetchWarehouses();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Delete failed.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Warehouse Setup</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage warehouses where inventory is stored.
                    </p>
                </div>

                {/* RBAC: only warehousing.create can add warehouses */}
                <Can permission={PERMISSIONS.WAREHOUSING_CREATE}>
                    <button
                        onClick={() => handleOpenModal()}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Add Warehouse
                    </button>
                </Can>
            </div>

            {/* Loading & Error */}
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Table */}
            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">ID</th>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Location</th>
                                <th className="px-4 py-3 text-right font-medium">Capacity</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>

                                {/* RBAC: hide entire Actions column when user can't edit/delete */}
                                <CanAny permissions={[
                                    PERMISSIONS.WAREHOUSING_EDIT,
                                    PERMISSIONS.WAREHOUSING_DELETE,
                                ]}>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </CanAny>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {warehouses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        No warehouses found.
                                    </td>
                                </tr>
                            ) : (
                                warehouses.map((wh) => (
                                    <tr key={wh.warehouse_id}>
                                        <td className="px-4 py-3">{wh.warehouse_id}</td>
                                        <td className="px-4 py-3 font-medium">{wh.warehouse_name}</td>
                                        <td className="px-4 py-3">{wh.location || "—"}</td>
                                        <td className="px-4 py-3 text-right">{wh.capacity || 0}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                wh.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {wh.status}
                                            </span>
                                        </td>

                                        {/* RBAC: same wrapper keeps table column aligned */}
                                        <CanAny permissions={[
                                            PERMISSIONS.WAREHOUSING_EDIT,
                                            PERMISSIONS.WAREHOUSING_DELETE,
                                        ]}>
                                            <td className="px-4 py-3 text-right">
                                                <Can permission={PERMISSIONS.WAREHOUSING_EDIT}>
                                                    <button
                                                        onClick={() => handleOpenModal(wh)}
                                                        className="mr-2 text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                </Can>
                                                <Can permission={PERMISSIONS.WAREHOUSING_DELETE}>
                                                    <button
                                                        onClick={() => handleDelete(wh.warehouse_id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </Can>
                                            </td>
                                        </CanAny>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => e.target === e.currentTarget && handleCloseModal()}
                >
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-lg font-semibold">
                                {editingId ? "Edit Warehouse" : "Add Warehouse"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                disabled={saving}
                                className="text-xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Warehouse Name *
                                </label>
                                <input
                                    type="text"
                                    name="warehouse_name"
                                    value={form.warehouse_name}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2.5 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2.5 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Capacity (units)
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    min="0"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2.5 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2.5 text-sm"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={saving}
                                    className="rounded border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {saving ? "Saving..." : editingId ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WarehouseSetupPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.WAREHOUSING_VIEW}>
            <WarehouseSetupContent />
        </PermissionGuard>
    );
}