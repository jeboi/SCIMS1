"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axios";
import { getPurchaseOrders } from "@/services/api";

const initialForm = {
    po_id: "",
    warehouse_id: "",
    received_by: "",
    received_date: new Date().toISOString().slice(0, 10),
    remarks: "",
};

export default function GoodsReceivingPage() {
    const { user } = useAuth();
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [items, setItems] = useState([]);
    const [receivingRecords, setReceivingRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [selectedPO, setSelectedPO] = useState(null);
    const [poItems, setPoItems] = useState([]);
    const [error, setError] = useState("");
    const [manualItems, setManualItems] = useState([]);
    const [showItemSelector, setShowItemSelector] = useState(false);
    const [selectedItemForManual, setSelectedItemForManual] = useState(null);
    const [manualQuantity, setManualQuantity] = useState(1);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            
            // Fetch warehouses, pending POs, items, and receiving records
            const [warehousesRes, posRes, itemsRes, receivingRes] = await Promise.all([
                axiosInstance.get("/warehouses"),
                axiosInstance.get("/purchase-orders"),
                axiosInstance.get("/items"),
                axiosInstance.get("/receiving-records"),
            ]);

            setWarehouses(warehousesRes.data?.data || []);
            
            // Filter POs with status 'approved' or 'pending' (not yet fully received)
            const allPOs = posRes.data?.data || [];
            // You can filter to only show POs that haven't been fully received
            // For now, show all POs
            setPurchaseOrders(allPOs);
            
            setItems(itemsRes.data?.data || []);
            setReceivingRecords(receivingRes.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load data.");
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

    const handlePOChange = (e) => {
        const poId = e.target.value;
        setForm((prev) => ({ ...prev, po_id: poId }));
        
        if (poId) {
            const po = purchaseOrders.find(p => p.po_id === parseInt(poId));
            setSelectedPO(po);
            if (po && po.items) {
                setPoItems(po.items.map(item => ({
                    ...item,
                    quantity_received: item.quantity || 0,
                })));
            } else {
                setPoItems([]);
            }
        } else {
            setSelectedPO(null);
            setPoItems([]);
        }
    };

    const handleItemQuantityChange = (index, value) => {
        const updated = [...poItems];
        updated[index].quantity_received = parseInt(value) || 0;
        setPoItems(updated);
    };

    const handleAddManualItem = () => {
    if (!selectedItemForManual) {
        toast.error("Please select an item.");
        return;
    }
    if (manualQuantity <= 0) {
        toast.error("Quantity must be greater than 0.");
        return;
    }

    const existing = poItems.find(item => item.item_id === selectedItemForManual.item_id);
    if (existing) {
        toast.error("Item already added. Edit the quantity in the table.");
        return;
    }

    setPoItems([
        ...poItems,
        {
            item_id: selectedItemForManual.item_id,
            item_name: selectedItemForManual.item_name,
            quantity: 0, // Not from PO
            quantity_received: manualQuantity,
            is_manual: true,
        },
    ]);

    setSelectedItemForManual(null);
    setManualQuantity(1);
    setShowItemSelector(false);
    toast.success("Item added.");
};

const handleRemoveItem = (index) => {
    const updated = [...poItems];
    updated.splice(index, 1);
    setPoItems(updated);
};

    const handleOpenModal = () => {
        setForm({
            ...initialForm,
            received_by: user?.name || user?.email || "",
            received_date: new Date().toISOString().slice(0, 10),
        });
        setSelectedPO(null);
        setPoItems([]);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (saving) return;
        setShowModal(false);
        setForm(initialForm);
        setSelectedPO(null);
        setPoItems([]);
    };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.warehouse_id) {
        toast.error("Please select a warehouse.");
        return;
    }

    if (!form.received_by.trim()) {
        toast.error("Received by is required.");
        return;
    }

    if (!form.received_date) {
        toast.error("Received date is required.");
        return;
    }

    if (poItems.length === 0) {
        toast.error("Please add at least one item.");
        return;
    }

    const hasItems = poItems.some(item => item.quantity_received > 0);
    if (!hasItems) {
        toast.error("Please enter quantity for at least one item.");
        return;
    }

    try {
        setSaving(true);

        // 1. Create Delivery
        const deliveryPayload = {
            po_id: form.po_id || null,
            tracking_number: `DEL-${Date.now()}`,
            vehicle: "N/A",
            delivery_date: form.received_date,
            status: "delivered",
        };

        const deliveryRes = await axiosInstance.post("/deliveries", deliveryPayload);
        const delivery = deliveryRes.data?.data;
        const deliveryId = delivery.delivery_id;

        // 2. Create Receiving Record (BEFORE delivery items)
        const receivingPayload = {
            delivery_id: deliveryId,
            warehouse_id: form.warehouse_id,
            received_by: form.received_by.trim(),
            received_date: form.received_date,
            remarks: form.remarks.trim() || null,
        };

        await axiosInstance.post("/receiving-records", receivingPayload);

        // 3. Create Delivery Items
        const deliveryItemsPromises = poItems
            .filter(item => item.quantity_received > 0)
            .map(item => {
                return axiosInstance.post("/delivery-items", {
                    delivery_id: deliveryId,
                    item_id: item.item_id,
                    quantity_received: item.quantity_received,
                });
            });

        await Promise.all(deliveryItemsPromises);

        // Note: Inventory transactions are handled automatically by the DeliveryItemController,
        // so we don't need to create them separately.

        toast.success("Goods received successfully!");
        setShowModal(false);
        setForm(initialForm);
        setSelectedPO(null);
        setPoItems([]);
        fetchData();
    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Failed to receive goods.";
        toast.error(msg);
    } finally {
        setSaving(false);
    }
};

    const getStatusBadge = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Goods Receiving</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Receive items into the warehouse.
                    </p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Receive Goods
                </button>
            </div>

            {/* Table */}
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">ID</th>
                                <th className="px-4 py-3 text-left font-medium">Delivery ID</th>
                                <th className="px-4 py-3 text-left font-medium">Warehouse</th>
                                <th className="px-4 py-3 text-left font-medium">Received By</th>
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                                <th className="px-4 py-3 text-left font-medium">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {receivingRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        No receiving records found.
                                    </td>
                                </tr>
                            ) : (
                                receivingRecords.map((record) => (
                                    <tr key={record.receiving_id}>
                                        <td className="px-4 py-3">{record.receiving_id}</td>
                                        <td className="px-4 py-3">{record.delivery_id}</td>
                                        <td className="px-4 py-3">
                                            {record.warehouse?.warehouse_name || "N/A"}
                                        </td>
                                        <td className="px-4 py-3">{record.received_by}</td>
                                        <td className="px-4 py-3">
                                            {new Date(record.received_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">{record.remarks || "—"}</td>
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
                    <div className="w-full max-w-3xl max-h-[90vh] rounded-xl bg-white shadow-xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                            <h2 className="text-lg font-semibold">Receive Goods</h2>
                            <button
                                onClick={handleCloseModal}
                                disabled={saving}
                                className="text-xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 hide-scrollbar">
                            {/* Purchase Order Selection */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Purchase Order (Optional)
                                </label>
                                <select
                                    name="po_id"
                                    value={form.po_id}
                                    onChange={handlePOChange}
                                    className="w-full rounded border px-3 py-2 text-sm"
                                >
                                    <option value="">Select PO (optional)</option>
                                    {purchaseOrders.map((po) => (
                                        <option key={po.po_id} value={po.po_id}>
                                            PO-{po.po_id} - {po.supplier?.supplier_name || "Unknown"}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-400">
                                    Select a purchase order to auto-fill items, or leave blank to enter manually.
                                </p>
                            </div>

{/* Items */}
<div>
    <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">
            Items Received
        </label>
        {!form.po_id && (
            <button
                type="button"
                onClick={() => setShowItemSelector(!showItemSelector)}
                className="text-xs text-blue-600 hover:text-blue-800"
            >
                + Add Item Manually
            </button>
        )}
    </div>

    {/* Manual Item Selector */}
    {showItemSelector && (
        <div className="mb-3 p-3 border rounded bg-gray-50 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[150px]">
                <label className="block text-xs text-gray-600">Select Item</label>
                <select
                    value={selectedItemForManual?.item_id || ""}
                    onChange={(e) => {
                        const item = items.find(i => i.item_id === parseInt(e.target.value));
                        setSelectedItemForManual(item);
                    }}
                    className="w-full rounded border px-3 py-1.5 text-sm"
                >
                    <option value="">Choose item...</option>
                    {items.map((item) => (
                        <option key={item.item_id} value={item.item_id}>
                            {item.item_name} (Stock: {item.current_stock || 0})
                        </option>
                    ))}
                </select>
            </div>
            <div className="w-24">
                <label className="block text-xs text-gray-600">Qty</label>
                <input
                    type="number"
                    min="1"
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(parseInt(e.target.value) || 1)}
                    className="w-full rounded border px-2 py-1.5 text-sm"
                />
            </div>
            <button
                type="button"
                onClick={handleAddManualItem}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
                Add
            </button>
            <button
                type="button"
                onClick={() => {
                    setShowItemSelector(false);
                    setSelectedItemForManual(null);
                    setManualQuantity(1);
                }}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
                Cancel
            </button>
        </div>
    )}

    {poItems.length === 0 ? (
        <div className="text-sm text-gray-400 border rounded p-4 text-center">
            {form.po_id ? "No items found for this PO." : "Select a PO to auto-fill items, or click 'Add Item Manually'."}
        </div>
    ) : (
        <div className="border rounded overflow-hidden">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium">Item</th>
                        {form.po_id && (
                            <th className="px-3 py-2 text-right text-xs font-medium">PO Qty</th>
                        )}
                        <th className="px-3 py-2 text-right text-xs font-medium">Received</th>
                        <th className="px-3 py-2 text-center text-xs font-medium">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {poItems.map((item, index) => (
                        <tr key={item.item_id || index}>
                            <td className="px-3 py-2 text-sm">
                                {item.item_name || "Unknown Item"}
                                {item.is_manual && (
                                    <span className="ml-2 text-xs text-gray-400">(Manual)</span>
                                )}
                            </td>
                            {form.po_id && (
                                <td className="px-3 py-2 text-right text-sm">
                                    {item.quantity || 0}
                                </td>
                            )}
                            <td className="px-3 py-2 text-right">
                                <input
                                    type="number"
                                    min="0"
                                    max={item.quantity || 9999}
                                    value={item.quantity_received}
                                    onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                                    className="w-20 rounded border px-2 py-1 text-sm text-right"
                                />
                            </td>
                            <td className="px-3 py-2 text-center">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )}
</div>

                            {/* Warehouse */}
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

                            {/* Received By */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Received By *
                                </label>
                                <input
                                    type="text"
                                    name="received_by"
                                    value={form.received_by}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Received Date *
                                </label>
                                <input
                                    type="date"
                                    name="received_date"
                                    value={form.received_date}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Remarks
                                </label>
                                <textarea
                                    name="remarks"
                                    value={form.remarks}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    placeholder="e.g. Partial delivery, damaged items, etc."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t pt-4">
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
                                    {saving ? "Processing..." : "Receive Goods"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}