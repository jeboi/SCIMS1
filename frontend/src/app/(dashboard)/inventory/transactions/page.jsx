"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { getItems } from "@/services/api";
import { getWarehouses } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

function TransactionsContent() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { user } = useAuth();

    const [filters, setFilters] = useState({
        transaction_type: "",
        warehouse_id: "",
        item_id: "",
        from_date: "",
        to_date: "",
    });

    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        item_id: "",
        warehouse_id: "",
        transaction_type: "receiving",
        quantity: 0,
        reference_no: "",
        transaction_date: new Date().toISOString().slice(0, 16),
    });

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError("");
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== "")
            );
            const response = await axiosInstance.get("/inventory-transactions", { params });
            const data = response.data?.data;
            setTransactions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load transactions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = () => {
        setForm({
            item_id: "",
            warehouse_id: "",
            transaction_type: "receiving",
            quantity: 0,
            reference_no: "",
            transaction_date: new Date().toISOString().slice(0, 16),
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (saving) return;
        setShowModal(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.item_id || !form.warehouse_id || form.quantity <= 0) {
            toast.error("Please fill all required fields with valid values.");
            return;
        }

        if (!user) {
            toast.error("You must be logged in.");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                item_id: Number(form.item_id),
                warehouse_id: Number(form.warehouse_id),
                transaction_type: form.transaction_type,
                quantity: Number(form.quantity),
                reference_no: form.reference_no.trim(),
                transaction_date: new Date(form.transaction_date).toISOString(),
                performed_by: user.id,
            };
            await axiosInstance.post("/inventory-transactions", payload);
            toast.success("Transaction created successfully.");
            setShowModal(false);
            fetchTransactions();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to create transaction.");
        } finally {
            setSaving(false);
        }
    };

    const [items, setItems] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [itemsRes, warehousesRes] = await Promise.all([
                    axiosInstance.get("/items"),
                    axiosInstance.get("/warehouses"),
                ]);
                setItems(itemsRes.data?.data || []);
                setWarehouses(warehousesRes.data?.data || []);
            } catch (err) {
                console.error("Failed to load dropdown data:", err);
            }
        };
        if (showModal) {
            fetchDropdownData();
        }
    }, [showModal]);

    const getTypeBadge = (type) => {
        const colors = {
            receiving: "bg-green-100 text-green-800",
            transfer_in: "bg-blue-100 text-blue-800",
            transfer_out: "bg-yellow-100 text-yellow-800",
            return: "bg-red-100 text-red-800",
            adjustment: "bg-purple-100 text-purple-800",
        };
        return colors[type] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Inventory Transactions</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        View and manage inventory movements.
                    </p>
                </div>

                {/* RBAC: creating a transaction writes stock movements → inventory.adjust */}
                <Can permission={PERMISSIONS.INVENTORY_ADJUST}>
                    <button
                        onClick={handleOpenModal}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + New Transaction
                    </button>
                </Can>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600">Type</label>
                    <select
                        name="transaction_type"
                        value={filters.transaction_type}
                        onChange={handleFilterChange}
                        className="mt-1 rounded border px-3 py-1.5 text-sm"
                    >
                        <option value="">All</option>
                        <option value="receiving">Receiving</option>
                        <option value="transfer_in">Transfer In</option>
                        <option value="transfer_out">Transfer Out</option>
                        <option value="return">Return</option>
                        <option value="adjustment">Adjustment</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600">From</label>
                    <input
                        type="date"
                        name="from_date"
                        value={filters.from_date}
                        onChange={handleFilterChange}
                        className="mt-1 rounded border px-3 py-1.5 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600">To</label>
                    <input
                        type="date"
                        name="to_date"
                        value={filters.to_date}
                        onChange={handleFilterChange}
                        className="mt-1 rounded border px-3 py-1.5 text-sm"
                    />
                </div>
                <button
                    onClick={() => setFilters({ transaction_type: "", warehouse_id: "", item_id: "", from_date: "", to_date: "" })}
                    className="rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300"
                >
                    Clear
                </button>
            </div>

            {/* Table */}
            {loading && <p className="text-sm text-gray-500">Loading transactions...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">ID</th>
                                <th className="px-4 py-3 text-left font-medium">Item</th>
                                <th className="px-4 py-3 text-left font-medium">Warehouse</th>
                                <th className="px-4 py-3 text-left font-medium">Type</th>
                                <th className="px-4 py-3 text-right font-medium">Quantity</th>
                                <th className="px-4 py-3 text-left font-medium">Reference</th>
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.transaction_id}>
                                        <td className="px-4 py-3">{tx.transaction_id}</td>
                                        <td className="px-4 py-3">
                                            {tx.item?.item_name || "N/A"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {tx.warehouse?.warehouse_name || "N/A"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadge(tx.transaction_type)}`}>
                                                {tx.transaction_type.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">{tx.quantity}</td>
                                        <td className="px-4 py-3">{tx.reference_no || "—"}</td>
                                        <td className="px-4 py-3">
                                            {new Date(tx.transaction_date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => e.target === e.currentTarget && handleCloseModal()}
                >
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-lg font-semibold">New Inventory Transaction</h2>
                            <button onClick={handleCloseModal} disabled={saving} className="text-xl text-gray-400 hover:text-gray-600">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Item</label>
                                <select
                                    name="item_id"
                                    value={form.item_id}
                                    onChange={handleFormChange}
                                    className="w-full rounded border px-3 py-2.5 text-sm"
                                    required
                                >
                                    <option value="">Select item</option>
                                    {items.map((item) => (
                                        <option key={item.item_id} value={item.item_id}>
                                            {item.item_name} (SKU: {item.barcode})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Warehouse</label>
                                <select
                                    name="warehouse_id"
                                    value={form.warehouse_id}
                                    onChange={handleFormChange}
                                    className="w-full rounded border px-3 py-2.5 text-sm"
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

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Transaction Type</label>
                                <select
                                    name="transaction_type"
                                    value={form.transaction_type}
                                    onChange={handleFormChange}
                                    className="w-full rounded border px-3 py-2.5 text-sm"
                                >
                                    <option value="receiving">Receiving</option>
                                    <option value="transfer_in">Transfer In</option>
                                    <option value="transfer_out">Transfer Out</option>
                                    <option value="return">Return</option>
                                    <option value="adjustment">Adjustment</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    value={form.quantity}
                                    onChange={handleFormChange}
                                    className="w-full rounded border px-3 py-2.5 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Reference No. (optional)</label>
                                <input
                                    type="text"
                                    name="reference_no"
                                    value={form.reference_no}
                                    onChange={handleFormChange}
                                    placeholder="e.g. PO-2026-001"
                                    className="w-full rounded border px-3 py-2.5 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Transaction Date</label>
                                <input
                                    type="datetime-local"
                                    name="transaction_date"
                                    value={form.transaction_date}
                                    onChange={handleFormChange}
                                    className="w-full rounded border px-3 py-2.5 text-sm"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={saving}
                                    className="rounded border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {saving ? "Saving..." : "Create Transaction"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TransactionsPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.INVENTORY_VIEW}>
            <TransactionsContent />
        </PermissionGuard>
    );
}