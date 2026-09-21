"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    FileText, CheckCircle, XCircle, Clock,
    Eye, RefreshCw, Loader2, Search, Filter,
    User, Calendar, Package, ShoppingCart,
    AlertTriangle, Check, X, ArrowRight
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

function ProcurementApprovalContent() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("pending");
    const [searchTerm, setSearchTerm] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectRequestId, setRejectRequestId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axiosInstance.get("/purchase-requests");
            setRequests(response.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load purchase requests.");
            toast.error("Failed to load purchase requests.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setShowModal(true);
    };

    const handleApprove = async (requestId) => {
        if (!confirm("Approve this purchase request?")) return;

        try {
            setActionLoading(true);
            await axiosInstance.put(`/purchase-requests/${requestId}`, {
                status: "approved",
            });
            toast.success("Purchase request approved successfully!");
            loadData();
            setShowModal(false);
            setSelectedRequest(null);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to approve request.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenRejectModal = (requestId) => {
        setRejectRequestId(requestId);
        setRejectionReason("");
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }

        try {
            setActionLoading(true);
            await axiosInstance.put(`/purchase-requests/${rejectRequestId}`, {
                status: "rejected",
                remarks: rejectionReason.trim(),
            });
            toast.success("Purchase request rejected.");
            loadData();
            setShowRejectModal(false);
            setRejectRequestId(null);
            setRejectionReason("");
            setShowModal(false);
            setSelectedRequest(null);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to reject request.");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="h-4 w-4 text-yellow-600" />,
            approved: <CheckCircle className="h-4 w-4 text-green-600" />,
            rejected: <XCircle className="h-4 w-4 text-red-600" />,
        };
        return icons[status] || <Clock className="h-4 w-4 text-gray-400" />;
    };

    const filteredRequests = requests
        .filter(r => {
            if (filterStatus === "all") return true;
            return r.status === filterStatus;
        })
        .filter(r => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                r.requested_by?.name?.toLowerCase().includes(search) ||
                r.request_id?.toString().includes(search) ||
                r.details?.some(d => d.item?.item_name?.toLowerCase().includes(search))
            );
        })
        .sort((a, b) => new Date(b.request_date) - new Date(a.request_date));

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === "pending").length;
    const approvedRequests = requests.filter(r => r.status === "approved").length;
    const rejectedRequests = requests.filter(r => r.status === "rejected").length;

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
                    <h1 className="text-2xl font-semibold">Procurement Approval</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Review and approve/reject purchase requests.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={loadData}
                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{totalRequests}</p>
                    <p className="text-xs text-gray-500">Total Requests</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{approvedRequests}</p>
                    <p className="text-xs text-gray-500">Approved</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{rejectedRequests}</p>
                    <p className="text-xs text-gray-500">Rejected</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by request ID, requester, or item..."
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
                            <th className="px-4 py-3 text-left font-medium">ID</th>
                            <th className="px-4 py-3 text-left font-medium">Requested By</th>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                            <th className="px-4 py-3 text-center font-medium">Items</th>
                            <th className="px-4 py-3 text-center font-medium">Status</th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                    No purchase requests found.
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((request) => (
                                <tr key={request.request_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">#{request.request_id}</td>
                                    <td className="px-4 py-3">{request.requested_by?.name || "—"}</td>
                                    <td className="px-4 py-3">
                                        {request.request_date ? new Date(request.request_date).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {request.details?.length || 0}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="flex items-center justify-center gap-1">
                                            {getStatusIcon(request.status)}
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(request.status)}`}>
                                                {request.status || "—"}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* View Details — read-only */}
                                            <button
                                                onClick={() => handleViewRequest(request)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>

                                            {/* RBAC: Approve / Reject require procurement.approve */}
                                            {request.status === "pending" && (
                                                <Can permission={PERMISSIONS.PROCUREMENT_APPROVE}>
                                                    <button
                                                        onClick={() => handleApprove(request.request_id)}
                                                        disabled={actionLoading}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenRejectModal(request.request_id)}
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {showModal && selectedRequest && (
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
                                    Purchase Request #{selectedRequest.request_id}
                                </h2>
                                <p className="text-sm text-gray-500">Request Details</p>
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
                                    <p className="text-xs font-medium uppercase text-gray-500">Requested By</p>
                                    <p className="text-sm font-medium">{selectedRequest.requested_by?.name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Request Date</p>
                                    <p className="text-sm">{selectedRequest.request_date ? new Date(selectedRequest.request_date).toLocaleDateString() : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(selectedRequest.status)}`}>
                                        {selectedRequest.status || "—"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Remarks</p>
                                    <p className="text-sm">{selectedRequest.remarks || "—"}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold mb-2">Requested Items</h3>
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium">Item</th>
                                                <th className="px-4 py-2 text-left font-medium">Unit</th>
                                                <th className="px-4 py-2 text-right font-medium">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRequest.details?.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                                                        No items in this request.
                                                    </td>
                                                </tr>
                                            ) : (
                                                selectedRequest.details?.map((detail, index) => (
                                                    <tr key={index} className="border-b last:border-b-0">
                                                        <td className="px-4 py-2">{detail.item?.item_name || "Unknown"}</td>
                                                        <td className="px-4 py-2">{detail.item?.unit || "—"}</td>
                                                        <td className="px-4 py-2 text-right font-medium">{detail.quantity}</td>
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
                                {selectedRequest.status === "pending" && (
                                    <Can permission={PERMISSIONS.PROCUREMENT_APPROVE}>
                                        <button
                                            onClick={() => {
                                                setShowModal(false);
                                                handleOpenRejectModal(selectedRequest.request_id);
                                            }}
                                            className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            <XCircle className="h-4 w-4 mr-2 inline" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(selectedRequest.request_id)}
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
                                    Reject Request
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
                                    placeholder="Please explain why this request is being rejected..."
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

export default function ProcurementApprovalPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.PROCUREMENT_APPROVE}>
            <ProcurementApprovalContent />
        </PermissionGuard>
    );
}