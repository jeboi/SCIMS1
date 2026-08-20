"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Package, Warehouse, MapPin, ArrowRight, ArrowLeft,
    Loader2, Search, Eye, CheckCircle, XCircle,
    RefreshCw, Activity, AlertTriangle
} from "lucide-react";

export default function WarehouseOperationsPage() {
    const [items, setItems] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [storageLocations, setStorageLocations] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [operationType, setOperationType] = useState("move");
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [newTransactionIds, setNewTransactionIds] = useState([]);

    // Form state
    const [form, setForm] = useState({
        item_id: "",
        warehouse_id: "",
        location_id: "",
        quantity: 1,
        target_warehouse_id: "",
        target_location_id: "",
        adjustment_type: "increase",
    });

    useEffect(() => {
    loadData();
}, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const [itemsRes, warehousesRes, locationsRes, transactionsRes] = await Promise.all([
                axiosInstance.get("/items"),
                axiosInstance.get("/warehouses"),
                axiosInstance.get("/storage-locations"),
                axiosInstance.get("/inventory-transactions"),
            ]);
            setItems(itemsRes.data?.data || []);
            setWarehouses(warehousesRes.data?.data || []);
            setStorageLocations(locationsRes.data?.data || []);
            setTransactions(transactionsRes.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load data.");
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (type) => {
        setOperationType(type);
        setForm({
            item_id: "",
            warehouse_id: warehouses.length > 0 ? String(warehouses[0].warehouse_id) : "",
            location_id: "",
            quantity: 1,
            target_warehouse_id: "",
            target_location_id: "",
            adjustment_type: "increase",
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (submitting) return;
        setShowModal(false);
        setForm({
            item_id: "",
            warehouse_id: "",
            location_id: "",
            quantity: 1,
            target_warehouse_id: "",
            target_location_id: "",
            adjustment_type: "increase",
        });
    };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.item_id) {
        toast.error("Please select an item.");
        return;
    }

    if (!form.warehouse_id) {
        toast.error("Please select a warehouse.");
        return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
        toast.error("Quantity must be greater than zero.");
        return;
    }

    try {
        setSubmitting(true);

        const item = items.find(i => String(i.item_id) === String(form.item_id));
        if (!item) {
            toast.error("Selected item not found.");
            return;
        }

        let createdTransactionIds = [];

        if (operationType === "move") {
            if (!form.location_id) {
                toast.error("Please select a storage location.");
                return;
            }

            const response1 = await axiosInstance.post("/inventory-transactions", {
                item_id: Number(form.item_id),
                warehouse_id: Number(form.warehouse_id),
                transaction_type: "transfer_out",
                quantity: Number(form.quantity),
                reference_no: `MOVE-${Date.now()}`,
                transaction_date: new Date().toISOString(),
                performed_by: 1,
            });
            const tx1 = response1.data?.data;
            if (tx1 && tx1.transaction_id) {
                createdTransactionIds.push(tx1.transaction_id);
            }

            const response2 = await axiosInstance.post("/inventory-transactions", {
                item_id: Number(form.item_id),
                warehouse_id: Number(form.warehouse_id),
                location_id: Number(form.location_id),
                transaction_type: "transfer_in",
                quantity: Number(form.quantity),
                reference_no: `MOVE-${Date.now()}`,
                transaction_date: new Date().toISOString(),
                performed_by: 1,
            });
            const tx2 = response2.data?.data;
            if (tx2 && tx2.transaction_id) {
                createdTransactionIds.push(tx2.transaction_id);
            }

            toast.success(`Item moved to location successfully!`);

        } else if (operationType === "transfer") {
            if (!form.target_warehouse_id) {
                toast.error("Please select a target warehouse.");
                return;
            }

            const response1 = await axiosInstance.post("/inventory-transactions", {
                item_id: Number(form.item_id),
                warehouse_id: Number(form.warehouse_id),
                transaction_type: "transfer_out",
                quantity: Number(form.quantity),
                reference_no: `TRANSFER-${Date.now()}`,
                transaction_date: new Date().toISOString(),
                performed_by: 1,
            });
            const tx1 = response1.data?.data;
            if (tx1 && tx1.transaction_id) {
                createdTransactionIds.push(tx1.transaction_id);
            }

            const response2 = await axiosInstance.post("/inventory-transactions", {
                item_id: Number(form.item_id),
                warehouse_id: Number(form.target_warehouse_id),
                ...(form.target_location_id ? { location_id: Number(form.target_location_id) } : {}),
                transaction_type: "transfer_in",
                quantity: Number(form.quantity),
                reference_no: `TRANSFER-${Date.now()}`,
                transaction_date: new Date().toISOString(),
                performed_by: 1,
            });
            const tx2 = response2.data?.data;
            if (tx2 && tx2.transaction_id) {
                createdTransactionIds.push(tx2.transaction_id);
            }

            toast.success(`Item transferred to warehouse successfully!`);

        } else if (operationType === "adjustment") {
            const quantity = form.adjustment_type === "increase" 
                ? Number(form.quantity) 
                : -Number(form.quantity);

            const response = await axiosInstance.post("/inventory-transactions", {
                item_id: Number(form.item_id),
                warehouse_id: Number(form.warehouse_id),
                transaction_type: "adjustment",
                quantity: quantity,
                reference_no: `ADJ-${Date.now()}`,
                transaction_date: new Date().toISOString(),
                performed_by: 1,
            });
            const tx = response.data?.data;
            if (tx && tx.transaction_id) {
                createdTransactionIds.push(tx.transaction_id);
            }

            toast.success(`Stock adjusted successfully!`);
        }

        // Reload data first to get fresh transactions
        await loadData();

        // Set the highlight IDs after data is loaded
        if (createdTransactionIds.length > 0) {
            // Wait a moment for the DOM to update
            setTimeout(() => {
                setNewTransactionIds(createdTransactionIds);
                
                // Remove highlights after 5 seconds (no fade)
                setTimeout(() => {
                    setNewTransactionIds([]);
                }, 150000);
            }, 100);
        }

        setShowModal(false);
        setForm({
            item_id: "",
            warehouse_id: "",
            location_id: "",
            quantity: 1,
            target_warehouse_id: "",
            target_location_id: "",
            adjustment_type: "increase",
        });

    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Operation failed.";
        toast.error(msg);
    } finally {
        setSubmitting(false);
    }
};

    const getWarehouseName = (id) => {
        const wh = warehouses.find(w => w.warehouse_id === id);
        return wh ? wh.warehouse_name : "Unknown";
    };

    const getLocationName = (id) => {
        const loc = storageLocations.find(l => l.location_id === id);
        return loc ? loc.location_code : "Unknown";
    };

    const getItemName = (id) => {
        const item = items.find(i => i.item_id === id);
        return item ? item.item_name : "Unknown";
    };

    const filteredTransactions = transactions.filter((tx) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
            getItemName(tx.item_id).toLowerCase().includes(search) ||
            getWarehouseName(tx.warehouse_id).toLowerCase().includes(search) ||
            tx.transaction_type.includes(search);
        const matchesFilter = filterType ? tx.transaction_type === filterType : true;
        return matchesSearch && matchesFilter;
    });

    const filteredLocations = storageLocations.filter(
        (loc) => String(loc.warehouse_id) === String(form.warehouse_id)
    );

    const filteredTargetLocations = storageLocations.filter(
        (loc) => String(loc.warehouse_id) === String(form.target_warehouse_id)
    );

    const getTransactionIcon = (type) => {
        const icons = {
            receiving: <Package className="h-4 w-4 text-green-600" />,
            transfer_in: <ArrowRight className="h-4 w-4 text-blue-600" />,
            transfer_out: <ArrowLeft className="h-4 w-4 text-orange-600" />,
            adjustment: <Activity className="h-4 w-4 text-purple-600" />,
            return: <RefreshCw className="h-4 w-4 text-red-600" />,
            issuing: <Package className="h-4 w-4 text-yellow-600" />,
        };
        return icons[type] || <Activity className="h-4 w-4 text-gray-400" />;
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
                    <h1 className="text-2xl font-semibold">Warehouse Operations</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Move, transfer, and adjust inventory items.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleOpenModal("move")}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <ArrowRight className="inline h-4 w-4 mr-2" />
                        Move Items
                    </button>
                    <button
                        onClick={() => handleOpenModal("transfer")}
                        className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
                    >
                        <Warehouse className="inline h-4 w-4 mr-2" />
                        Transfer Items
                    </button>
                    <button
                        onClick={() => handleOpenModal("adjustment")}
                        className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
                    >
                        <Activity className="inline h-4 w-4 mr-2" />
                        Adjust Stock
                    </button>
                    <button
                        onClick={loadData}
                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Move Operations</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {transactions.filter(tx => tx.transaction_type === "transfer_in" || tx.transaction_type === "transfer_out").length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Adjustments</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {transactions.filter(tx => tx.transaction_type === "adjustment").length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Total Items in System</p>
                    <p className="text-2xl font-bold text-green-600">{items.length}</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg border p-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Types</option>
                        <option value="receiving">Receiving</option>
                        <option value="transfer_in">Transfer In</option>
                        <option value="transfer_out">Transfer Out</option>
                        <option value="adjustment">Adjustment</option>
                        <option value="return">Return</option>
                        <option value="issuing">Issuing</option>
                    </select>
                </div>
                <button
                    onClick={() => {
                        setSearchTerm("");
                        setFilterType("");
                    }}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                >
                    Clear
                </button>
            </div>

            {/* Transactions Table */}
<div className="overflow-x-auto rounded-lg border bg-white">
    <table className="min-w-full text-sm">
        <thead className="border-b bg-gray-50">
            <tr>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Item</th>
                <th className="px-4 py-3 text-left font-medium">Warehouse</th>
                <th className="px-4 py-3 text-right font-medium">Quantity</th>
                <th className="px-4 py-3 text-left font-medium">Reference</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
            </tr>
        </thead>
        <tbody className="divide-y">
            {filteredTransactions.length === 0 ? (
                <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No transactions found.
                    </td>
                </tr>
            ) : (
                filteredTransactions.slice().reverse().slice(0, 50).map((tx) => {
                    const isNew = newTransactionIds.includes(tx.transaction_id);
                    
                    let highlightClass = "";
                    if (isNew) {
                        if (tx.transaction_type === "transfer_in" || tx.transaction_type === "transfer_out") {
                            highlightClass = "bg-blue-100 border-l-4 border-blue-500";
                        } else if (tx.transaction_type === "adjustment") {
                            highlightClass = "bg-purple-100 border-l-4 border-purple-500";
                        } else if (tx.transaction_type === "receiving") {
                            highlightClass = "bg-green-100 border-l-4 border-green-500";
                        } else {
                            highlightClass = "bg-yellow-100 border-l-4 border-yellow-500";
                        }
                    }
                    
                    return (
                        <tr 
                            key={tx.transaction_id} 
                            className={`${highlightClass} hover:bg-gray-50`}
                        >
                            <td className="px-4 py-3">
                                <span className="flex items-center gap-2">
                                    {getTransactionIcon(tx.transaction_type)}
                                    <span className="capitalize">{tx.transaction_type.replace("_", " ")}</span>
                                </span>
                            </td>
                            <td className="px-4 py-3">{getItemName(tx.item_id)}</td>
                            <td className="px-4 py-3">{getWarehouseName(tx.warehouse_id)}</td>
                            <td className="px-4 py-3 text-right font-medium">
                                {tx.quantity}
                            </td>
                            <td className="px-4 py-3">{tx.reference_no || "—"}</td>
                            <td className="px-4 py-3">
                                {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString() : "—"}
                            </td>
                        </tr>
                    );
                })
            )}
        </tbody>
    </table>
</div>

            {/* Operation Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {operationType === "move" && "Move Items"}
                                    {operationType === "transfer" && "Transfer Items"}
                                    {operationType === "adjustment" && "Adjust Stock"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {operationType === "move" && "Move items to a different storage location"}
                                    {operationType === "transfer" && "Transfer items to another warehouse"}
                                    {operationType === "adjustment" && "Increase or decrease stock quantity"}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="text-2xl text-gray-400 hover:text-gray-600 transition"
                            >
                                ×
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Item */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Item *</label>
                                <select
                                    name="item_id"
                                    value={form.item_id}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select item</option>
                                    {items.map((item) => (
                                        <option key={item.item_id} value={item.item_id}>
                                            {item.item_name} (Stock: {item.current_stock})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Source Warehouse */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Source Warehouse *
                                </label>
                                <select
                                    name="warehouse_id"
                                    value={form.warehouse_id}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select warehouse</option>
                                    {warehouses.map((wh) => (
                                        <option key={wh.warehouse_id} value={wh.warehouse_id}>
                                            {wh.warehouse_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Source Location (for move only) */}
                            {operationType === "move" && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Destination Location *
                                    </label>
                                    <select
                                        name="location_id"
                                        value={form.location_id}
                                        onChange={handleChange}
                                        className="w-full rounded border px-3 py-2 text-sm"
                                        required
                                    >
                                        <option value="">
                                            {!form.warehouse_id 
                                                ? "Select warehouse first"
                                                : filteredLocations.length === 0
                                                ? "No locations available"
                                                : "Select location"}
                                        </option>
                                        {filteredLocations.map((loc) => (
                                            <option key={loc.location_id} value={loc.location_id}>
                                                {loc.location_code} - {loc.location_name || "No name"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Target Warehouse (for transfer only) */}
                            {operationType === "transfer" && (
                                <>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Target Warehouse *
                                        </label>
                                        <select
                                            name="target_warehouse_id"
                                            value={form.target_warehouse_id}
                                            onChange={handleChange}
                                            className="w-full rounded border px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Select target warehouse</option>
                                            {warehouses
                                                .filter(wh => String(wh.warehouse_id) !== String(form.warehouse_id))
                                                .map((wh) => (
                                                    <option key={wh.warehouse_id} value={wh.warehouse_id}>
                                                        {wh.warehouse_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Target Location (optional)
                                        </label>
                                        <select
                                            name="target_location_id"
                                            value={form.target_location_id}
                                            onChange={handleChange}
                                            className="w-full rounded border px-3 py-2 text-sm"
                                        >
                                            <option value="">Select location (optional)</option>
                                            {filteredTargetLocations.map((loc) => (
                                                <option key={loc.location_id} value={loc.location_id}>
                                                    {loc.location_code} - {loc.location_name || "No name"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Quantity */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            {/* Adjustment Type */}
                            {operationType === "adjustment" && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Adjustment Type *
                                    </label>
                                    <select
                                        name="adjustment_type"
                                        value={form.adjustment_type}
                                        onChange={handleChange}
                                        className="w-full rounded border px-3 py-2 text-sm"
                                    >
                                        <option value="increase">Increase Stock</option>
                                        <option value="decrease">Decrease Stock</option>
                                    </select>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    {submitting 
                                        ? "Processing..." 
                                        : operationType === "move" ? "Move"
                                        : operationType === "transfer" ? "Transfer"
                                        : "Adjust"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}