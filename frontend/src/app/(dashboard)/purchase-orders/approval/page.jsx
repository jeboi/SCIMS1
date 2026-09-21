"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    ShoppingCart, CheckCircle, XCircle, Clock,
    Eye, RefreshCw, Loader2, Search, Filter,
    User, Calendar, Package, AlertTriangle,
    Check, X, ArrowRight, FileText, DollarSign
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

function PurchaseOrderApprovalContent() {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPO, setSelectedPO] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectPOId, setRejectPOId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("pending");
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

    const handleApprove = async (poId) => {
        if (!confirm("Approve this purchase order?")) return;

        try {
            setActionLoading(true);
            await axiosInstance.patch(`/purchase-orders/${poId}`, {
                status: "approved",
            });
            toast.success("Purchase order approved successfully!");
            loadData();
            setShowModal(false);
            setSelectedPO(null);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to approve PO.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenRejectModal = (poId) => {
        setRejectPOId(poId);
        setRejectionReason("");
        setShowRejectModal(true);
        if (showModal) setShowModal(false);
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }

        try {
            setActionLoading(true);
            await axiosInstance.patch(`/purchase-orders/${rejectPOId}`, {
                status: "rejected",
                remarks: rejectionReason.trim(),
            });
            toast.success("Purchase order rejected.");
            loadData();
            setShowRejectModal(false);
            setRejectPOId(null);
            setRejectionReason("");
            setShowModal(false);
            setSelectedPO(null);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to reject PO.");
        } finally {
            setActionLoading(false);
        }
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

    const filteredPOs = purchaseOrders
        .filter(po => {
            if (filterStatus === "all") {
                return po.status === "pending" || po.status === "approved";
            }
            return po.status === filterStatus;
        })
        .filter(po => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                po.po_number?.toLowerCase().includes(search) ||
                po.supplier?.supplier_name?.toLowerCase().includes(search) ||
                po.purchase_request?.request_id?.toString().includes(search)
            );
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const stats = {
        pending: purchaseOrders.filter(po => po.status === "pending").length,
        approved: purchaseOrders.filter(po => po.status === "approved").length,
        rejected: purchaseOrders.filter(po => po.status === "rejected").length,
        total: purchaseOrders.filter(po => po.status === "pending" || po.status === "approved" || po.status === "rejected").length,
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
                    <h1 className="text-2xl font-semibold">Purchase Order Approval</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Review and approve purchase orders.
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
                    <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-xs text-gray-500">Pending Approval</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    <p className="text-xs text-gray-500">Approved</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    <p className="text-xs text-gray-500">Rejected</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total for Review</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by PO number, supplier, or request ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterStatus("pending")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filterStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "border hover:bg-gray-50"
                        }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilterStatus("approved")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filterStatus === "approved"
                                ? "bg-green-100 text-green-800"
                                : "border hover:bg-gray-50"
                        }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setFilterStatus("rejected")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filterStatus === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "border hover:bg-gray-50"
                        }`}
                    >
                        Rejected
                    </button>
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filterStatus === "all"
                                ? "bg-blue-100 text-blue-800"
                                : "border hover:bg-gray-50"
                        }`}
                    >
                        All
                    </button>
                </div>
                <button
                    onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("pending");
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
                                    {filterStatus === "pending"
                                        ? "No pending purchase orders for approval."
                                        : "No purchase orders found."}
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
                                        <td className="px-4 py-3">
                                            <span className="flex items-center justify-center gap-1">
                                                {getStatusIcon(po.status)}
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(po.status)}`}>
                                                    {po.status || "—"}
                                                </span>
                                                {po.status === "rejected" && po.remarks && (
                                                    <span
                                                        className="text-xs text-gray-400 ml-1 cursor-help"
                                                        title={po.remarks}
                                                    >
                                                        (Reason: {po.remarks})
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* View — read-only */}
                                                <button
                                                    onClick={() => handleViewPO(po)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                {/* RBAC: Approve/Reject require purchase_orders.approve */}
                                                {po.status === "pending" && (
                                                    <Can permission={PERMISSIONS.PURCHASE_ORDERS_APPROVE}>
                                                        <button
                                                            onClick={() => handleApprove(po.po_id)}
                                                            disabled={actionLoading}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenRejectModal(po.po_id)}
                                                            disabled={actionLoading}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </Can>
                                                )}
                                            </div>
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
                                    <ShoppingCart className="h-5 w-5 text-blue-600" />
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
                                        {selectedPO.status || "—"}
                                    </span>
                                </div>
                                {selectedPO.status === "rejected" && selectedPO.remarks && (
                                    <div className="col-span-2">
                                        <p className="text-xs font-medium uppercase text-red-500">Rejection Reason</p>
                                        <p className="mt-1 text-sm text-red-600">{selectedPO.remarks}</p>
                                    </div>
                                )}
                            </div>

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

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Close
                                </button>

                                {/* RBAC: modal action buttons require purchase_orders.approve */}
                                {selectedPO.status === "pending" && (
                                    <Can permission={PERMISSIONS.PURCHASE_ORDERS_APPROVE}>
                                        <button
                                            onClick={() => {
                                                setShowModal(false);
                                                handleOpenRejectModal(selectedPO.po_id);
                                            }}
                                            className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            <XCircle className="h-4 w-4 mr-2 inline" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleApprove(selectedPO.po_id);
                                            }}
                                            disabled={actionLoading}
                                            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Approve
                                        </button>
                                    </Can>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowRejectModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    Reject Purchase Order
                                </h2>
                                <p className="text-sm text-gray-500">Provide a reason for rejection</p>
                            </div>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows="4"
                                    placeholder="Please explain why this purchase order is being rejected..."
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <X className="h-4 w-4" />
                                    )}
                                    {actionLoading ? "Processing..." : "Reject"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PurchaseOrderApprovalPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.PURCHASE_ORDERS_APPROVE}>
            <PurchaseOrderApprovalContent />
        </PermissionGuard>
    );
}