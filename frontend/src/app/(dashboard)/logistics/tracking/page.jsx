"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    FileText, Clock, CheckCircle, XCircle, Truck,
    Eye, RefreshCw, Loader2, Search,
    MapPin, Calendar, User, AlertTriangle,
    Check, X, ArrowRight, Edit,
    Package, Boxes, TrendingUp, Award,
    Send, Filter, Warehouse
} from "lucide-react";

export default function DocumentTrackingPage() {
    const [documents, setDocuments] = useState([]);
    const [trackingRecords, setTrackingRecords] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusForm, setStatusForm] = useState({
        status: "",
        location: "",
        remarks: "",
        tracking_number: "",
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Predefined location options
    const LOCATION_OPTIONS = [
        "Main Hotel Warehouse",
        "Franchise Warehouse",
        "Supplier Facility",
        "Customs Office",
        "Port of Entry",
        "In Transit",
        "Other",
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            
            // Fetch warehouses for dynamic options
            let warehouseData = [];
            try {
                const warehousesRes = await axiosInstance.get("/warehouses");
                warehouseData = warehousesRes.data?.data || [];
                setWarehouses(warehouseData);
            } catch (whErr) {
                console.log("Warehouses not available yet");
            }
            
            // Fetch documents with tracking data
            const [docsRes, trackingRes] = await Promise.all([
                axiosInstance.get("/logistics-documents"),
                axiosInstance.get("/document-tracking").catch(() => ({ data: { data: [] } })),
            ]);
            
            const docs = docsRes.data?.data || [];
            const tracking = trackingRes.data?.data || [];
            
            setDocuments(docs);
            setTrackingRecords(tracking);
            
        } catch (err) {
            console.error(err);
            setError("Failed to load document tracking data.");
            toast.error("Failed to load document tracking data.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (doc) => {
        setSelectedDoc(doc);
        setShowModal(true);
    };

    const handleOpenStatusModal = (doc) => {
        setSelectedDoc(doc);
        setStatusForm({
            status: doc.status || "draft",
            location: doc.location || "Main Hotel Warehouse",
            remarks: "",
            tracking_number: doc.document_number || "",
        });
        setShowStatusModal(true);
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        
        if (!statusForm.status) {
            toast.error("Please select a status.");
            return;
        }
        if (!statusForm.location) {
            toast.error("Please select a location.");
            return;
        }

        try {
            setActionLoading(true);
            
            // Update document status
            await axiosInstance.patch(`/logistics-documents/${selectedDoc.document_id}/status`, {
                status: statusForm.status,
                location: statusForm.location,
            });
            
            // Create tracking record
            await axiosInstance.post("/document-tracking", {
                document_id: selectedDoc.document_id,
                status: statusForm.status,
                location: statusForm.location,
                remarks: statusForm.remarks || `Status updated to ${statusForm.status}`,
                tracking_number: statusForm.tracking_number || selectedDoc.document_number,
            });

            toast.success(`Document status updated to ${statusForm.status}`);
            setShowStatusModal(false);
            setSelectedDoc(null);
            loadData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update status.");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            draft: "bg-gray-100 text-gray-800",
            submitted: "bg-blue-100 text-blue-800",
            in_transit: "bg-yellow-100 text-yellow-800",
            received: "bg-green-100 text-green-800",
            approved: "bg-purple-100 text-purple-800",
            rejected: "bg-red-100 text-red-800",
            completed: "bg-emerald-100 text-emerald-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status) => {
        const icons = {
            draft: <FileText className="h-4 w-4 text-gray-500" />,
            submitted: <Send className="h-4 w-4 text-blue-600" />,
            in_transit: <Truck className="h-4 w-4 text-yellow-600" />,
            received: <CheckCircle className="h-4 w-4 text-green-600" />,
            approved: <CheckCircle className="h-4 w-4 text-purple-600" />,
            rejected: <XCircle className="h-4 w-4 text-red-600" />,
            completed: <Award className="h-4 w-4 text-emerald-600" />,
        };
        return icons[status] || <FileText className="h-4 w-4 text-gray-400" />;
    };

    const getStatusLabel = (status) => {
        const labels = {
            draft: "Draft",
            submitted: "Submitted",
            in_transit: "In Transit",
            received: "Received",
            approved: "Approved",
            rejected: "Rejected",
            completed: "Completed",
        };
        return labels[status] || status;
    };

    const getTrackingHistory = (docId) => {
        return trackingRecords
            .filter(record => record.document_id === docId)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    };

    const filteredDocs = documents
        .filter(doc => {
            if (filterStatus === "all") return true;
            return doc.status === filterStatus;
        })
        .filter(doc => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                doc.title?.toLowerCase().includes(search) ||
                doc.document_number?.toLowerCase().includes(search) ||
                doc.supplier?.toLowerCase().includes(search)
            );
        });

    const stats = {
        total: documents.length,
        draft: documents.filter(d => d.status === "draft").length,
        submitted: documents.filter(d => d.status === "submitted").length,
        in_transit: documents.filter(d => d.status === "in_transit").length,
        received: documents.filter(d => d.status === "received").length,
        approved: documents.filter(d => d.status === "approved").length,
        rejected: documents.filter(d => d.status === "rejected").length,
        completed: documents.filter(d => d.status === "completed").length,
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
                    <h1 className="text-2xl font-semibold">Document Tracking</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Track the status and location of logistics documents.
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
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <FileText className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                    <p className="text-xs text-gray-500">Draft</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Send className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
                    <p className="text-xs text-gray-500">Submitted</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <Truck className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{stats.in_transit}</p>
                    <p className="text-xs text-gray-500">In Transit</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{stats.received}</p>
                    <p className="text-xs text-gray-500">Received</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{stats.approved}</p>
                    <p className="text-xs text-gray-500">Approved</p>
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
                        placeholder="Search by title, number, or supplier..."
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
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="in_transit">In Transit</option>
                        <option value="received">Received</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
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
                            <th className="px-4 py-3 text-left font-medium">Document</th>
                            <th className="px-4 py-3 text-left font-medium">Number</th>
                            <th className="px-4 py-3 text-left font-medium">Location</th>
                            <th className="px-4 py-3 text-left font-medium">Updated</th>
                            <th className="px-4 py-3 text-center font-medium">Status</th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredDocs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                    No documents found.
                                </td>
                            </tr>
                        ) : (
                            filteredDocs.map((doc) => (
                                <tr key={doc.document_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{doc.title}</td>
                                    <td className="px-4 py-3">{doc.document_number}</td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-gray-400" />
                                            {doc.location || "Main Hotel Warehouse"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="flex items-center justify-center gap-1">
                                            {getStatusIcon(doc.status)}
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(doc.status)}`}>
                                                {getStatusLabel(doc.status)}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleViewDocument(doc)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenStatusModal(doc)}
                                                className="text-green-600 hover:text-green-800"
                                                title="Update Status"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Document Modal */}
            {showModal && selectedDoc && (
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
                                    {selectedDoc.title}
                                </h2>
                                <p className="text-sm text-gray-500">{selectedDoc.document_number}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Document Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Category</p>
                                    <p className="text-sm font-medium">{selectedDoc.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(selectedDoc.status)}`}>
                                        {getStatusLabel(selectedDoc.status)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Location</p>
                                    <p className="text-sm">{selectedDoc.location || "Main Hotel Warehouse"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Supplier</p>
                                    <p className="text-sm">{selectedDoc.supplier || "—"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-medium uppercase text-gray-500">Tracking History</p>
                                    <div className="mt-2 space-y-2">
                                        {(() => {
                                            const history = getTrackingHistory(selectedDoc.document_id);
                                            if (history.length > 0) {
                                                return history.map((item, index) => (
                                                    <div key={index} className="flex items-start gap-3">
                                                        <div className="flex flex-col items-center">
                                                            <div className={`w-3 h-3 rounded-full ${index === history.length - 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                                            {index < history.length - 1 && (
                                                                <div className="w-0.5 h-6 bg-gray-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{getStatusLabel(item.status)}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {item.remarks || `Status updated to ${item.status}`} — {item.location || "Main Hotel Warehouse"}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ));
                                            } else {
                                                return (
                                                    <p className="text-sm text-gray-500">No tracking history available.</p>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        handleOpenStatusModal(selectedDoc);
                                    }}
                                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 flex items-center gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Update Status
                                </button>
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

            {/* Update Status Modal */}
{showStatusModal && selectedDoc && (
    <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
        onClick={() => setShowStatusModal(false)}
    >
        <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                    <h2 className="text-lg font-semibold">Update Tracking Status</h2>
                    <p className="text-sm text-gray-500">{selectedDoc.title}</p>
                </div>
                <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-2xl text-gray-400 hover:text-gray-600"
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
                {/* Status */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Status *
                    </label>
                    <select
                        value={statusForm.status}
                        onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        required
                    >
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="in_transit">In Transit</option>
                        <option value="received">Received</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* Location - Dropdown */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Location *
                    </label>
                    <select
                        value={statusForm.location}
                        onChange={(e) => setStatusForm({ ...statusForm, location: e.target.value })}
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        required
                    >
                        <option value="">Select location</option>
                        
                        {/* Warehouses from database */}
                        {warehouses.length > 0 && (
                            <optgroup label="Warehouses">
                                {warehouses.map((wh) => (
                                    <option key={wh.warehouse_id} value={wh.warehouse_name}>
                                        {wh.warehouse_name}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                        
                        {/* Predefined logistics locations */}
                        <optgroup label="Logistics Locations">
                            <option value="Supplier Facility">Supplier Facility</option>
                            <option value="Customs Office">Customs Office</option>
                            <option value="Port of Entry">Port of Entry</option>
                            <option value="In Transit">In Transit</option>
                        </optgroup>
                        
                        {/* Other option */}
                        <option value="Other">Other (Custom)</option>
                    </select>
                    {statusForm.location === "Other" && (
                        <input
                            type="text"
                            placeholder="Enter custom location..."
                            value={statusForm.custom_location || ""}
                            onChange={(e) => setStatusForm({ ...statusForm, custom_location: e.target.value })}
                            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                        Select from warehouses, logistics locations, or choose "Other" for custom entry.
                    </p>
                </div>

                {/* Remarks */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Remarks
                    </label>
                    <textarea
                        value={statusForm.remarks}
                        onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                        rows="2"
                        placeholder="Additional remarks about the status update..."
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                {/* Tracking Number */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Tracking Number
                    </label>
                    <input
                        type="text"
                        value={statusForm.tracking_number}
                        onChange={(e) => setStatusForm({ ...statusForm, tracking_number: e.target.value })}
                        placeholder="e.g. TRK-2026-001"
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                    <button
                        type="button"
                        onClick={() => setShowStatusModal(false)}
                        className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                        {actionLoading ? "Updating..." : "Update Status"}
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
        </div>
    );
}