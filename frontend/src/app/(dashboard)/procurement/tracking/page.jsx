"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    FileText, CheckCircle, XCircle, Clock,
    Eye, RefreshCw, Loader2, Search, Filter,
    User, Calendar, Package, ShoppingCart,
    AlertTriangle, Check, X, ArrowRight,
    Truck, Boxes, TrendingUp, Award,
    ChevronRight, ChevronDown, PlusCircle
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

function ProcurementTrackingContent() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        po_created: 0,
        delivered: 0,
        completed: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axiosInstance.get("/purchase-requests");
            const data = response.data?.data || [];
            setRequests(data);
            calculateStats(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load procurement data.");
            toast.error("Failed to load procurement data.");
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        const pending = data.filter(r => r.status === "pending").length;
        const approved = data.filter(r => r.status === "approved").length;
        const po_created = data.filter(r => r.purchase_orders && r.purchase_orders.length > 0).length;
        const delivered = data.filter(r => {
            const po = r.purchase_orders?.[0];
            return po && (po.status === "delivered" || po.status === "completed");
        }).length;
        const completed = data.filter(r => r.status === "completed").length;

        setStats({ total, pending, approved, po_created, delivered, completed });
    };

    const getStage = (request) => {
        if (request.status === "completed") return { label: "Completed", stage: 4, color: "bg-green-500" };
        if (request.status === "delivered") return { label: "Delivered", stage: 3, color: "bg-orange-500" };
        if (request.purchase_orders && request.purchase_orders.length > 0) return { label: "PO Created", stage: 2, color: "bg-purple-500" };
        if (request.status === "approved") return { label: "Approved", stage: 1, color: "bg-green-500" };
        return { label: "Request Created", stage: 0, color: "bg-blue-500" };
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            completed: "bg-blue-100 text-blue-800",
            delivered: "bg-purple-100 text-purple-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStageIcon = (stage) => {
        const icons = {
            0: <FileText className="h-4 w-4 text-blue-600" />,
            1: <CheckCircle className="h-4 w-4 text-green-600" />,
            2: <ShoppingCart className="h-4 w-4 text-purple-600" />,
            3: <Truck className="h-4 w-4 text-orange-600" />,
            4: <CheckCircle className="h-4 w-4 text-green-600" />,
        };
        return icons[stage] || <FileText className="h-4 w-4 text-gray-400" />;
    };

    const filteredRequests = requests
        .filter(r => {
            if (filterStatus === "all") return true;
            if (filterStatus === "pending") return r.status === "pending";
            if (filterStatus === "approved") return r.status === "approved" && (!r.purchase_orders || r.purchase_orders.length === 0);
            if (filterStatus === "po_created") return r.purchase_orders && r.purchase_orders.length > 0;
            if (filterStatus === "delivered") {
                const po = r.purchase_orders?.[0];
                return po && (po.status === "delivered" || po.status === "completed");
            }
            if (filterStatus === "completed") return r.status === "completed";
            return true;
        })
        .filter(r => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                r.request_id?.toString().includes(search) ||
                r.requested_by?.name?.toLowerCase().includes(search) ||
                r.details?.some(d => d.item?.item_name?.toLowerCase().includes(search)) ||
                r.purchase_orders?.[0]?.supplier?.supplier_name?.toLowerCase().includes(search)
            );
        })
        .filter(r => {
            if (dateRange.from && r.request_date) {
                const date = new Date(r.request_date);
                const from = new Date(dateRange.from);
                if (date < from) return false;
            }
            if (dateRange.to && r.request_date) {
                const date = new Date(r.request_date);
                const to = new Date(dateRange.to);
                if (date > to) return false;
            }
            return true;
        })
        .sort((a, b) => new Date(b.request_date) - new Date(a.request_date));

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setShowModal(true);
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
                    <h1 className="text-2xl font-semibold">Procurement Tracking</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Track the complete procurement lifecycle from request to delivery.
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    <p className="text-xs text-gray-500">Approved</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <ShoppingCart className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{stats.po_created}</p>
                    <p className="text-xs text-gray-500">PO Created</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Truck className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-orange-600">{stats.delivered}</p>
                    <p className="text-xs text-gray-500">Delivered</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Award className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by ID, requester, item, or supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-40">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Stages</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="po_created">PO Created</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div className="w-full sm:w-36">
                    <input
                        type="date"
                        placeholder="From"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-36">
                    <input
                        type="date"
                        placeholder="To"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                        setDateRange({ from: "", to: "" });
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
                            <th className="px-4 py-3 text-center font-medium">PO</th>
                            <th className="px-4 py-3 text-left font-medium">Supplier</th>
                            <th className="px-4 py-3 text-center font-medium">Stage</th>
                            <th className="px-4 py-3 text-center font-medium">Progress</th>
                            <th className="px-4 py-3 text-center font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                    No procurement records found.
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((request) => {
                                const stage = getStage(request);
                                const po = request.purchase_orders?.[0];
                                const progress = ((stage.stage) / 4) * 100;

                                return (
                                    <tr key={request.request_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">#{request.request_id}</td>
                                        <td className="px-4 py-3">{request.requested_by?.name || "—"}</td>
                                        <td className="px-4 py-3">
                                            {request.request_date ? new Date(request.request_date).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-center">{request.details?.length || 0}</td>
                                        <td className="px-4 py-3 text-center">
                                            {po ? (
                                                <span className="text-purple-600 font-medium">{po.po_number || `PO #${po.po_id}`}</span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{po?.supplier?.supplier_name || "—"}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="flex items-center justify-center gap-1">
                                                {getStageIcon(stage.stage)}
                                                <span className={`text-xs font-medium ${stage.color.replace('bg-', 'text-')}`}>
                                                    {stage.label}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${stage.color}`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {/* View Details — read-only */}
                                            <button
                                                onClick={() => handleViewRequest(request)}
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

            {/* Detailed View Modal */}
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
                                    Procurement #{selectedRequest.request_id}
                                </h2>
                                <p className="text-sm text-gray-500">Detailed tracking information</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Request Info */}
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

                            {/* Progress Timeline */}
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold mb-3">Procurement Progress</h3>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        {["Request", "Approved", "PO Created", "Delivered", "Completed"].map((stage, index) => {
                                            const currentStage = getStage(selectedRequest);
                                            const isActive = index <= currentStage.stage;
                                            return (
                                                <div key={stage} className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                                                    }`}>
                                                        {index === 0 && <FileText className="h-4 w-4" />}
                                                        {index === 1 && <CheckCircle className="h-4 w-4" />}
                                                        {index === 2 && <ShoppingCart className="h-4 w-4" />}
                                                        {index === 3 && <Truck className="h-4 w-4" />}
                                                        {index === 4 && <Award className="h-4 w-4" />}
                                                    </div>
                                                    <span className="text-xs mt-1 text-gray-500">{stage}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="h-1 bg-gray-200 rounded-full mt-2">
                                        <div
                                            className="h-1 bg-blue-600 rounded-full transition-all duration-500"
                                            style={{ width: `${(getStage(selectedRequest).stage / 4) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="border-t pt-4">
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

                            {/* PO Info */}
                            {selectedRequest.purchase_orders && selectedRequest.purchase_orders.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold mb-2">Purchase Order</h3>
                                    {selectedRequest.purchase_orders.map((po, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <p className="text-xs text-gray-500">PO Number</p>
                                                    <p className="text-sm font-medium">{po.po_number || `PO #${po.po_id}`}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Supplier</p>
                                                    <p className="text-sm">{po.supplier?.supplier_name || "—"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">PO Date</p>
                                                    <p className="text-sm">{po.po_date ? new Date(po.po_date).toLocaleDateString() : "—"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">PO Status</p>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(po.status)}`}>
                                                        {po.status || "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Close
                                </button>

                                {/* RBAC: only purchase_orders.create can create a PO from here */}
                                {selectedRequest.status === "approved" && !selectedRequest.purchase_orders?.length && (
                                    <Can permission={PERMISSIONS.PURCHASE_ORDERS_CREATE}>
                                        <button
                                            onClick={() => {
                                                setShowModal(false);
                                                window.location.href = "/purchase-orders/creation";
                                            }}
                                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                            Create PO
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

export default function ProcurementTrackingPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.PROCUREMENT_VIEW}>
            <ProcurementTrackingContent />
        </PermissionGuard>
    );
}