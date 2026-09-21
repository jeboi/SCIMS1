"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import JsBarcode from "jsbarcode";
import { QRCodeCanvas } from "qrcode.react";
import { Loader2 } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";

const initialForm = {
    category_id: "",
    barcode: "",
    item_name: "",
    unit: "",
    reorder_level: 0,
    current_stock: 0,
    status: "active",
};

const normalizeApiData = (responseData) => {
    let data = responseData;

    if (typeof data === "string") {
        data = data
            .replace(/^```(?:php|json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        try {
            data = JSON.parse(data);
        } catch (error) {
            console.error("Failed to parse API response:", error);
            return null;
        }
    }

    return data;
};

function ItemsContent() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState(initialForm);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryForm, setCategoryForm] = useState({ category_name: "", description: "" });
    const [savingCategory, setSavingCategory] = useState(false);

    const [scanMode, setScanMode] = useState(false);
    const [scanInput, setScanInput] = useState("");
    const [scanLoading, setScanLoading] = useState(false);
    const [scannedItem, setScannedItem] = useState(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/items");
            const data = response.data?.data;

            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("========== ITEMS ERROR ==========");
            console.error("Error:", err);
            console.error("Message:", err.message);
            console.error("Response:", err.response);
            console.error("Response data:", err.response?.data);
            console.error("Response status:", err.response?.status);

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to load items."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);

            const response = await axiosInstance.get("/categories");

            const normalizedResponse = normalizeApiData(response.data);
            const data = normalizedResponse?.data;

            if (!Array.isArray(data)) {
                console.error("Categories data is not an array:", data);
                setCategories([]);
                return;
            }

            setCategories(data);
        } catch (err) {
            console.error("========== CATEGORIES ERROR ==========");
            console.error("Error:", err);
            console.error("Message:", err.message);
            console.error("Response:", err.response);
            console.error("Response data:", err.response?.data);

            setCategories([]);

            toast.error(
                err.response?.data?.message ||
                    "Failed to load categories."
            );
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const generateUniqueBarcode = async () => {
        try {
            const response = await axiosInstance.get("/items");
            const existingItems = response.data?.data || [];

            const existingNumbers = existingItems
                .map(item => {
                    if (!item.barcode) return 0;
                    const match = item.barcode.match(/SCIMS-(\d{6})/);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter(num => num > 0);

            let nextNumber = 1;
            existingNumbers.sort((a, b) => a - b);
            for (let i = 1; i <= existingNumbers.length + 1; i++) {
                if (!existingNumbers.includes(i)) {
                    nextNumber = i;
                    break;
                }
            }

            return `SCIMS-${String(nextNumber).padStart(6, '0')}`;
        } catch (error) {
            console.error("Failed to generate barcode:", error);
            return `SCIMS-${Date.now().toString().slice(-6)}`;
        }
    };

    const handleScanBarcode = async () => {
        if (!scanInput.trim()) {
            toast.error("Please enter or scan a barcode.");
            return;
        }

        try {
            setScanLoading(true);
            const searchValue = scanInput.trim();

            let response = await axiosInstance.get("/items", {
                params: { barcode: searchValue }
            });
            let items = response.data?.data || [];

            if (items.length === 0) {
                response = await axiosInstance.get("/items", {
                    params: { search: searchValue }
                });
                items = response.data?.data || [];
            }

            if (items.length > 0) {
                const foundItem = items[0];
                setForm({
                    category_id: foundItem.category_id || "",
                    barcode: foundItem.barcode,
                    item_name: foundItem.item_name,
                    unit: foundItem.unit || "",
                    reorder_level: foundItem.reorder_level || 0,
                    current_stock: foundItem.current_stock || 0,
                    status: foundItem.status || "active",
                });
                setScannedItem(foundItem);
                toast.success(`Item found: ${foundItem.item_name}`);
                setScanMode(false);
                setScanInput("");
            } else {
                setForm((prev) => ({
                    ...prev,
                    barcode: searchValue,
                }));
                setScannedItem(null);
                toast.success(`Barcode ${searchValue} is available. Fill in the details.`);
                setScanMode(false);
                setScanInput("");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to scan barcode.");
        } finally {
            setScanLoading(false);
        }
    };

    const handleOpenAddModal = async () => {
        const uniqueBarcode = await generateUniqueBarcode();
        setForm({
            ...initialForm,
            barcode: uniqueBarcode,
        });
        setScanMode(false);
        setScanInput("");
        setScannedItem(null);
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        if (saving) return;
        setShowAddModal(false);
        setForm(initialForm);
        setScannedItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.category_id)                    { toast.error("Please select a category."); return; }
        if (!form.barcode.trim())                 { toast.error("Barcode is required."); return; }
        if (!form.item_name.trim())               { toast.error("Item name is required."); return; }
        if (!form.unit.trim())                    { toast.error("Unit is required."); return; }
        if (Number(form.reorder_level) < 0)       { toast.error("Reorder level cannot be negative."); return; }
        if (Number(form.current_stock) < 0)       { toast.error("Current stock cannot be negative."); return; }

        try {
            setSaving(true);

            const payload = {
                category_id: Number(form.category_id),
                barcode: form.barcode.trim(),
                item_name: form.item_name.trim(),
                unit: form.unit.trim(),
                reorder_level: Number(form.reorder_level),
                current_stock: Number(form.current_stock),
                status: form.status,
            };

            await axiosInstance.post("/items", payload);

            toast.success(`Item created successfully! Barcode: ${form.barcode}`);

            setShowAddModal(false);
            setForm(initialForm);
            await fetchItems();
            await fetchCategories();
        } catch (err) {
            console.error("========== CREATE ITEM ERROR ==========");
            console.error("Error:", err);
            console.error("Response:", err.response);
            console.error("Response data:", err.response?.data);

            const validationErrors = err.response?.data?.errors;
            if (validationErrors) {
                const firstError = Object.values(validationErrors)?.[0]?.[0];
                toast.error(firstError || "Please check the form fields.");
            } else {
                toast.error(err.response?.data?.message || "Failed to create item.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleOpenCategoryModal = () => {
        setCategoryForm({ category_name: "", description: "" });
        setShowCategoryModal(true);
    };

    const handleCloseCategoryModal = () => {
        if (savingCategory) return;
        setShowCategoryModal(false);
        setCategoryForm({ category_name: "", description: "" });
    };

    const handleCategoryChange = (e) => {
        const { name, value } = e.target;
        setCategoryForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!categoryForm.category_name.trim()) {
            toast.error("Category name is required.");
            return;
        }
        try {
            setSavingCategory(true);
            const response = await axiosInstance.post("/categories", {
                category_name: categoryForm.category_name.trim(),
                description: categoryForm.description.trim() || null,
            });
            toast.success("Category created successfully.");
            setShowCategoryModal(false);
            await fetchCategories();
            const newCategory = response.data?.data;
            if (newCategory && newCategory.category_id) {
                setForm((prev) => ({ ...prev, category_id: newCategory.category_id }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create category.");
        } finally {
            setSavingCategory(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Item Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage inventory items and their stock information.
                    </p>
                </div>

                {/* RBAC: only inventory.create can see Add Item */}
                <Can permission={PERMISSIONS.INVENTORY_CREATE}>
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        + Add Item
                    </button>
                </Can>
            </div>

            {/* Loading */}
            {loading && (
                <div className="rounded-lg border bg-white p-6">
                    <p className="text-sm text-gray-500">
                        Loading items...
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchItems}
                            className="text-sm font-medium text-red-700 hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <div className="overflow-hidden rounded-lg border bg-white">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Barcode</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Item Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Unit</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Stock</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Reorder Level</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-sm text-gray-500">
                                            No items found.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.item_id}>
                                            <td className="px-4 py-3 text-sm">{item.item_id}</td>
                                            <td className="px-4 py-3 text-sm">{item.barcode}</td>
                                            <td className="px-4 py-3 text-sm font-medium">{item.item_name}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {item.category?.category_name || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{item.unit}</td>
                                            <td className="px-4 py-3 text-right text-sm">{item.current_stock}</td>
                                            <td className="px-4 py-3 text-right text-sm">{item.reorder_level}</td>
                                            <td className="px-4 py-3 text-sm">{item.status}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Item Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseAddModal();
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Add Item
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Add a new inventory item.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseAddModal}
                                disabled={saving}
                                className="text-xl text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        {/* Form Body */}
                        <form
                            onSubmit={handleSubmit}
                            className="overflow-y-auto p-6 space-y-4 flex-1"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {/* Category */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Category
                                    </label>

                                    {/* RBAC: only inventory.create can add a new category here */}
                                    <Can permission={PERMISSIONS.INVENTORY_CREATE}>
                                        <button
                                            type="button"
                                            onClick={handleOpenCategoryModal}
                                            className="text-sm text-blue-600 hover:text-blue-800 transition"
                                            disabled={saving}
                                        >
                                            + Add New Category
                                        </button>
                                    </Can>
                                </div>
                                <select
                                    name="category_id"
                                    value={form.category_id}
                                    onChange={handleChange}
                                    disabled={categoriesLoading || saving}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
                                    required
                                >
                                    <option value="">
                                        {categoriesLoading
                                            ? "Loading categories..."
                                            : categories.length === 0
                                            ? "No categories available"
                                            : "Select category"}
                                    </option>
                                    {categories.map((category) => (
                                        <option key={category.category_id} value={category.category_id}>
                                            {category.category_name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    {categoriesLoading
                                        ? "Loading..."
                                        : `${categories.length} categor${categories.length === 1 ? "y" : "ies"} available`}
                                </p>
                            </div>

                            {/* Barcode */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Barcode {!scanMode && !scannedItem && "(Auto-generated)"}
                                        {scannedItem && <span className="text-xs text-gray-400 ml-1">(Read-only)</span>}
                                    </label>

                                    {/* RBAC: only inventory.create can trigger the scan flow */}
                                    <Can permission={PERMISSIONS.INVENTORY_CREATE}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (scanMode) {
                                                    setScanMode(false);
                                                    setScanInput("");
                                                } else {
                                                    setScanMode(true);
                                                    if (form.barcode) {
                                                        setScanInput(form.barcode);
                                                    }
                                                }
                                            }}
                                            disabled={!!scannedItem}
                                            className={`text-sm transition flex items-center gap-1 ${
                                                scannedItem
                                                    ? "text-gray-400 cursor-not-allowed"
                                                    : "text-blue-600 hover:text-blue-800"
                                            }`}
                                        >
                                            {scanMode ? (
                                                "Cancel Scan"
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A11.77 11.77 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.944 21.944 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                                                    </svg>
                                                    Scan Barcode
                                                </>
                                            )}
                                        </button>
                                    </Can>
                                </div>

                                {scanMode ? (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={scanInput}
                                            onChange={(e) => setScanInput(e.target.value)}
                                            placeholder="Enter or scan barcode..."
                                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleScanBarcode();
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={handleScanBarcode}
                                            disabled={scanLoading}
                                            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {scanLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A11.77 11.77 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.944 21.944 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                                                </svg>
                                            )}
                                            {scanLoading ? "Scanning..." : "Scan"}
                                        </button>
                                    </div>
                                ) : (
                                    <input
                                        name="barcode"
                                        type="text"
                                        value={form.barcode}
                                        onChange={handleChange}
                                        disabled={saving || !!scannedItem}
                                        readOnly={!!scannedItem}
                                        className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none ${
                                            scannedItem
                                                ? "bg-gray-50 cursor-not-allowed"
                                                : "bg-gray-50 cursor-not-allowed"
                                        }`}
                                        required
                                    />
                                )}
                                <p className="mt-1 text-xs text-gray-400">
                                    {scanMode
                                        ? "Enter a barcode to search for an existing item, or create a new one."
                                        : scannedItem
                                        ? "Barcode is locked because this is an existing item."
                                        : "Barcode is automatically generated and unique for each item."}
                                </p>
                            </div>

                            {/* Item Name */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Item Name {scannedItem && <span className="text-xs text-gray-400">(Read-only — scanned item)</span>}
                                </label>
                                <input
                                    name="item_name"
                                    type="text"
                                    value={form.item_name}
                                    onChange={handleChange}
                                    disabled={saving || !!scannedItem}
                                    readOnly={!!scannedItem}
                                    placeholder="e.g. Laundry Detergent"
                                    className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 ${
                                        scannedItem ? "bg-gray-50 cursor-not-allowed" : ""
                                    }`}
                                    required
                                />
                                {scannedItem && (
                                    <p className="mt-1 text-xs text-blue-600">
                                        This item already exists. You can update stock and reorder level below.
                                    </p>
                                )}
                            </div>

                            {/* Unit */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Unit
                                </label>
                                <input
                                    name="unit"
                                    type="text"
                                    value={form.unit}
                                    onChange={handleChange}
                                    disabled={saving}
                                    placeholder="e.g. bottle, box, piece"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
                                    required
                                />
                            </div>

                            {/* Stock fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Reorder Level
                                    </label>
                                    <input
                                        name="reorder_level"
                                        type="number"
                                        min="0"
                                        value={form.reorder_level}
                                        onChange={handleChange}
                                        disabled={saving}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Current Stock
                                    </label>
                                    <input
                                        name="current_stock"
                                        type="number"
                                        min="0"
                                        value={form.current_stock}
                                        onChange={handleChange}
                                        disabled={saving}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </form>

                        {/* Modal Footer — reachable only via Add flow, which is already gated */}
                        <div className="flex justify-end gap-3 border-t px-6 py-4 shrink-0">
                            <button
                                type="button"
                                onClick={handleCloseAddModal}
                                disabled={saving}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? "Saving..." : scannedItem ? "Update Item" : "Save Item"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {showCategoryModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) handleCloseCategoryModal();
                    }}
                >
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                            <h2 className="text-lg font-semibold text-gray-900">Add New Category</h2>
                            <button
                                type="button"
                                onClick={handleCloseCategoryModal}
                                disabled={savingCategory}
                                className="text-xl text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>
                        <form
                            onSubmit={handleCreateCategory}
                            className="overflow-y-auto p-6 space-y-4 flex-1"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Category Name
                                </label>
                                <input
                                    name="category_name"
                                    type="text"
                                    value={categoryForm.category_name}
                                    onChange={handleCategoryChange}
                                    disabled={savingCategory}
                                    placeholder="e.g. Beverages"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Description (optional)
                                </label>
                                <textarea
                                    name="description"
                                    value={categoryForm.description}
                                    onChange={handleCategoryChange}
                                    disabled={savingCategory}
                                    rows="3"
                                    placeholder="Brief description of the category"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
                                />
                            </div>
                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseCategoryModal}
                                    disabled={savingCategory}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingCategory}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {savingCategory ? "Creating..." : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ItemsPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.INVENTORY_VIEW}>
            <ItemsContent />
        </PermissionGuard>
    );
}