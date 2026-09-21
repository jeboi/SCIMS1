"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

function PurchaseRequestsContent() {
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [items, setItems] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [requestDate, setRequestDate] = useState("");
    const [remarks, setRemarks] = useState("");
    const [selectedItemId, setSelectedItemId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError("");

            const [requestsResponse, itemsResponse, userResponse] =
                await Promise.all([
                    axiosInstance.get("/purchase-requests"),
                    axiosInstance.get("/items"),
                    axiosInstance.get("/user"),
                ]);

            setPurchaseRequests(requestsResponse.data.data || []);
            setItems(itemsResponse.data.data || []);

            const user =
                userResponse.data?.data || userResponse.data?.user;

            setCurrentUser(user || null);

            const today = new Date();
            setRequestDate(today.toLocaleDateString("en-CA"));

            const itemList = itemsResponse.data.data || [];

            if (itemList.length > 0) {
                setSelectedItemId(String(itemList[0].item_id));
            }
        } catch (error) {
            console.error(
                "Failed to load purchase request data:",
                error
            );

            setError(
                "Unable to load purchase request data. Please check the API connection."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchaseRequests = async () => {
        try {
            const response = await axiosInstance.get(
                "/purchase-requests"
            );

            setPurchaseRequests(response.data.data || []);
        } catch (error) {
            console.error(
                "Failed to fetch purchase requests:",
                error
            );
        }
    };

    const handleAddItem = () => {
        setError("");
        setSuccess("");

        if (!selectedItemId) {
            setError("Please select an item.");
            return;
        }

        if (!quantity || Number(quantity) <= 0) {
            setError("Quantity must be greater than zero.");
            return;
        }

        const item = items.find(
            (item) =>
                String(item.item_id) === String(selectedItemId)
        );

        if (!item) {
            setError("Selected item could not be found.");
            return;
        }

        const existingItemIndex = selectedItems.findIndex(
            (selectedItem) =>
                String(selectedItem.item_id) ===
                String(item.item_id)
        );

        if (existingItemIndex !== -1) {
            const updatedItems = [...selectedItems];

            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity:
                    Number(
                        updatedItems[existingItemIndex].quantity
                    ) + Number(quantity),
            };

            setSelectedItems(updatedItems);
        } else {
            setSelectedItems([
                ...selectedItems,
                {
                    item_id: item.item_id,
                    item_name: item.item_name,
                    unit: item.unit,
                    quantity: Number(quantity),
                },
            ]);
        }

        setQuantity(1);
    };

    const handleRemoveItem = (itemId) => {
        setSelectedItems((currentItems) =>
            currentItems.filter(
                (item) =>
                    String(item.item_id) !== String(itemId)
            )
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!requestDate) {
            setError("Please select a request date.");
            return;
        }

        if (selectedItems.length === 0) {
            setError("Please add at least one item.");
            return;
        }

        if (!currentUser?.id) {
            setError(
                "Unable to identify the current user. Please make sure you are logged in."
            );
            return;
        }

        try {
            setSubmitting(true);

            const body = {
                requested_by: Number(currentUser.id),
                request_date: requestDate,
                status: "pending",
                remarks: remarks.trim() || null,
                details: selectedItems.map((item) => ({
                    item_id: Number(item.item_id),
                    quantity: Number(item.quantity),
                })),
            };

            console.log(
                "Submitting purchase request:",
                body
            );

            const response = await axiosInstance.post(
                "/purchase-requests",
                body
            );

            console.log(
                "Purchase request response:",
                response.data
            );

            setSuccess(
                "Purchase request created successfully."
            );

            setSelectedItems([]);
            setQuantity(1);
            setRemarks("");

            await fetchPurchaseRequests();
        } catch (error) {
            console.error(
                "Failed to create purchase request:",
                error
            );

            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.response?.data?.errors) {
                const validationErrors =
                    error.response.data.errors;

                const messages = Object.values(validationErrors)
                    .flat()
                    .join(" ");

                setError(messages);
            } else {
                setError(
                    "Unable to create the purchase request. Please check the API connection."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewRequest = async (requestId) => {
        try {
            setLoadingDetails(true);
            setError("");

            const response = await axiosInstance.get(
                `/purchase-requests/${requestId}`
            );

            setSelectedRequest(response.data.data);
        } catch (error) {
            console.error(
                "Failed to fetch purchase request details:",
                error
            );

            setError(
                "Unable to load the selected purchase request."
            );
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseDetails = () => {
        setSelectedRequest(null);
    };

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    Purchase Request Management
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Create and manage purchase requests for required
                    inventory items.
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div className="mb-6 rounded-lg border bg-white p-6 text-center">
                    Loading purchase request data...
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            {!loading && (
                <>
                    {/* RBAC: only procurement.create can see the create form */}
                    <Can permission={PERMISSIONS.PROCUREMENT_CREATE}>
                        <form
                            onSubmit={handleSubmit}
                            className="mb-6 rounded-lg border bg-white p-6"
                        >
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold">
                                    Create Purchase Request
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Submit a request for items that need to
                                    be purchased.
                                </p>
                            </div>

                            {/* Request Date */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Request Date
                                    </label>

                                    <input
                                        type="date"
                                        value={requestDate}
                                        onChange={(event) =>
                                            setRequestDate(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Requested By
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            currentUser?.name || "Loading..."
                                        }
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm outline-none"
                                    />
                                </div>
                            </div>

                            {/* Add Items */}
                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium">
                                    Add Items
                                </label>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_130px_auto]">
                                    <select
                                        value={selectedItemId}
                                        onChange={(event) =>
                                            setSelectedItemId(
                                                event.target.value
                                            )
                                        }
                                        className="rounded-lg border px-4 py-3 text-sm outline-none"
                                    >
                                        <option value="">
                                            Select item
                                        </option>

                                        {items.map((item) => (
                                            <option
                                                key={item.item_id}
                                                value={item.item_id}
                                            >
                                                {item.item_name} (
                                                {item.unit})
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(event) =>
                                            setQuantity(
                                                event.target.value
                                            )
                                        }
                                        className="rounded-lg border px-4 py-3 text-sm outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                                    >
                                        Add Item
                                    </button>
                                </div>
                            </div>

                            {/* Selected Items */}
                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium">
                                    Requested Items
                                </label>

                                <div className="overflow-hidden rounded-lg border">
                                    {selectedItems.length === 0 ? (
                                        <div className="p-8 text-center text-sm text-gray-500">
                                            No items added yet.
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead className="border-b bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                                        Item
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                                        Unit
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                                        Quantity
                                                    </th>

                                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {selectedItems.map(
                                                    (item) => (
                                                        <tr
                                                            key={
                                                                item.item_id
                                                            }
                                                            className="border-b last:border-b-0"
                                                        >
                                                            <td className="px-4 py-3 text-sm">
                                                                {
                                                                    item.item_name
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3 text-sm">
                                                                {
                                                                    item.unit
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3 text-sm">
                                                                {
                                                                    item.quantity
                                                                }
                                                            </td>

                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveItem(
                                                                            item.item_id
                                                                        )
                                                                    }
                                                                    className="text-sm font-medium text-red-600 hover:text-red-700"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium">
                                    Remarks
                                </label>

                                <textarea
                                    value={remarks}
                                    onChange={(event) =>
                                        setRemarks(event.target.value)
                                    }
                                    rows={4}
                                    placeholder="Enter additional remarks..."
                                    className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedItems([]);
                                        setQuantity(1);
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
                                    disabled={submitting}
                                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </Can>

                    {/* Purchase Requests Table */}
                    <div className="overflow-hidden rounded-lg border bg-white">
                        <table className="w-full">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Request ID
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Requested By
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Request Date
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Items
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Remarks
                                    </th>

                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {purchaseRequests.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-4 py-8 text-center text-sm text-gray-500"
                                        >
                                            No purchase requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    purchaseRequests.map(
                                        (request) => (
                                            <tr
                                                key={
                                                    request.request_id
                                                }
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="px-4 py-4 text-sm">
                                                    #
                                                    {
                                                        request.request_id
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {request.requestedBy?.name || request.requested_by?.name || "—"}
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {request.request_date
                                                        ? new Date(
                                                              request.request_date
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {request.details
                                                        ?.length ||
                                                        0}{" "}
                                                    item
                                                    {request.details
                                                        ?.length ===
                                                    1
                                                        ? ""
                                                        : "s"}
                                                </td>

                                                <td className="px-4 py-4 text-sm capitalize">
                                                    {request.status ||
                                                        "—"}
                                                </td>

                                                <td className="max-w-xs truncate px-4 py-4 text-sm">
                                                    {request.remarks ||
                                                        "—"}
                                                </td>

                                                <td className="px-4 py-4 text-right">
                                                    {/* View is read-only */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewRequest(
                                                                request.request_id
                                                            )
                                                        }
                                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* View Details Modal */}
            {selectedRequest && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={handleCloseDetails}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Purchase Request #{selectedRequest.request_id}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">Request details</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseDetails}
                                className="text-2xl leading-none text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="p-8 text-center text-sm text-gray-500">
                                Loading request details...
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-500">Requested By</p>
                                        <p className="mt-1 text-sm font-medium">
                                            {selectedRequest.requestedBy?.name || selectedRequest.requested_by?.name || "—"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-500">Request Date</p>
                                        <p className="mt-1 text-sm font-medium">
                                            {selectedRequest.request_date
                                                ? new Date(selectedRequest.request_date).toLocaleDateString()
                                                : "—"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                                        <p className="mt-1 text-sm font-medium capitalize">
                                            {selectedRequest.status || "—"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-500">Remarks</p>
                                        <p className="mt-1 text-sm font-medium">
                                            {selectedRequest.remarks || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="mb-3 text-sm font-semibold">Requested Items</h3>
                                    <div className="overflow-hidden rounded-lg border">
                                        {selectedRequest.details?.length ? (
                                            <table className="w-full">
                                                <thead className="border-b bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Item</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Unit</th>
                                                        <th className="px-4 py-3 text-right text-sm font-medium">Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedRequest.details.map((detail) => (
                                                        <tr key={detail.pr_detail_id} className="border-b last:border-b-0">
                                                            <td className="px-4 py-3 text-sm">
                                                                {detail.item?.item_name || "—"}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                {detail.item?.unit || "—"}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-sm">
                                                                {detail.quantity}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="p-6 text-center text-sm text-gray-500">
                                                No items found for this request.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="mb-3 text-sm font-semibold">Purchase Orders</h3>
                                    {selectedRequest.purchase_orders?.length ? (
                                        <div className="overflow-hidden rounded-lg border">
                                            <table className="w-full">
                                                <thead className="border-b bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">PO ID</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Supplier</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedRequest.purchase_orders.map((order) => (
                                                        <tr key={order.po_id || order.purchase_order_id} className="border-b last:border-b-0">
                                                            <td className="px-4 py-3 text-sm">
                                                                #{order.po_id || order.purchase_order_id || "—"}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                {order.supplier?.supplier_name || order.supplier?.name || "—"}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm capitalize">
                                                                {order.status || "—"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border p-6 text-center text-sm text-gray-500">
                                            No purchase orders linked to this request.
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCloseDetails}
                                        className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PurchaseRequestsPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.PROCUREMENT_VIEW}>
            <PurchaseRequestsContent />
        </PermissionGuard>
    );
}