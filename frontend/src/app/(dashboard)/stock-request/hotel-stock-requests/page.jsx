"use client";

import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/utils/permissions";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import Link from "next/link";

function HotelStockRequestsContent() {
    const [stockRequests, setStockRequests] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [items, setItems] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [departmentId, setDepartmentId] = useState("");
    const [requestDate, setRequestDate] = useState("");
    const [selectedItemId, setSelectedItemId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);

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

            const [requestsResponse, departmentsResponse, itemsResponse] =
                await Promise.all([
                    axiosInstance.get("/hotel-stock-requests"),
                    axiosInstance.get("/hotel-departments"),
                    axiosInstance.get("/items"),
                ]);

            setStockRequests(requestsResponse.data.data || []);
            setDepartments(departmentsResponse.data.data || []);
            setItems(itemsResponse.data.data || []);

            try {
                const userResponse = await axiosInstance.get("/user");

                const user =
                    userResponse.data?.data || userResponse.data?.user;

                setCurrentUser(user || null);
            } catch (userError) {
                console.error("Failed to fetch current user:", userError);
            }

            const departmentList = departmentsResponse.data.data || [];

            if (departmentList.length > 0) {
                setDepartmentId(
                    String(departmentList[0].department_id)
                );
            }

            const today = new Date();
            const localDate = today.toLocaleDateString("en-CA");

            setRequestDate(localDate);

            const itemList = itemsResponse.data.data || [];

            if (itemList.length > 0) {
                setSelectedItemId(String(itemList[0].item_id));
            }
        } catch (error) {
            console.error("Failed to load hotel stock request data:", error);

            setError(
                "Unable to load hotel stock request data. Please check the API connection."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchStockRequests = async () => {
        try {
            const response = await axiosInstance.get(
                "/hotel-stock-requests"
            );

            setStockRequests(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch stock requests:", error);
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
            (item) => String(item.item_id) === String(selectedItemId)
        );

        if (!item) {
            setError("Selected item could not be found.");
            return;
        }

        const existingItemIndex = selectedItems.findIndex(
            (selectedItem) =>
                String(selectedItem.item_id) === String(item.item_id)
        );

        if (existingItemIndex !== -1) {
            const updatedItems = [...selectedItems];

            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity:
                    Number(updatedItems[existingItemIndex].quantity) +
                    Number(quantity),
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
                (item) => String(item.item_id) !== String(itemId)
            )
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!departmentId) {
            setError("Please select a department.");
            return;
        }

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
                department_id: Number(departmentId),
                requested_by: Number(currentUser.id),
                request_date: requestDate,
                status: "pending",
                details: selectedItems.map((item) => ({
                    item_id: Number(item.item_id),
                    quantity: Number(item.quantity),
                })),
            };

            console.log(
                "Submitting hotel stock request:",
                body
            );

            const response = await axiosInstance.post(
                "/hotel-stock-requests",
                body
            );

            console.log(
                "Create request response:",
                response.data
            );

            setSuccess(
                "Hotel stock request created successfully."
            );

            setSelectedItems([]);
            setQuantity(1);

            await fetchStockRequests();
        } catch (error) {
            console.error(
                "Failed to create hotel stock request:",
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
                    "Unable to create the hotel stock request. Please check the API connection."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    Hotel Stock Requests
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Submit and manage stock requests submitted by hotel
                    departments.
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div className="mb-6 rounded-lg border bg-white p-6 text-center">
                    Loading hotel stock request data...
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
                    {/* Create Request */}
                    <form
                        onSubmit={handleSubmit}
                        className="mb-6 rounded-lg border bg-white p-6"
                    >
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold">
                                Create Hotel Stock Request
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Submit a stock request for a hotel department.
                            </p>
                        </div>

                        {/* Department + Date */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Department
                                </label>

                                <select
                                    value={departmentId}
                                    onChange={(event) =>
                                        setDepartmentId(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                >
                                    <option value="">
                                        Select department
                                    </option>

                                    {departments.map(
                                        (department) => (
                                            <option
                                                key={
                                                    department.department_id
                                                }
                                                value={
                                                    department.department_id
                                                }
                                            >
                                                {
                                                    department.department_name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

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
                                Selected Items
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

                        {/* Buttons */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedItems([]);
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

                    {/* Requests Table */}
                    <div className="overflow-hidden rounded-lg border bg-white">
                        <table className="w-full">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Request ID
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Department
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

                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {stockRequests.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-4 py-8 text-center text-sm text-gray-500"
                                        >
                                            No hotel stock requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    stockRequests.map(
                                        (request) => (
                                            <tr
                                                key={
                                                    request.stock_request_id
                                                }
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="px-4 py-4 text-sm">
                                                    #
                                                    {
                                                        request.stock_request_id
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {request
                                                        .department
                                                        ?.department_name ||
                                                        "—"}
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {request
                                                        .requested_by
                                                        ?.name ||
                                                        "—"}
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {request.request_date
                                                        ? new Date(
                                                              request.request_date
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {request
                                                        .details
                                                        ?.length ||
                                                        0}{" "}
                                                    item
                                                    {request
                                                        .details
                                                        ?.length ===
                                                    1
                                                        ? ""
                                                        : "s"}
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {request.status}
                                                </td>

                                                <td className="px-4 py-4 text-right">
                                                    <Link
                                                        href={`/procurement/hotel-stock-requests/${request.stock_request_id}`}
                                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                                    >
                                                        View
                                                    </Link>
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

        </div>
    );
}

export default function Page() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.INVENTORY_VIEW}>
            <HotelStockRequestsContent />
        </PermissionGuard>
    );
}