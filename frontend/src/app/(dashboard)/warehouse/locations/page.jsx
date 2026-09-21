"use client";

import { useEffect, useState } from "react";
import {
    getStorageLocations,
    createStorageLocation,
    updateStorageLocation,
    deleteStorageLocation,
    getWarehouses
} from "@/services/api";
import { toast } from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can, CanAny } from "@/components/auth/Can";             // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

const initialForm = {
    warehouse_id: "",
    location_code: "",
    location_name: "",
    zone: "",
    aisle: "",
    shelf: "",
    bin: "",
    rack: "",
    capacity: "",
    status: "active",
};

function StorageLocationsContent() {
    const [locations, setLocations] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const [locationsRes, warehousesRes] = await Promise.all([
                getStorageLocations(),
                getWarehouses()
            ]);
            setLocations(locationsRes.data || []);
            setWarehouses(warehousesRes.data || []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (location = null) => {
        if (location) {
            setEditingId(location.location_id);
            setForm({
                warehouse_id: location.warehouse_id || "",
                location_code: location.location_code || "",
                location_name: location.location_name || "",
                zone: location.zone || "",
                aisle: location.aisle || "",
                shelf: location.shelf || "",
                bin: location.bin || "",
                rack: location.rack || "",
                capacity: location.capacity || "",
                status: location.status || "active",
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

        if (!form.warehouse_id) {
            toast.error("Please select a warehouse.");
            return;
        }
        if (!form.location_code.trim()) {
            toast.error("Location code is required.");
            return;
        }
        if (!form.location_name.trim()) {
            toast.error("Location name is required.");
            return;
        }

        const payload = {
            warehouse_id: Number(form.warehouse_id),
            location_code: form.location_code.trim(),
            location_name: form.location_name.trim(),
            zone: form.zone.trim() || null,
            aisle: form.aisle.trim() || null,
            shelf: form.shelf.trim() || null,
            bin: form.bin.trim() || null,
            rack: form.rack.trim() || null,
            capacity: Number(form.capacity) || 0,
            status: form.status,
        };

        try {
            setSaving(true);
            if (editingId) {
                await updateStorageLocation(editingId, payload);
                toast.success("Storage location updated successfully.");
            } else {
                await createStorageLocation(payload);
                toast.success("Storage location created successfully.");
            }
            setShowModal(false);
            setForm(initialForm);
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Operation failed.";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this storage location?")) return;
        try {
            await deleteStorageLocation(id);
            toast.success("Storage location deleted.");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Delete failed.");
        }
    };

    const getWarehouseName = (warehouseId) => {
        const warehouse = warehouses.find(w => w.warehouse_id === warehouseId);
        return warehouse ? warehouse.warehouse_name : "Unknown";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Storage Locations</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage storage locations within warehouses.
                    </p>
                </div>

                {/* RBAC: only warehousing.create can add locations */}
                <Can permission={PERMISSIONS.WAREHOUSING_CREATE}>
                    <button
                        onClick={() => handleOpenModal()}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Add Location
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
                                <th className="px-4 py-3 text-left font-medium">Code</th>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Warehouse</th>
                                <th className="px-4 py-3 text-left font-medium">Zone</th>
                                <th className="px-4 py-3 text-left font-medium">Aisle/Shelf/Bin</th>
                                <th className="px-4 py-3 text-right font-medium">Capacity</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>

                                {/* RBAC: hide entire Actions column if user can't act on any row */}
                                <CanAny permissions={[
                                    PERMISSIONS.WAREHOUSING_EDIT,
                                    PERMISSIONS.WAREHOUSING_DELETE,
                                ]}>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </CanAny>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {locations.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                        No storage locations found.
                                    </td>
                                </tr>
                            ) : (
                                locations.map((loc) => (
                                    <tr key={loc.location_id}>
                                        <td className="px-4 py-3 font-medium">{loc.location_code}</td>
                                        <td className="px-4 py-3">{loc.location_name}</td>
                                        <td className="px-4 py-3">{getWarehouseName(loc.warehouse_id)}</td>
                                        <td className="px-4 py-3">{loc.zone || "—"}</td>
                                        <td className="px-4 py-3">
                                            {loc.aisle || "—"} / {loc.shelf || "—"} / {loc.bin || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right">{loc.capacity || 0}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                loc.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {loc.status}
                                            </span>
                                        </td>

                                        {/* RBAC: hide the cell too, so table stays aligned */}
                                        <CanAny permissions={[
                                            PERMISSIONS.WAREHOUSING_EDIT,
                                            PERMISSIONS.WAREHOUSING_DELETE,
                                        ]}>
                                            <td className="px-4 py-3 text-right">
                                                <Can permission={PERMISSIONS.WAREHOUSING_EDIT}>
                                                    <button
                                                        onClick={() => handleOpenModal(loc)}
                                                        className="mr-2 text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                </Can>

                                                <Can permission={PERMISSIONS.WAREHOUSING_DELETE}>
                                                    <button
                                                        onClick={() => handleDelete(loc.location_id)}
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
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                            <h2 className="text-lg font-semibold">
                                {editingId ? "Edit Storage Location" : "Add Storage Location"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                disabled={saving}
                                className="text-xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form
                            onSubmit={handleSubmit}
                            className="overflow-y-auto p-6 space-y-4"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Warehouse *
                                </label>
                                <select
                                    name="warehouse_id"
                                    value={form.warehouse_id}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select warehouse</option>
                                    {warehouses.map((wh) => (
                                        <option key={wh.warehouse_id} value={wh.warehouse_id}>
                                            {wh.warehouse_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Location Code *
                                </label>
                                <input
                                    type="text"
                                    name="location_code"
                                    value={form.location_code}
                                    onChange={handleChange}
                                    placeholder="e.g. WH1-A1-S2-B3"
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Location Name *
                                </label>
                                <input
                                    type="text"
                                    name="location_name"
                                    value={form.location_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Aisle 1, Shelf 2, Bin 3"
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Zone</label>
                                    <input
                                        type="text"
                                        name="zone"
                                        value={form.zone}
                                        onChange={handleChange}
                                        placeholder="A"
                                        className="w-full rounded border px-2 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Aisle</label>
                                    <input
                                        type="text"
                                        name="aisle"
                                        value={form.aisle}
                                        onChange={handleChange}
                                        placeholder="1"
                                        className="w-full rounded border px-2 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Shelf</label>
                                    <input
                                        type="text"
                                        name="shelf"
                                        value={form.shelf}
                                        onChange={handleChange}
                                        placeholder="2"
                                        className="w-full rounded border px-2 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Bin (optional)</label>
                                <input
                                    type="text"
                                    name="bin"
                                    value={form.bin}
                                    onChange={handleChange}
                                    placeholder="e.g. B3"
                                    className="w-full rounded border px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Rack (optional)</label>
                                <input
                                    type="text"
                                    name="rack"
                                    value={form.rack}
                                    onChange={handleChange}
                                    placeholder="e.g. Rack 3"
                                    className="w-full rounded border px-3 py-2 text-sm"
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
                                    className="w-full rounded border px-3 py-2 text-sm"
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
                                    className="w-full rounded border px-3 py-2 text-sm"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 border-t pt-4 mt-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={saving}
                                    className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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

export default function StorageLocationsPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.WAREHOUSING_VIEW}>
            <StorageLocationsContent />
        </PermissionGuard>
    );
}