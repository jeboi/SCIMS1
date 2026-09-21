"use client";

import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Package, Truck, CheckCircle, XCircle, Clock,
    Eye, RefreshCw, Loader2, Search, Filter,
    ArrowRight, Calendar, User, MapPin, Boxes
} from "lucide-react";

function DeliveryConfirmationContent() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axiosInstance.get("/deliveries");
            setDeliveries(response.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load deliveries.");
            toast.error("Failed to load deliveries.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDelivery = async (deliveryId) => {
        try {
            const response = await axiosInstance.get(`/deliveries/${deliveryId}`);
            setSelectedDelivery(response.data?.data);
            setShowModal(true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load delivery details.");
        }
    };

    const handleConfirmDelivery = async (deliveryId) => {
        if (!confirm("Confirm this delivery? This will update inventory.")) return;

        try {
            setConfirming(true);

            const deliveryRes = await axiosInstance.get(`/deliveries/${deliveryId}`);
            const delivery = deliveryRes.data?.data;

            if (!delivery) {
                toast.error("Delivery not found.");
                return;
            }

            if (!delivery.delivery_items || delivery.delivery_items.length === 0) {
                toast.error("No items in this delivery to confirm.");
                return;
            }

            const receivingPayload = {
                delivery_id: deliveryId,
                warehouse_id: 1,
                received_by: "System Administrator",
                received_date: new Date().toISOString().slice(0, 10),
                remarks: "Delivery confirmed",
            };

            await axiosInstance.post("/receiving-records", receivingPayload);

            await axiosInstance.put(`/deliveries/${deliveryId}`, {
                status: "delivered",
            });

            for (const item of delivery.delivery_items) {
                await axiosInstance.post("/inventory-transactions", {
                    item_id: item.item_id,
                    warehouse_id: 1,
                    transaction_type: "receiving",
                    quantity: item.quantity_received,
                    reference_no: `DEL-${deliveryId}`,
                    transaction_date: new Date().toISOString(),
                    performed_by: 1,
                });
            }

            toast.success("Delivery confirmed successfully! Inventory updated.");
            setShowModal(false);
            setSelectedDelivery(null);
            loadData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to confirm delivery.");
        } finally {
            setConfirming(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            in_transit: "bg-blue-100 text-blue-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="h-4 w-4 text-yellow-600" />,
            in_transit: <Truck className="h-4 w-4 text-blue-600" />,
            delivered: <CheckCircle className="h-4 w-4 text-green-600" />,
            cancelled: <XCircle className="h-4 w-4 text-red-600" />,
        };
        return icons[status] || <Clock className="h-4 w-4 text-gray-400" />;
    };

    const filteredDeliveries = deliveries
        .filter(d => {
            if (filterStatus === "all") return true;
            if (filterStatus === "pending") {
                return d.status === "pending" || d.status === "in_transit";
            }
            return d.status === filterStatus;
        })
        .filter(d => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                d.tracking_number?.toLowerCase().includes(search) ||
                d.purchase_order?.po_number?.toLowerCase().includes(search) ||
                d.purchase_order?.supplier?.supplier_name?.toLowerCase().includes(search)
            );
        })
        .sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date));

    const totalDeliveries = deliveries.length;
    const pendingDeliveries = deliveries.filter(d => d.status === "pending" || d.status === "in_transit").length;
    const deliveredDeliveries = deliveries.filter(d => d.status === "delivered").length;
    const inTransitDeliveries = deliveries.filter(d => d.status === "in_transit").length;

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
                    <h1 className="text-2xl font-semibold">Delivery Confirmation</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Confirm and receive deliveries to update inventory.
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Truck className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{totalDeliveries}</p>
                    <p className="text-xs text-gray-500">Total Deliveries</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{pendingDeliveries}</p>
                    <p className="text-xs text-gray-500">Pending / In Transit</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Truck className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{inTransitDeliveries}</p>
                    <p className="text-xs text-gray-500">In Transit</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{deliveredDeliveries}</p>
                    <p className="text-xs text-gray-500">Delivered</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by tracking # or supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending / In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <button
                    onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
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
                            <th className="px-4 py-3 text-left font-medium">Tracking #</th>
                            <th className="px-4 py-3 text-left font-medium">PO</th>
                            <th className="px-4 py-3 text-left font-medium">Supplier</th>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                            <th className="px-4 py-3 text-center font-medium">Items</th>
                            <th className="px-4 py-3 text-center font-medium">Status</th>
                            <th className="px-4 py-3 text-center font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredDeliveries.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                    No deliveries found.
                                </td>
                            </tr>
                        ) : (
                            filteredDeliveries.map((delivery) => (
                                <tr key={delivery.delivery_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{delivery.tracking_number || "—"}</td>
                                    <td className="px-4 py-3">{delivery.purchase_order?.po_number || delivery.po_id || "—"}</td>
                                    <td className="px-4 py-3">{delivery.purchase_order?.supplier?.supplier_name || "—"}</td>
                                    <td className="px-4 py-3">
                                        {delivery.delivery_date ? new Date(delivery.delivery_date).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {delivery.delivery_items?.length || 0}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="flex items-center justify-center gap-1">
                                            {getStatusIcon(delivery.status)}
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(delivery.status)}`}>
                                                {delivery.status?.replace("_", " ") || "—"}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* View — read-only */}
                                            <button
                                                onClick={() => handleViewDelivery(delivery.delivery_id)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>

                                            {/* RBAC: confirming delivery requires logistics.edit */}
                                            {(delivery.status === "pending" || delivery.status === "in_transit") && (
                                                <Can permission={PERMISSIONS.LOGISTICS_EDIT}>
                                                    <button
                                                        onClick={() => handleConfirmDelivery(delivery.delivery_id)}
                                                        disabled={confirming}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Confirm Delivery"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                </Can>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {showModal && selectedDelivery && (
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
                                    <Truck className="h-5 w-5 text-blue-600" />
                                    Delivery #{selectedDelivery.tracking_number || selectedDelivery.delivery_id}
                                </h2>
                                <p className="text-sm text-gray-500">Delivery Details</p>
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
                                    <p className="text-xs font-medium uppercase text-gray-500">PO Number</p>
                                    <p className="text-sm font-medium">{selectedDelivery.purchase_order?.po_number || selectedDelivery.po_id || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Supplier</p>
                                    <p className="text-sm font-medium">{selectedDelivery.purchase_order?.supplier?.supplier_name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Delivery Date</p>
                                    <p className="text-sm">{selectedDelivery.delivery_date ? new Date(selectedDelivery.delivery_date).toLocaleDateString() : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(selectedDelivery.status)}`}>
                                        {selectedDelivery.status?.replace("_", " ") || "—"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold mb-2">Delivery Items</h3>
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium">Item</th>
                                                <th className="px-4 py-2 text-right font-medium">Quantity</th>
                                                <th className="px-4 py-2 text-left font-medium">Unit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedDelivery.delivery_items?.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                                                        No items in this delivery.
                                                    </td>
                                                </tr>
                                            ) : (
                                                selectedDelivery.delivery_items?.map((item, index) => (
                                                    <tr key={index} className="border-b last:border-b-0">
                                                        <td className="px-4 py-2">{item.item?.item_name || "Unknown"}</td>
                                                        <td className="px-4 py-2 text-right">{item.quantity_received || 0}</td>
                                                        <td className="px-4 py-2">{item.item?.unit || "—"}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Close
                                </button>

                                {/* RBAC: confirming delivery requires logistics.edit */}
                                {(selectedDelivery.status === "pending" || selectedDelivery.status === "in_transit") && (
                                    <Can permission={PERMISSIONS.LOGISTICS_EDIT}>
                                        <button
                                            onClick={() => handleConfirmDelivery(selectedDelivery.delivery_id)}
                                            disabled={confirming}
                                            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {confirming ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4" />
                                            )}
                                            Confirm Delivery
                                        </button>
                                    </Can>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Page() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.LOGISTICS_VIEW}>
            <DeliveryConfirmationContent />
        </PermissionGuard>
    );
}