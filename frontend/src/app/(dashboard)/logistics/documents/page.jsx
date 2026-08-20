"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    FileText, File, FileCheck, FileX, Clock,
    Eye, RefreshCw, Loader2, Search,
    Plus, Download, Trash2, Calendar,
    Printer, CheckCircle, XCircle, AlertTriangle,
    FolderOpen, User, Tag
} from "lucide-react";

export default function LogisticsDocumentsPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [actionLoading, setActionLoading] = useState(false);

    // Create form state
    const [form, setForm] = useState({
        title: "",
        category: "",
        document_number: "",
        description: "",
        status: "draft",
        document_date: new Date().toISOString().slice(0, 10),
        reference_id: "",
        supplier: "",
        items: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axiosInstance.get("/logistics-documents");
            setDocuments(response.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load logistics documents.");
            toast.error("Failed to load logistics documents.");
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (doc) => {
        setSelectedDoc(doc);
        setShowModal(true);
    };

    const handleCreateDocument = async (e) => {
        e.preventDefault();
        
        if (!form.title.trim()) {
            toast.error("Document title is required.");
            return;
        }
        if (!form.category) {
            toast.error("Please select a category.");
            return;
        }
        if (!form.document_number.trim()) {
            toast.error("Document number is required.");
            return;
        }

        try {
            setActionLoading(true);
            const response = await axiosInstance.post("/logistics-documents", form);
            const newDoc = response.data?.data;
            setDocuments([newDoc, ...documents]);
            toast.success("Document created successfully!");
            setShowCreateModal(false);
            setForm({
                title: "",
                category: "",
                document_number: "",
                description: "",
                status: "draft",
                document_date: new Date().toISOString().slice(0, 10),
                reference_id: "",
                supplier: "",
                items: 0,
            });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to create document.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            setActionLoading(true);
            await axiosInstance.delete(`/logistics-documents/${docId}`);
            setDocuments(docs => docs.filter(doc => doc.document_id !== docId));
            toast.success("Document deleted successfully.");
            if (showModal) setShowModal(false);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to delete document.");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            draft: "bg-gray-100 text-gray-800",
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            archived: "bg-blue-100 text-blue-800",
            rejected: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status) => {
        const icons = {
            draft: <FileText className="h-4 w-4 text-gray-500" />,
            pending: <Clock className="h-4 w-4 text-yellow-600" />,
            approved: <CheckCircle className="h-4 w-4 text-green-600" />,
            archived: <FileCheck className="h-4 w-4 text-blue-600" />,
            rejected: <XCircle className="h-4 w-4 text-red-600" />,
        };
        return icons[status] || <FileText className="h-4 w-4 text-gray-400" />;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            "Delivery Receipt": <FileCheck className="h-4 w-4 text-green-500" />,
            "Shipping Manifest": <FileText className="h-4 w-4 text-blue-500" />,
            "Customs Declaration": <AlertTriangle className="h-4 w-4 text-yellow-500" />,
            "Waybill": <File className="h-4 w-4 text-purple-500" />,
            "Invoice": <FileText className="h-4 w-4 text-pink-500" />,
            "Other": <FolderOpen className="h-4 w-4 text-gray-500" />,
        };
        return icons[category] || <File className="h-4 w-4 text-gray-400" />;
    };

    const filteredDocs = documents
        .filter(doc => {
            if (filterStatus === "all") return true;
            return doc.status === filterStatus;
        })
        .filter(doc => {
            if (filterCategory === "all") return true;
            return doc.category === filterCategory;
        })
        .filter(doc => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                doc.title?.toLowerCase().includes(search) ||
                doc.document_number?.toLowerCase().includes(search) ||
                doc.supplier?.toLowerCase().includes(search) ||
                doc.description?.toLowerCase().includes(search)
            );
        });

    const stats = {
        total: documents.length,
        draft: documents.filter(d => d.status === "draft").length,
        pending: documents.filter(d => d.status === "pending").length,
        approved: documents.filter(d => d.status === "approved").length,
        archived: documents.filter(d => d.status === "archived").length,
    };

    const categories = ["Delivery Receipt", "Shipping Manifest", "Customs Declaration", "Waybill", "Invoice", "Other"];

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
                    <h1 className="text-2xl font-semibold">Logistics Documents</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Create and manage logistics-related documents.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Document
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg border p-4 text-center">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total Documents</p>
                </div>
                <div className="bg-white rounded-lg border p-4 text-center">
                    <File className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                    <p className="text-xs text-gray-500">Draft</p>
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
                    <FileCheck className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{stats.archived}</p>
                    <p className="text-xs text-gray-500">Archived</p>
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
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="archived">Archived</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                        setFilterCategory("all");
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
                            <th className="px-4 py-3 text-left font-medium">Category</th>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
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
                                            {getCategoryIcon(doc.category)}
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {doc.document_date ? new Date(doc.document_date).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="flex items-center justify-center gap-1">
                                            {getStatusIcon(doc.status)}
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(doc.status)}`}>
                                                {doc.status}
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
                                                onClick={() => handleDeleteDocument(doc.document_id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
                                        {selectedDoc.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Document Date</p>
                                    <p className="text-sm">{selectedDoc.document_date ? new Date(selectedDoc.document_date).toLocaleDateString() : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Supplier</p>
                                    <p className="text-sm">{selectedDoc.supplier || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Reference ID</p>
                                    <p className="text-sm">{selectedDoc.reference_id || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">Items</p>
                                    <p className="text-sm">{selectedDoc.items || 0}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-medium uppercase text-gray-500">Description</p>
                                    <p className="text-sm">{selectedDoc.description || "—"}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    onClick={() => {
                                        const doc = selectedDoc;
                                        if (!doc) {
                                            toast.error("No document to print.");
                                            return;
                                        }
                                        const date = new Date().toLocaleString();
                                        const printWindow = window.open('', '_blank', 'width=800,height=600');
                                        if (!printWindow) {
                                            toast.error("Please allow popups for this site.");
                                            return;
                                        }
                                        printWindow.document.write(`
                                            <!DOCTYPE html>
                                            <html>
                                                <head>
                                                    <title>${doc.title}</title>
                                                    <style>
                                                        body { font-family: Arial, sans-serif; padding: 40px; }
                                                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                                                        .header h1 { font-size: 24px; margin: 0; }
                                                        .header p { color: #666; margin: 5px 0; }
                                                        .doc-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
                                                        .doc-info-item { border: 1px solid #ddd; padding: 12px; border-radius: 8px; }
                                                        .doc-info-item .label { font-size: 11px; color: #666; text-transform: uppercase; font-weight: 600; }
                                                        .doc-info-item .value { font-size: 14px; font-weight: 500; margin-top: 4px; }
                                                        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                                                        @media print { body { padding: 20px; } }
                                                    </style>
                                                </head>
                                                <body>
                                                    <div class="header">
                                                        <h1>${doc.title}</h1>
                                                        <p>Document: ${doc.document_number}</p>
                                                    </div>
                                                    <div class="doc-info">
                                                        <div class="doc-info-item">
                                                            <div class="label">Category</div>
                                                            <div class="value">${doc.category}</div>
                                                        </div>
                                                        <div class="doc-info-item">
                                                            <div class="label">Status</div>
                                                            <div class="value">${doc.status}</div>
                                                        </div>
                                                        <div class="doc-info-item">
                                                            <div class="label">Document Date</div>
                                                            <div class="value">${doc.document_date ? new Date(doc.document_date).toLocaleDateString() : "—"}</div>
                                                        </div>
                                                        <div class="doc-info-item">
                                                            <div class="label">Supplier</div>
                                                            <div class="value">${doc.supplier || "—"}</div>
                                                        </div>
                                                        <div class="doc-info-item">
                                                            <div class="label">Reference ID</div>
                                                            <div class="value">${doc.reference_id || "—"}</div>
                                                        </div>
                                                        <div class="doc-info-item">
                                                            <div class="label">Items</div>
                                                            <div class="value">${doc.items || 0}</div>
                                                        </div>
                                                    </div>
                                                    ${doc.description ? `<p><strong>Description:</strong> ${doc.description}</p>` : ''}
                                                    <div class="footer">
                                                        <p>SCIMS - Supply Chain & Inventory Management System</p>
                                                        <p>Generated on: ${date}</p>
                                                    </div>
                                                    <script>
                                                        window.onload = function() { window.print(); window.close(); }
                                                    <\/script>
                                                </body>
                                            </html>
                                        `);
                                        printWindow.document.close();
                                    }}
                                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </button>
                                <button
                                    onClick={() => {
                                        const doc = selectedDoc;
                                        if (!doc) return;
                                        const data = {
                                            document: doc,
                                            exported_at: new Date().toISOString(),
                                            exported_by: "SCIMS System",
                                        };
                                        const json = JSON.stringify(data, null, 2);
                                        const blob = new Blob([json], { type: 'application/json' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${doc.document_number || doc.title.replace(/\s+/g, '_')}.json`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        window.URL.revokeObjectURL(url);
                                        toast.success("Document downloaded successfully!");
                                    }}
                                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
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

            {/* Create Document Modal */}
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
                                <h2 className="text-lg font-semibold">Add Logistics Document</h2>
                                <p className="text-sm text-gray-500">Register a new document</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateDocument} className="p-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Delivery Receipt - TRK-2026-001"
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Category *
                                </label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Document Number *
                                </label>
                                <input
                                    type="text"
                                    value={form.document_number}
                                    onChange={(e) => setForm({ ...form, document_number: e.target.value })}
                                    placeholder="e.g. DR-2026-001"
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Document Date
                                </label>
                                <input
                                    type="date"
                                    value={form.document_date}
                                    onChange={(e) => setForm({ ...form, document_date: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Supplier (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={form.supplier}
                                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                                    placeholder="e.g. ABC Hotel Supplies"
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows="2"
                                    placeholder="Brief description of the document..."
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Reference ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={form.reference_id}
                                    onChange={(e) => setForm({ ...form, reference_id: e.target.value })}
                                    placeholder="e.g. PO-2026-001"
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
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
                                        <Plus className="h-4 w-4" />
                                    )}
                                    {actionLoading ? "Creating..." : "Create Document"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}