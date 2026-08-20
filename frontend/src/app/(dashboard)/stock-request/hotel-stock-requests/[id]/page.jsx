"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/axios";

export default function Page() {
    const params = useParams();
    const requestId = params?.id;

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (requestId) {
            fetchRequest();
        }
    }, [requestId]);

    const fetchRequest = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                `/hotel-stock-requests/${requestId}`
            );

            setRequest(response.data.data);
        } catch (error) {
            console.error(
                "Failed to fetch hotel stock request:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to load the hotel stock request."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="rounded-lg border bg-white p-6 text-center">
                    Loading hotel stock request...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>

                <Link
                    href="/procurement/hotel-stock-requests"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    ← Back to Hotel Stock Requests
                </Link>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="p-6">
                <div className="mb-4 rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
                    Hotel stock request not found.
                </div>

                <Link
                    href="/procurement/hotel-stock-requests"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    ← Back to Hotel Stock Requests
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/procurement/hotel-stock-requests"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    ← Back to Hotel Stock Requests
                </Link>

                <div className="mt-4">
                    <h1 className="text-2xl font-semibold">
                        Hotel Stock Request #{request.stock_request_id}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View the complete details of this stock request.
                    </p>
                </div>
            </div>

            {/* Request Information */}
            <div className="mb-6 rounded-lg border bg-white p-6">
                <h2 className="mb-6 text-lg font-semibold">
                    Request Information
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Request ID */}
                    <div>
                        <p className="text-xs font-medium uppercase text-gray-500">
                            Request ID
                        </p>

                        <p className="mt-1 text-sm font-medium">
                            #{request.stock_request_id}
                        </p>
                    </div>

                    {/* Department */}
                    <div>
                        <p className="text-xs font-medium uppercase text-gray-500">
                            Department
                        </p>

                        <p className="mt-1 text-sm font-medium">
                            {request.department?.department_name || "—"}
                        </p>
                    </div>

                    {/* Requested By */}
                    <div>
                        <p className="text-xs font-medium uppercase text-gray-500">
                            Requested By
                        </p>

                        <p className="mt-1 text-sm font-medium">
                            {request.requested_by?.name || "—"}
                        </p>
                    </div>

                    {/* Request Date */}
                    <div>
                        <p className="text-xs font-medium uppercase text-gray-500">
                            Request Date
                        </p>

                        <p className="mt-1 text-sm font-medium">
                            {request.request_date
                                ? new Date(
                                      request.request_date
                                  ).toLocaleDateString()
                                : "—"}
                        </p>
                    </div>

                    {/* Status */}
                    <div>
                        <p className="text-xs font-medium uppercase text-gray-500">
                            Status
                        </p>

                        <span className="mt-1 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium capitalize text-yellow-700">
                            {request.status || "—"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Requested Items */}
            <div className="rounded-lg border bg-white">
                <div className="border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">
                        Requested Items
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Items included in this hotel stock request.
                    </p>
                </div>

                {request.details?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Item
                                    </th>

                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Barcode
                                    </th>

                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Unit
                                    </th>

                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Quantity
                                    </th>

                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Current Stock
                                    </th>

                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {request.details.map((detail) => (
                                    <tr
                                        key={
                                            detail.stock_request_detail_id
                                        }
                                        className="border-b last:border-b-0"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {detail.item?.item_name || "—"}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {detail.item?.barcode || "—"}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {detail.item?.unit || "—"}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {detail.quantity ?? "—"}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {detail.item?.current_stock ??
                                                "—"}
                                        </td>

                                        <td className="px-6 py-4 text-sm capitalize">
                                            {detail.item?.status || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-gray-500">
                        No items found for this request.
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
                <Link
                    href="/procurement/hotel-stock-requests"
                    className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                >
                    Back to Requests
                </Link>
            </div>
        </div>
    );
}