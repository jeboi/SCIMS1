"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";
import {
    Search, Package, Warehouse, MapPin, Loader2,
    ArrowRight, Eye, X, ChevronDown, ChevronUp
} from "lucide-react";

function WarehouseStorageContent() {
    const [warehouses, setWarehouses] = useState([]);
    const [storageLocations, setStorageLocations] = useState([]);
    const [items, setItems] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        warehouse_id: "",
        location_id: "",
        item_id: "",
        quantity: 1,
    });

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationItems, setLocationItems] = useState([]);
    const [showLocationItemsModal, setShowLocationItemsModal] = useState(false);
    const [loadingLocationItems, setLoadingLocationItems] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [warehousesRes, locationsRes, itemsRes, transactionsRes] = await Promise.all([
                axiosInstance.get("/warehouses"),
                axiosInstance.get("/storage-locations"),
                axiosInstance.get("/items"),
                axiosInstance.get("/inventory-transactions"),
            ]);

            setWarehouses(warehousesRes.data?.data || []);
            setStorageLocations(locationsRes.data?.data || []);
            setItems(itemsRes.data?.data || []);
            setTransactions(transactionsRes.data?.data || []);

            if (warehousesRes.data?.data?.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    warehouse_id: String(warehousesRes.data.data[0].warehouse_id),
                }));
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load data.");
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = () => {
        setForm({
            warehouse_id: warehouses.length > 0 ? String(warehouses[0].warehouse_id) : "",
            location_id: "",
            item_id: "",
            quantity: 1,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (submitting) return;
        setShowModal(false);
        setForm({
            warehouse_id: warehouses.length > 0 ? String(warehouses[0].warehouse_id) : "",
            location_id: "",
            item_id: "",
            quantity: 1,
        });
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.warehouse_id) {
            setError("Please select a warehouse.");
            toast.error("Please select a warehouse.");
            return;
        }

        if (!form.location_id) {
            setError("Please select a storage location.");
            toast.error("Please select a storage location.");
            return;
        }

        if (!form.item_id) {
            setError("Please select an item.");
            toast.error("Please select an item.");
            return;
        }

        if (!form.quantity || Number(form.quantity) <= 0) {
            setError("Quantity must be greater than zero.");
            toast.error("Quantity must be greater than zero.");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                item_id: Number(form.item_id),
                warehouse_id: Number(form.warehouse_id),
                location_id: Number(form.location_id),
                transaction_type: "transfer_in",
                quantity: Number(form.quantity),
                reference_no: `STORAGE-${Date.now()}`,
                transaction_date: new Date().toISOString(),
                performed_by: 1,
            };

            await axiosInstance.post("/inventory-transactions", payload);

            toast.success("Items placed into storage successfully!");
            setSuccess("Items placed into storage successfully!");

            setForm({
                warehouse_id: warehouses.length > 0 ? String(warehouses[0].warehouse_id) : "",
                location_id: "",
                item_id: "",
                quantity: 1,
            });
            setShowModal(false);

            loadData();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to place items into storage.";
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewLocationItems = (location) => {
        setSelectedLocation(location);
        setLoadingLocationItems(true);
        setShowLocationItemsModal(true);

        const locationTransactions = transactions.filter(
            (tx) => tx.location_id === location.location_id
        );

        const itemMap = {};
        locationTransactions.forEach((tx) => {
            const itemId = tx.item_id;
            if (!itemMap[itemId]) {
                const item = items.find(i => i.item_id === itemId);
                itemMap[itemId] = {
                    item_id: itemId,
                    item_name: item?.item_name || "Unknown",
                    barcode: item?.barcode || "—",
                    unit: item?.unit || "—",
                    quantity: 0,
                };
            }
            itemMap[itemId].quantity += tx.quantity;
        });

        setLocationItems(Object.values(itemMap));
        setLoadingLocationItems(false);
    };

    const getWarehouseName = (warehouseId) => {
        const warehouse = warehouses.find(w => w.warehouse_id === warehouseId);
        return warehouse ? warehouse.warehouse_name : "Unknown";
    };

    const getLocationName = (locationId) => {
        const location = storageLocations.find(l => l.location_id === locationId);
        return location ? location.location_code : "Unknown";
    };

    const filteredLocations = storageLocations.filter(
        (loc) => String(loc.warehouse_id) === String(form.warehouse_id)
    );

    const filteredItems = items.filter((item) =>
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableItems = filteredItems.filter((item) => item.current_stock > 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error && !showModal) {
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
                    <h1 className="text-2xl font-semibold">Warehouse Storage</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Place received items into storage locations.
                    </p>
                </div>

                {/* RBAC: placing items into storage writes an inventory transaction → inventory.adjust */}
                <Can permission={PERMISSIONS.INVENTORY_ADJUST}>
                    <button
                        onClick={handleOpenModal}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Place Items
                    </button>
                </Can>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Total Warehouses</p>
                    <p className="text-2xl font-bold text-blue-600">{warehouses.length}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Storage Locations</p>
                    <p className="text-2xl font-bold text-green-600">{storageLocations.length}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Items in Storage</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {transactions.filter(tx => tx.location_id).length}
                    </p>
                </div>
            </div>

            {/* Quick Storage Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {warehouses.map((warehouse) => {
                    const locations = storageLocations.filter(
                        (loc) => loc.warehouse_id === warehouse.warehouse_id
                    );
                    return (
                        <div key={warehouse.warehouse_id} className="bg-white rounded-lg border p-5">
                            <div className="flex items-center gap-3">
                                <Warehouse className="h-5 w-5 text-blue-600" />
                                <div>
                                    <h3 className="font-semibold">{warehouse.warehouse_name}</h3>
                                    <p className="text-sm text-gray-500">{warehouse.location || "No location specified"}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-sm">
                                <span className="text-gray-600">
                                    <MapPin className="inline h-4 w-4 mr-1" />
                                    {locations.length} locations
                                </span>
                                <span className="text-gray-600">
                                    <Package className="inline h-4 w-4 mr-1" />
                                    Capacity: {warehouse.capacity || 0}
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                                {locations.slice(0, 5).map((loc) => (
                                    <span
                                        key={loc.location_id}
                                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                    >
                                        {loc.location_code}
                                    </span>
                                ))}
                                {locations.length > 5 && (
                                    <span className="text-xs text-gray-400">+{locations.length - 5} more</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Storage Locations Table */}
            <div className="overflow-x-auto rounded-lg border bg-white">
                <div className="p-4 border-b flex items-center gap-4">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search storage locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 outline-none text-sm"
                    />
                </div>
                <table className="min-w-full text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Location Code</th>
                            <th className="px-4 py-3 text-left font-medium">Location Name</th>
                            <th className="px-4 py-3 text-left font-medium">Warehouse</th>
                            <th className="px-4 py-3 text-left font-medium">Zone / Aisle / Shelf</th>
                            <th className="px-4 py-3 text-left font-medium">Capacity</th>
                            <th className="px-4 py-3 text-left font-medium">Items Stored</th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {storageLocations
                            .filter((loc) =>
                                loc.location_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                loc.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((location) => {
                                const itemCount = transactions.filter(
                                    tx => tx.location_id === location.location_id
                                ).length;
                                return (
                                    <tr key={location.location_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{location.location_code}</td>
                                        <td className="px-4 py-3">{location.location_name || "—"}</td>
                                        <td className="px-4 py-3">{getWarehouseName(location.warehouse_id)}</td>
                                        <td className="px-4 py-3">
                                            {[location.zone, location.aisle, location.shelf]
                                                .filter(Boolean)
                                                .join(" / ") || "—"}
                                        </td>
                                        <td className="px-4 py-3">{location.capacity || 0}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                {itemCount} items
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {/* Eye icon is read-only — no gate */}
                                            <button
                                                onClick={() => handleViewLocationItems(location)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View Stored Items"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
                {storageLocations.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No storage locations found.
                    </div>
                )}
            </div>

            {/* Place Items Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => e.target === e.currentTarget && handleCloseModal()}
                >
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold">Place Items into Storage</h2>
                                <p className="text-sm text-gray-500">Move items to a storage location</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                disabled={submitting}
                                className="text-xl text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {error && (
                                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700">
                                    {success}
                                </div>
                            )}

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
                                    Storage Location *
                                </label>
                                <select
                                    name="location_id"
                                    value={form.location_id}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                    disabled={!form.warehouse_id}
                                >
                                    <option value="">
                                        {!form.warehouse_id
                                            ? "Select warehouse first"
                                            : filteredLocations.length === 0
                                            ? "No locations available"
                                            : "Select location"}
                                    </option>
                                    {filteredLocations.map((loc) => (
                                        <option key={loc.location_id} value={loc.location_id}>
                                            {loc.location_code} - {loc.location_name || "No name"}
                                        </option>
                                    ))}
                                </select>
                                {form.warehouse_id && filteredLocations.length === 0 && (
                                    <p className="mt-1 text-xs text-red-500">
                                        No storage locations found for this warehouse.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Item *
                                </label>
                                <select
                                    name="item_id"
                                    value={form.item_id}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select item</option>
                                    {items.map((item) => (
                                        <option key={item.item_id} value={item.item_id}>
                                            {item.item_name} ({item.barcode || "No barcode"}) - Stock: {item.current_stock || 0}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ArrowRight className="h-4 w-4" />
                                    )}
                                    {submitting ? "Placing..." : "Place Items"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Location Items Modal */}
            {showLocationItemsModal && selectedLocation && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => e.target === e.currentTarget && setShowLocationItemsModal(false)}
                >
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {selectedLocation.location_code} - {selectedLocation.location_name || "Storage Location"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Items stored in this location
                                </p>
                            </div>
                            <button
                                onClick={() => setShowLocationItemsModal(false)}
                                className="text-xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {loadingLocationItems ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                            ) : locationItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No items stored in this location.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">Item Name</th>
                                                <th className="px-4 py-3 text-left font-medium">Barcode</th>
                                                <th className="px-4 py-3 text-left font-medium">Unit</th>
                                                <th className="px-4 py-3 text-right font-medium">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {locationItems.map((item) => (
                                                <tr key={item.item_id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium">{item.item_name}</td>
                                                    <td className="px-4 py-3">{item.barcode}</td>
                                                    <td className="px-4 py-3">{item.unit}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">
                                                        {item.quantity}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t bg-gray-50">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-right font-medium">
                                                    Total Items
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold">
                                                    {locationItems.length}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t px-6 py-4 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowLocationItemsModal(false)}
                                className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WarehouseStoragePage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.WAREHOUSING_VIEW}>
            <WarehouseStorageContent />
        </PermissionGuard>
    );
}