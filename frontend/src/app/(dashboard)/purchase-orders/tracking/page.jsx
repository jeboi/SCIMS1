"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    ShoppingCart, CheckCircle, XCircle, Clock,
    Eye, RefreshCw, Loader2, Search,
    Calendar, Package, FileText, DollarSign,
    TrendingUp, Award, Truck
} from "lucide-react";

export default function PurchaseOrderTrackingPage() {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPO, setSelectedPO] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axiosInstance.get("/purchase-orders");
            setPurchaseOrders(response.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load purchase orders.");
            toast.error("Failed to load purchase orders.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewPO = (po) => {
        setSelectedPO(po);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            processing: "bg-blue-100 text-blue-800",
            completed: "bg-purple-100 text-purple-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="h-4 w-4 text-yellow-600" />,
            approved: <CheckCircle className="h-4 w-4 text-green-600" />,
            rejected: <XCircle className="h-4 w-4 text-red-600" />,
            processing: <Loader2 className="h-4 w-4 text-blue-600" />,
            completed: <CheckCircle className="h-4 w-4 text-purple-600" />,
        };
        return icons[status] || <Clock className="h-4 w-4 text-gray-400" />;
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: "Pending",
            approved: "Approved",
            rejected: "Rejected",
            processing: "Processing",
            completed: "Completed",
        };
        return labels[status] || status;
    };

    const filteredPOs = purchaseOrders
        .filter(po => {
            if (filterStatus === "all") return true;
            return po.status === filterStatus;
        })
        .filter(po => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                po.po_number?.toLowerCase().includes(search) ||
                po.supplier?.supplier_name?.toLowerCase().includes(search)
            );
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const stats = {
        total: purchaseOrders.length,
        pending: purchaseOrders.filter(po => po.status === "pending").length,
        processing: purchaseOrders.filter(po => po.status === "processing").length,
        completed: purchaseOrders.filter(po => po.status === "completed").length,
    };

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
                    <h1 className="text-2xl font-semibold">Purchase Order Tracking</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Monitor and manage all purchase orders.
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
                    <ShoppingCart className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total Orders</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Loader2 className="h-6 w-6 text-blue-600 mx-auto mb-1 animate-spin" />
                    <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                    <p className="text-xs text-gray-500">Processing</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by PO number or supplier..."
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
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
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
                            <th className="px-4 py-3 text-left font-medium">PO Number</th>
                            <th className="px-4 py-3 text-left font-medium">Supplier</th>
                            <th className="px-4 py-3 text-left font-medium">Request</th>
                            <th className="px-4 py-3 text-left font-medium">PO Date</th>
                            <th className="px-4 py-3 text-center font-medium">Items</th>
                            <th className="px-4 py-3 text-right font-medium">Total</th>
                            <th className="px-4 py-3 text-center font-medium">Status</th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredPOs.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                    No purchase orders found.
                                </td>
                            </tr>
                        ) : (
                            filteredPOs.map((po) => {
                                const total = po.details?.reduce((sum, d) => sum + parseFloat(d.subtotal || 0), 0) || 0;
                                return (
                                    <tr key={po.po_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{po.po_number || `PO #${po.po_id}`}</td>
                                        <td className="px-4 py-3">{po.supplier?.supplier_name || "—"}</td>
                                        <td className="px-4 py-3">#{po.purchase_request?.request_id || "—"}</td>
                                        <td className="px-4 py-3">
                                            {po.po_date ? new Date(po.po_date).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-center">{po.details?.length || 0}</td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            ₱{total.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="flex items-center justify-center gap-1">
                                                {getStatusIcon(po.status)}
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(po.status)}`}>
                                                    {getStatusLabel(po.status)}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleViewPO(po)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {showModal && selectedPO && (
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
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    {selectedPO.po_number || `PO #${selectedPO.po_id}`}
                                </h2>
                                <p className="text-sm text-gray-500">Purchase Order Details</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* PO Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Supplier</p>
                                    <p className="text-sm font-medium">{selectedPO.supplier?.supplier_name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Request</p>
                                    <p className="text-sm">#{selectedPO.purchase_request?.request_id || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">PO Date</p>
                                    <p className="text-sm">{selectedPO.po_date ? new Date(selectedPO.po_date).toLocaleDateString() : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(selectedPO.status)}`}>
                                        {getStatusLabel(selectedPO.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold mb-2">PO Items</h3>
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium">Item</th>
                                                <th className="px-4 py-2 text-left font-medium">Unit</th>
                                                <th className="px-4 py-2 text-right font-medium">Quantity</th>
                                                <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                                                <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPO.details?.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                                                        No items in this PO.
                                                    </td>
                                                </tr>
                                            ) : (
                                                selectedPO.details?.map((detail, index) => (
                                                    <tr key={index} className="border-b last:border-b-0">
                                                        <td className="px-4 py-2">{detail.item?.item_name || "Unknown"}</td>
                                                        <td className="px-4 py-2">{detail.item?.unit || "—"}</td>
                                                        <td className="px-4 py-2 text-right">{detail.quantity}</td>
                                                        <td className="px-4 py-2 text-right">₱{parseFloat(detail.unit_price || 0).toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-right font-medium">₱{parseFloat(detail.subtotal || 0).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        <tfoot className="border-t bg-gray-50">
                                            <tr>
                                                <td colSpan="4" className="px-4 py-2 text-right font-medium">Grand Total</td>
                                                <td className="px-4 py-2 text-right font-bold">
                                                    ₱{selectedPO.details?.reduce((sum, d) => sum + parseFloat(d.subtotal || 0), 0).toFixed(2) || "0.00"}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Related Deliveries */}
                            {selectedPO.deliveries && selectedPO.deliveries.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold mb-2">Related Deliveries</h3>
                                    <div className="overflow-hidden rounded-lg border">
                                        <table className="w-full text-sm">
                                            <thead className="border-b bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium">Delivery ID</th>
                                                    <th className="px-4 py-2 text-left font-medium">Tracking</th>
                                                    <th className="px-4 py-2 text-left font-medium">Date</th>
                                                    <th className="px-4 py-2 text-center font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedPO.deliveries.map((delivery, index) => (
                                                    <tr key={index} className="border-b last:border-b-0">
                                                        <td className="px-4 py-2">#{delivery.delivery_id}</td>
                                                        <td className="px-4 py-2">{delivery.tracking_number || "—"}</td>
                                                        <td className="px-4 py-2">
                                                            {delivery.delivery_date ? new Date(delivery.delivery_date).toLocaleDateString() : "—"}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(delivery.status)}`}>
                                                                {delivery.status || "—"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end border-t pt-4">
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
        </div>
    );
}