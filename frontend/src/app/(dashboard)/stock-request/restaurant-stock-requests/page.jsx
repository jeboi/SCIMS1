"use client";

import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/utils/permissions";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Package, Clock, CheckCircle, XCircle,
    Eye, RefreshCw, Loader2, Search, Filter,
    Plus, Trash2, Edit, Calendar, User,
    AlertTriangle, Check, X, ArrowRight,
    Send, Award, Zap, Building
} from "lucide-react";

function RestaurantStockRequestsContent() {
    const [requests, setRequests] = useState([]);
    const [items, setItems] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState({
        department_id: "",
        urgency: "normal",
        required_date: "",
        remarks: "",
        items: [],
    });

    const [currentItem, setCurrentItem] = useState({ item_id: "", quantity: 1 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            
            const [requestsRes, itemsRes, deptsRes] = await Promise.all([
                axiosInstance.get("/restaurant-stock-requests"),
                axiosInstance.get("/items"),
                axiosInstance.get("/restaurant-departments"),
            ]);
            
            setRequests(requestsRes.data?.data || []);
            setItems(itemsRes.data?.data || []);
            setDepartments(deptsRes.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load stock requests.");
            toast.error("Failed to load stock requests.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setShowModal(true);
    };

    const handleAddItem = () => {
        if (!currentItem.item_id) {
            toast.error("Please select an item.");
            return;
        }
        if (!currentItem.quantity || currentItem.quantity <= 0) {
            toast.error("Quantity must be greater than zero.");
            return;
        }

        const item = items.find(i => i.item_id === parseInt(currentItem.item_id));
        if (!item) return;

        setForm(prev => ({
            ...prev,
            items: [...prev.items, {
                item_id: item.item_id,
                item_name: item.item_name,
                unit: item.unit,
                quantity_requested: currentItem.quantity,
            }]
        }));

        setCurrentItem({ item_id: "", quantity: 1 });
    };

    const handleRemoveItem = (index) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();

        if (!form.department_id) {
            toast.error("Please select a department.");
            return;
        }
        if (form.items.length === 0) {
            toast.error("Please add at least one item.");
            return;
        }

        try {
            setActionLoading(true);
            
            const payload = {
                department_id: parseInt(form.department_id),
                urgency: form.urgency,
                required_date: form.required_date || null,
                remarks: form.remarks || null,
                details: form.items.map(item => ({
                    item_id: item.item_id,
                    quantity_requested: item.quantity_requested,
                })),
            };

            await axiosInstance.post("/restaurant-stock-requests", payload);
            
            toast.success("Stock request created successfully!");
            setShowCreateModal(false);
            setForm({
                department_id: "",
                urgency: "normal",
                required_date: "",
                remarks: "",
                items: [],
            });
            loadData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to create request.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId, status) => {
        const statusLabels = {
            pending: "Pending",
            approved: "Approved",
            fulfilled: "Fulfilled",
            rejected: "Rejected",
        };
        
        if (!confirm(`Update this request to "${statusLabels[status]}" status?`)) return;

        try {
            setActionLoading(true);
            await axiosInstance.patch(`/restaurant-stock-requests/${requestId}/status`, { status });
            toast.success(`Request status updated to ${statusLabels[status]}`);
            loadData();
            setShowModal(false);
            setSelectedRequest(null);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update status.");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-blue-100 text-blue-800",
            fulfilled: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="h-4 w-4 text-yellow-600" />,
            approved: <CheckCircle className="h-4 w-4 text-blue-600" />,
            fulfilled: <CheckCircle className="h-4 w-4 text-green-600" />,
            rejected: <XCircle className="h-4 w-4 text-red-600" />,
        };
        return icons[status] || <Clock className="h-4 w-4 text-gray-400" />;
    };

    const getUrgencyBadge = (urgency) => {
        const colors = {
            normal: "bg-gray-100 text-gray-800",
            urgent: "bg-orange-100 text-orange-800",
            critical: "bg-red-100 text-red-800",
        };
        return colors[urgency] || "bg-gray-100 text-gray-800";
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
                r.request_number?.toLowerCase().includes(search) ||
                r.requested_by?.name?.toLowerCase().includes(search) ||
                r.department?.department_name?.toLowerCase().includes(search)
            );
        });

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === "pending").length,
        approved: requests.filter(r => r.status === "approved").length,
        fulfilled: requests.filter(r => r.status === "fulfilled").length,
        rejected: requests.filter(r => r.status === "rejected").length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Restaurant Stock Requests</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Request and manage inventory items for restaurant departments.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Request
                    </button>
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
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Package className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
                    <p className="text-xs text-gray-500">Approved</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{stats.fulfilled}</p>
                    <p className="text-xs text-gray-500">Fulfilled</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    <p className="text-xs text-gray-500">Rejected</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by request #, requester, or department..."
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
                        <option value="fulfilled">Fulfilled</option>
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
                            <th className="px-4 py-3 text-left font-medium">Request #</th>
                            <th className="px-4 py-3 text-left font-medium">Department</th>
                            <th className="px-4 py-3 text-left font-medium">Requested By</th>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                            <th className="px-4 py-3 text-center font-medium">Items</th>
                            <th className="px-4 py-3 text-center font-medium">Urgency</th>
                            <th className="px-4 py-3 text-center font-medium">Status</th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                    No stock requests found.
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((req) => (
                                <tr key={req.request_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{req.request_number}</td>
                                    <td className="px-4 py-3">{req.department?.department_name || "—"}</td>
                                    <td className="px-4 py-3">{req.requested_by?.name || "—"}</td>
                                    <td className="px-4 py-3">
                                        {req.request_date ? new Date(req.request_date).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-center">{req.details?.length || 0}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getUrgencyBadge(req.urgency)}`}>
                                            {req.urgency}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="flex items-center justify-center gap-1">
                                            {getStatusIcon(req.status)}
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleViewRequest(req)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Request Modal */}
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
                                    <Package className="h-5 w-5 text-blue-600" />
                                    {selectedRequest.request_number}
                                </h2>
                                <p className="text-sm text-gray-500">Stock Request Details</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Request Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Department</p>
                                    <p className="text-sm font-medium">{selectedRequest.department?.department_name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Requested By</p>
                                    <p className="text-sm">{selectedRequest.requested_by?.name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Request Date</p>
                                    <p className="text-sm">{selectedRequest.request_date ? new Date(selectedRequest.request_date).toLocaleDateString() : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(selectedRequest.status)}`}>
                                        {selectedRequest.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Urgency</p>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getUrgencyBadge(selectedRequest.urgency)}`}>
                                        {selectedRequest.urgency}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Required Date</p>
                                    <p className="text-sm">{selectedRequest.required_date ? new Date(selectedRequest.required_date).toLocaleDateString() : "—"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-medium uppercase text-gray-500">Remarks</p>
                                    <p className="text-sm">{selectedRequest.remarks || "—"}</p>
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
                                                        <td className="px-4 py-2 text-right font-medium">{detail.quantity_requested}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                {selectedRequest.status === "pending" && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleUpdateStatus(selectedRequest.request_id, "rejected");
                                                setShowModal(false);
                                            }}
                                            className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4 mr-2 inline" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleUpdateStatus(selectedRequest.request_id, "approved");
                                                setShowModal(false);
                                            }}
                                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <Check className="h-4 w-4" />
                                            Approve
                                        </button>
                                    </>
                                )}
                                {selectedRequest.status === "approved" && (
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(selectedRequest.request_id, "fulfilled");
                                            setShowModal(false);
                                        }}
                                        className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        Fulfill
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Request Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-lg font-semibold">New Stock Request</h2>
                                <p className="text-sm text-gray-500">Request items for restaurant department</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Department *
                                </label>
                                <select
                                    value={form.department_id}
                                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                >
                                    <option value="">Select department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.department_id} value={dept.department_id}>
                                            {dept.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Urgency
                                </label>
                                <select
                                    value={form.urgency}
                                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Required Date
                                </label>
                                <input
                                    type="date"
                                    value={form.required_date}
                                    onChange={(e) => setForm({ ...form, required_date: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Remarks
                                </label>
                                <textarea
                                    value={form.remarks}
                                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                                    rows="2"
                                    placeholder="Additional notes..."
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="border-t pt-4">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Items
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={currentItem.item_id}
                                        onChange={(e) => setCurrentItem({ ...currentItem, item_id: e.target.value })}
                                        className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="">Select item</option>
                                        {items.map((item) => (
                                            <option key={item.item_id} value={item.item_id}>
                                                {item.item_name} (Stock: {item.current_stock || 0})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentItem.quantity}
                                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-20 rounded-lg border px-2 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>

                                {form.items.length > 0 && (
                                    <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                                        {form.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                <span className="text-sm">
                                                    {item.item_name} × {item.quantity_requested} {item.unit}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    {actionLoading ? "Creating..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Page() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.INVENTORY_VIEW}>
            <RestaurantStockRequestsContent />
        </PermissionGuard>
    );
}