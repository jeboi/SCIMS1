"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/utils/permissions";

function PurchaseOrderCreationContent() {
    const router = useRouter();

    // Data state
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [selectedRequestId, setSelectedRequestId] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
    const [poItems, setPoItems] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError("");

            const [requestsRes, suppliersRes, itemsRes] = await Promise.all([
                axiosInstance.get("/purchase-requests"),
                axiosInstance.get("/suppliers"),
                axiosInstance.get("/items"),
            ]);

            // Only show pending/approved requests that don't have a PO yet
            const requests = requestsRes.data?.data || [];
            const filteredRequests = requests.filter(
                (req) => req.status === "pending" || req.status === "approved"
            );

            setPurchaseRequests(filteredRequests);
            setSuppliers(suppliersRes.data?.data || []);
            setItems(itemsRes.data?.data || []);

            // Set default supplier if available
            if (suppliersRes.data?.data?.length > 0) {
                setSelectedSupplierId(String(suppliersRes.data.data[0].supplier_id));
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load data.");
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    // Handle request selection
    const handleRequestSelect = (requestId) => {
        setSelectedRequestId(requestId);
        if (requestId) {
            const request = purchaseRequests.find(
                (req) => String(req.request_id) === String(requestId)
            );
            setSelectedRequest(request);
            if (request && request.details) {
                // Map request details to PO items
                const items = request.details.map((detail) => ({
                    item_id: detail.item_id,
                    item_name: detail.item?.item_name || "Unknown Item",
                    unit: detail.item?.unit || "",
                    quantity: detail.quantity,
                    unit_cost: 0,
                }));
                setPoItems(items);
            } else {
                setPoItems([]);
            }
        } else {
            setSelectedRequest(null);
            setPoItems([]);
        }
    };

    // Handle supplier change
    const handleSupplierChange = (e) => {
        setSelectedSupplierId(e.target.value);
    };

    // Handle item quantity change
    const handleQuantityChange = (index, value) => {
        const updated = [...poItems];
        updated[index].quantity = parseInt(value) || 0;
        setPoItems(updated);
    };

    // Handle unit cost change
    const handleUnitCostChange = (index, value) => {
        const updated = [...poItems];
        updated[index].unit_cost = parseFloat(value) || 0;
        setPoItems(updated);
    };

    // Remove item from PO
    const handleRemoveItem = (index) => {
        const updated = [...poItems];
        updated.splice(index, 1);
        setPoItems(updated);
    };

    // Add manual item
    const handleAddManualItem = () => {
        const availableItems = items.filter(
            (item) => !poItems.some((poItem) => poItem.item_id === item.item_id)
        );
        if (availableItems.length === 0) {
            toast.error("All items already added.");
            return;
        }
        const firstAvailable = availableItems[0];
        setPoItems([
            ...poItems,
            {
                item_id: firstAvailable.item_id,
                item_name: firstAvailable.item_name,
                unit: firstAvailable.unit,
                quantity: 1,
                unit_cost: 0,
            },
        ]);
    };

    // Submit PO
const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate
    if (!selectedRequestId) {
        setError("Please select a purchase request.");
        toast.error("Please select a purchase request.");
        return;
    }

    if (!selectedSupplierId) {
        setError("Please select a supplier.");
        toast.error("Please select a supplier.");
        return;
    }

    if (!poDate) {
        setError("Please select a PO date.");
        toast.error("Please select a PO date.");
        return;
    }

    if (poItems.length === 0) {
        setError("Please add at least one item.");
        toast.error("Please add at least one item.");
        return;
    }

    const hasItems = poItems.some((item) => item.quantity > 0);
    if (!hasItems) {
        setError("Please enter quantity for at least one item.");
        toast.error("Please enter quantity for at least one item.");
        return;
    }

    try {
        setSubmitting(true);

        // Generate PO number
        const poNumber = `PO-${Date.now()}`;

        // 1. Create Purchase Order (header)
        const poPayload = {
            supplier_id: Number(selectedSupplierId),
            request_id: Number(selectedRequestId),
            po_number: poNumber,
            po_date: poDate,
            status: "pending",
            expected_delivery: null,
        };

        const poResponse = await axiosInstance.post("/purchase-orders", poPayload);
        const po = poResponse.data?.data;
        const poId = po.po_id;

        // 2. Create Purchase Order Details
        const detailPromises = poItems
    .filter((item) => item.quantity > 0)
    .map((item) => {
        return axiosInstance.post("/purchase-order-details", {
            po_id: poId,
            item_id: Number(item.item_id),
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_cost) || 0,  // Changed from unit_cost to unit_price
        });
    });

        await Promise.all(detailPromises);

        toast.success("Purchase Order created successfully!");
        setSuccess("Purchase Order created successfully!");

        // Reset form
        setSelectedRequestId("");
        setSelectedRequest(null);
        setPoItems([]);
        setRemarks("");
        setPoDate(new Date().toISOString().slice(0, 10));

        // Refresh requests
        const requestsRes = await axiosInstance.get("/purchase-requests");
        const requests = requestsRes.data?.data || [];
        const filteredRequests = requests.filter(
            (req) => req.status === "pending" || req.status === "approved"
        );
        setPurchaseRequests(filteredRequests);

        // Redirect to PO list after 2 seconds
        setTimeout(() => {
            router.push("/purchase-orders/tracking");
        }, 2000);
    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Failed to create purchase order.";
        setError(msg);
        toast.error(msg);
    } finally {
        setSubmitting(false);
    }
};

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Create Purchase Order</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Convert a purchase request into a purchase order.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => router.push("/purchase-orders/tracking")}
                    className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                    View All POs
                </button>
            </div>

            {/* Error / Success */}
            {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Select Purchase Request */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Purchase Request *
                        </label>
                        <select
                            value={selectedRequestId}
                            onChange={(e) => handleRequestSelect(e.target.value)}
                            className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                            required
                        >
                            <option value="">Select a purchase request</option>
                            {purchaseRequests.map((req) => (
                                <option key={req.request_id} value={req.request_id}>
                                    PR #{req.request_id} - {req.request_date} ({req.details?.length || 0} items)
                                </option>
                            ))}
                        </select>
                        {selectedRequest && (
                            <p className="mt-1 text-xs text-gray-500">
                                {selectedRequest.details?.length || 0} items from this request
                            </p>
                        )}
                    </div>

                    {/* Select Supplier */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Supplier *
                        </label>
                        <select
                            value={selectedSupplierId}
                            onChange={handleSupplierChange}
                            className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                            required
                        >
                            <option value="">Select a supplier</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                    {supplier.supplier_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* PO Date */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            PO Date *
                        </label>
                        <input
                            type="date"
                            value={poDate}
                            onChange={(e) => setPoDate(e.target.value)}
                            className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                            required
                        />
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Remarks
                        </label>
                        <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter remarks..."
                            className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                        />
                    </div>
                </div>

                {/* Items Section */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-semibold">PO Items</h3>
                            <p className="text-xs text-gray-500">Items to be ordered</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddManualItem}
                            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                        >
                            + Add Item
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-lg border">
                        {poItems.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500">
                                No items added yet. Select a purchase request or add items manually.
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Item</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Unit</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Quantity</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Unit Cost</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {poItems.map((item, index) => (
                                        <tr key={index} className="border-b last:border-b-0">
                                            <td className="px-4 py-3 text-sm font-medium">
                                                {item.item_name}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{item.unit || "—"}</td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                    className="w-20 rounded border px-2 py-1 text-sm text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_cost}
                                                    onChange={(e) => handleUnitCostChange(index, e.target.value)}
                                                    className="w-28 rounded border px-2 py-1 text-sm text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                ₱{(item.quantity * item.unit_cost).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t bg-gray-50">
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-right text-sm font-medium">
                                            Grand Total
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold">
                                            ₱{poItems.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0).toFixed(2)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-6 flex justify-end gap-3 border-t pt-6">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedRequestId("");
                            setSelectedRequest(null);
                            setPoItems([]);
                            setRemarks("");
                            setError("");
                            setSuccess("");
                        }}
                        className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || poItems.length === 0}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Creating..." : "Create Purchase Order"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function PurchaseOrderCreationPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.PURCHASE_ORDERS_CREATE}>
            <PurchaseOrderCreationContent />
        </PermissionGuard>
    );
}