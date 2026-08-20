"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

export default function Page() {
    const [suppliers, setSuppliers] = useState([]);
    const [quotations, setQuotations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showSupplierForm, setShowSupplierForm] = useState(false);
    const [showQuotationForm, setShowQuotationForm] = useState(false);
    const [showEditSupplierForm, setShowEditSupplierForm] = useState(false);
    const [showEditQuotationForm, setShowEditQuotationForm] = useState(false);
    const [editingQuotation, setEditingQuotation] = useState(null);

    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const [supplierForm, setSupplierForm] = useState({
        supplier_name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        status: "active",
        rating: "",
    });

    const [quotationForm, setQuotationForm] = useState({
        supplier_id: "",
        quotation_no: "",
        quotation_date: "",
        status: "pending",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [suppliersResponse, quotationsResponse] =
                await Promise.all([
                    axiosInstance.get("/suppliers"),
                    axiosInstance.get("/supplier-quotations"),
                ]);

            setSuppliers(suppliersResponse.data.data || []);
            setQuotations(quotationsResponse.data.data || []);
        } catch (error) {
            console.error(
                "Failed to load supplier sourcing data:",
                error
            );

            setError(
                "Unable to load supplier sourcing data. Please check the API connection."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSupplierChange = (event) => {
        const { name, value } = event.target;

        setSupplierForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleQuotationChange = (event) => {
        const { name, value } = event.target;

        setQuotationForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const resetSupplierForm = () => {
        setSupplierForm({
            supplier_name: "",
            contact_person: "",
            phone: "",
            email: "",
            address: "",
            status: "active",
            rating: "",
        });
    };

    const resetQuotationForm = () => {
        setQuotationForm({
            supplier_id: "",
            quotation_no: "",
            quotation_date: "",
            status: "pending",
        });
    };

    const handleCreateSupplier = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!supplierForm.supplier_name.trim()) {
            setError("Supplier name is required.");
            return;
        }

        try {
            setSubmitting(true);

            const body = {
                supplier_name: supplierForm.supplier_name.trim(),
                contact_person:
                    supplierForm.contact_person.trim() || null,
                phone: supplierForm.phone.trim() || null,
                email: supplierForm.email.trim() || null,
                address: supplierForm.address.trim() || null,
                status: supplierForm.status,
                rating:
                    supplierForm.rating === ""
                        ? null
                        : Number(supplierForm.rating),
            };

            await axiosInstance.post("/suppliers", body);

            setSuccess("Supplier created successfully.");

            resetSupplierForm();
            setShowSupplierForm(false);

            await loadData();
        } catch (error) {
            console.error(
                "Failed to create supplier:",
                error
            );

            if (error.response?.data?.errors) {
                const messages = Object.values(
                    error.response.data.errors
                )
                    .flat()
                    .join(" ");

                setError(messages);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError(
                    "Unable to create supplier. Please check the API connection."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

        const handleEditSupplier = (supplier) => {
        setEditingSupplier(supplier);

        setSupplierForm({
            supplier_name: supplier.supplier_name || "",
            contact_person: supplier.contact_person || "",
            phone: supplier.phone || "",
            email: supplier.email || "",
            address: supplier.address || "",
            status: supplier.status || "active",
            rating:
                supplier.rating !== null &&
                supplier.rating !== undefined
                    ? supplier.rating
                    : "",
        });

        setShowEditSupplierForm(true);
        setShowSupplierForm(false);
        setShowQuotationForm(false);

        setSelectedSupplier(null);
        setError("");
        setSuccess("");
    };

    const handleUpdateSupplier = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!editingSupplier) {
        return;
    }

    if (!supplierForm.supplier_name.trim()) {
        setError("Supplier name is required.");
        return;
    }

    try {
        setSubmitting(true);

        const body = {
            supplier_name: supplierForm.supplier_name.trim(),
            contact_person:
                supplierForm.contact_person.trim() || null,
            phone: supplierForm.phone.trim() || null,
            email: supplierForm.email.trim() || null,
            address: supplierForm.address.trim() || null,
            status: supplierForm.status,
            rating:
                supplierForm.rating === ""
                    ? null
                    : Number(supplierForm.rating),
        };

        await axiosInstance.put(
            `/suppliers/${editingSupplier.supplier_id}`,
            body
        );

        setSuccess("Supplier updated successfully.");

        resetSupplierForm();
        setEditingSupplier(null);
        setShowEditSupplierForm(false);

        await loadData();
    } catch (error) {
        console.error(
            "Failed to update supplier:",
            error
        );

        if (error.response?.data?.errors) {
            const messages = Object.values(
                error.response.data.errors
            )
                .flat()
                .join(" ");

            setError(messages);
        } else if (error.response?.data?.message) {
            setError(error.response.data.message);
        } else {
            setError(
                "Unable to update supplier. Please check the API connection."
            );
        }
    } finally {
        setSubmitting(false);
    }
};

    const handleCreateQuotation = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!quotationForm.supplier_id) {
            setError("Please select a supplier.");
            return;
        }

        if (!quotationForm.quotation_no.trim()) {
            setError("Quotation number is required.");
            return;
        }

        if (!quotationForm.quotation_date) {
            setError("Quotation date is required.");
            return;
        }

        try {
            setSubmitting(true);

            const body = {
                supplier_id: Number(
                    quotationForm.supplier_id
                ),
                quotation_no:
                    quotationForm.quotation_no.trim(),
                quotation_date:
                    quotationForm.quotation_date,
                status: quotationForm.status,
            };

            await axiosInstance.post(
                "/supplier-quotations",
                body
            );

            setSuccess(
                "Supplier quotation created successfully."
            );

            resetQuotationForm();
            setShowQuotationForm(false);

            await loadData();
        } catch (error) {
            console.error(
                "Failed to create supplier quotation:",
                error
            );

            if (error.response?.data?.errors) {
                const messages = Object.values(
                    error.response.data.errors
                )
                    .flat()
                    .join(" ");

                setError(messages);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError(
                    "Unable to create supplier quotation. Please check the API connection."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditQuotation = (quotation) => {
    setEditingQuotation(quotation);

    setQuotationForm({
        supplier_id: quotation.supplier_id || "",
        quotation_no: quotation.quotation_no || "",
        quotation_date: quotation.quotation_date
            ? quotation.quotation_date.substring(0, 10)
            : "",
        status: quotation.status || "pending",
    });

    setShowEditQuotationForm(true);
    setShowQuotationForm(false);
    setShowSupplierForm(false);
    setShowEditSupplierForm(false);

    setSelectedSupplier(null);
    setError("");
    setSuccess("");
};

const handleUpdateQuotation = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!editingQuotation) {
        return;
    }

    if (!quotationForm.supplier_id) {
        setError("Please select a supplier.");
        return;
    }

    if (!quotationForm.quotation_no.trim()) {
        setError("Quotation number is required.");
        return;
    }

    if (!quotationForm.quotation_date) {
        setError("Quotation date is required.");
        return;
    }

    try {
        setSubmitting(true);

        const body = {
            supplier_id: Number(
                quotationForm.supplier_id
            ),
            quotation_no:
                quotationForm.quotation_no.trim(),
            quotation_date:
                quotationForm.quotation_date,
            status: quotationForm.status,
        };

        await axiosInstance.put(
            `/supplier-quotations/${editingQuotation.quotation_id}`,
            body
        );

        setSuccess(
            "Supplier quotation updated successfully."
        );

        resetQuotationForm();
        setEditingQuotation(null);
        setShowEditQuotationForm(false);

        await loadData();
    } catch (error) {
        console.error(
            "Failed to update supplier quotation:",
            error
        );

        if (error.response?.data?.errors) {
            const messages = Object.values(
                error.response.data.errors
            )
                .flat()
                .join(" ");

            setError(messages);
        } else if (error.response?.data?.message) {
            setError(error.response.data.message);
        } else {
            setError(
                "Unable to update supplier quotation. Please check the API connection."
            );
        }
    } finally {
        setSubmitting(false);
    }
};

const handleDeleteQuotation = async (quotationId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this supplier quotation?"
    );

    if (!confirmed) {
        return;
    }

    try {
        setError("");
        setSuccess("");

        await axiosInstance.delete(
            `/supplier-quotations/${quotationId}`
        );

        setSuccess(
            "Supplier quotation deleted successfully."
        );

        setEditingQuotation(null);
        setShowEditQuotationForm(false);

        await loadData();
    } catch (error) {
        console.error(
            "Failed to delete supplier quotation:",
            error
        );

        setError(
            error.response?.data?.message ||
                "Unable to delete supplier quotation."
        );
    }
};

    const handleDeleteSupplier = async (supplierId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this supplier?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await axiosInstance.delete(
                `/suppliers/${supplierId}`
            );

            setSuccess("Supplier deleted successfully.");

            if (
                selectedSupplier?.supplier_id === supplierId
            ) {
                setSelectedSupplier(null);
            }

            await loadData();
        } catch (error) {
            console.error(
                "Failed to delete supplier:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to delete supplier."
            );
        }
    };

    const handleViewSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        setError("");
        setSuccess("");
    };

    const supplierQuotations = selectedSupplier
        ? quotations.filter(
              (quotation) =>
                  Number(quotation.supplier_id) ===
                  Number(selectedSupplier.supplier_id)
          )
        : [];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    Supplier Sourcing
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage suppliers and supplier quotations
                    for procurement activities.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="rounded-lg border bg-white p-8 text-center text-sm text-gray-500">
                    Loading supplier sourcing data...
                </div>
            ) : (
                <>
                    {/* Actions */}
                    <div className="mb-6 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShowSupplierForm(
                                    true
                                );
                                setShowQuotationForm(
                                    false
                                );
                                setError("");
                                setSuccess("");
                            }}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Add Supplier
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowQuotationForm(
                                    true
                                );
                                setShowSupplierForm(false);
                                setError("");
                                setSuccess("");
                            }}
                            className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                        >
                            Add Quotation
                        </button>
                    </div>

                    {/* Supplier Form */}
                    {showSupplierForm && (
                        <form
                            onSubmit={
                                handleCreateSupplier
                            }
                            className="mb-6 rounded-lg border bg-white p-6"
                        >
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold">
                                    Add Supplier
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Register a new supplier in
                                    the system.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Supplier Name
                                    </label>

                                    <input
                                        name="supplier_name"
                                        value={
                                            supplierForm.supplier_name
                                        }
                                        onChange={
                                            handleSupplierChange
                                        }
                                        type="text"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter supplier name"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Contact Person
                                    </label>

                                    <input
                                        name="contact_person"
                                        value={
                                            supplierForm.contact_person
                                        }
                                        onChange={
                                            handleSupplierChange
                                        }
                                        type="text"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter contact person"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Phone
                                    </label>

                                    <input
                                        name="phone"
                                        value={
                                            supplierForm.phone
                                        }
                                        onChange={
                                            handleSupplierChange
                                        }
                                        type="text"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Email
                                    </label>

                                    <input
                                        name="email"
                                        value={
                                            supplierForm.email
                                        }
                                        onChange={
                                            handleSupplierChange
                                        }
                                        type="email"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter email"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium">
                                        Address
                                    </label>

                                    <textarea
                                        name="address"
                                        value={
                                            supplierForm.address
                                        }
                                        onChange={
                                            handleSupplierChange
                                        }
                                        rows="3"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter supplier address"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            supplierForm.status
                                        }
                                        onChange={
                                            handleSupplierChange
                                        }
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Rating
                                    </label>

                                    <input
                                        name="rating"
                                        value={
                                            supplierForm.rating
                                        }
                                        onChange={
                                            handleSupplierChange
                                        }
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.01"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="0 - 5"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetSupplierForm();
                                        setShowSupplierForm(
                                            false
                                        );
                                    }}
                                    className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Saving..."
                                        : "Save Supplier"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Edit Supplier Form */}
                    {showEditSupplierForm && editingSupplier && (
                        <form
                            onSubmit={handleUpdateSupplier}
                            className="mb-6 rounded-lg border bg-white p-6"
                        >
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Edit Supplier
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Update supplier information.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        resetSupplierForm();
                                        setEditingSupplier(null);
                                        setShowEditSupplierForm(false);
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Supplier Name
                                    </label>

                                    <input
                                        name="supplier_name"
                                        value={supplierForm.supplier_name}
                                        onChange={handleSupplierChange}
                                        type="text"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter supplier name"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Contact Person
                                    </label>

                                    <input
                                        name="contact_person"
                                        value={supplierForm.contact_person}
                                        onChange={handleSupplierChange}
                                        type="text"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter contact person"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Phone
                                    </label>

                                    <input
                                        name="phone"
                                        value={supplierForm.phone}
                                        onChange={handleSupplierChange}
                                        type="text"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Email
                                    </label>

                                    <input
                                        name="email"
                                        value={supplierForm.email}
                                        onChange={handleSupplierChange}
                                        type="email"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter email"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium">
                                        Address
                                    </label>

                                    <textarea
                                        name="address"
                                        value={supplierForm.address}
                                        onChange={handleSupplierChange}
                                        rows="3"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter supplier address"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={supplierForm.status}
                                        onChange={handleSupplierChange}
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Rating
                                    </label>

                                    <input
                                        name="rating"
                                        value={supplierForm.rating}
                                        onChange={handleSupplierChange}
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.01"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="0 - 5"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetSupplierForm();
                                        setEditingSupplier(null);
                                        setShowEditSupplierForm(false);
                                    }}
                                    className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Updating..."
                                        : "Update Supplier"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Quotation Form */}
                    {showQuotationForm && (
                        <form
                            onSubmit={
                                handleCreateQuotation
                            }
                            className="mb-6 rounded-lg border bg-white p-6"
                        >
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold">
                                    Add Supplier Quotation
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Record a quotation received
                                    from a supplier.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Supplier
                                    </label>

                                    <select
                                        name="supplier_id"
                                        value={
                                            quotationForm.supplier_id
                                        }
                                        onChange={
                                            handleQuotationChange
                                        }
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                    >
                                        <option value="">
                                            Select supplier
                                        </option>

                                        {suppliers.map(
                                            (supplier) => (
                                                <option
                                                    key={
                                                        supplier.supplier_id
                                                    }
                                                    value={
                                                        supplier.supplier_id
                                                    }
                                                >
                                                    {
                                                        supplier.supplier_name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Quotation Number
                                    </label>

                                    <input
                                        name="quotation_no"
                                        value={
                                            quotationForm.quotation_no
                                        }
                                        onChange={
                                            handleQuotationChange
                                        }
                                        type="text"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                        placeholder="Enter quotation number"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Quotation Date
                                    </label>

                                    <input
                                        name="quotation_date"
                                        value={
                                            quotationForm.quotation_date
                                        }
                                        onChange={
                                            handleQuotationChange
                                        }
                                        type="date"
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            quotationForm.status
                                        }
                                        onChange={
                                            handleQuotationChange
                                        }
                                        className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                                    >
                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="approved">
                                            Approved
                                        </option>

                                        <option value="rejected">
                                            Rejected
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetQuotationForm();
                                        setShowQuotationForm(
                                            false
                                        );
                                    }}
                                    className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Saving..."
                                        : "Save Quotation"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Edit Quotation Form */}
{showEditQuotationForm && editingQuotation && (
    <form
        onSubmit={handleUpdateQuotation}
        className="mb-6 rounded-lg border bg-white p-6"
    >
        <div className="mb-6">
            <h2 className="text-lg font-semibold">
                Edit Supplier Quotation
            </h2>

            <p className="mt-1 text-sm text-gray-500">
                Update the supplier quotation information.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Supplier
                </label>

                <select
                    name="supplier_id"
                    value={quotationForm.supplier_id}
                    onChange={handleQuotationChange}
                    className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                >
                    <option value="">
                        Select supplier
                    </option>

                    {suppliers.map((supplier) => (
                        <option
                            key={supplier.supplier_id}
                            value={supplier.supplier_id}
                        >
                            {supplier.supplier_name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Quotation Number
                </label>

                <input
                    name="quotation_no"
                    value={quotationForm.quotation_no}
                    onChange={handleQuotationChange}
                    type="text"
                    className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                    placeholder="Enter quotation number"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Quotation Date
                </label>

                <input
                    name="quotation_date"
                    value={quotationForm.quotation_date}
                    onChange={handleQuotationChange}
                    type="date"
                    className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Status
                </label>

                <select
                    name="status"
                    value={quotationForm.status}
                    onChange={handleQuotationChange}
                    className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                >
                    <option value="pending">
                        Pending
                    </option>

                    <option value="approved">
                        Approved
                    </option>

                    <option value="rejected">
                        Rejected
                    </option>
                </select>
            </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
            <button
                type="button"
                onClick={() => {
                    resetQuotationForm();
                    setEditingQuotation(null);
                    setShowEditQuotationForm(false);
                }}
                className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
            >
                Cancel
            </button>

            <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {submitting
                    ? "Updating..."
                    : "Update Quotation"}
            </button>
        </div>
    </form>
)}

                    {/* Suppliers */}
                    <div className="overflow-hidden rounded-lg border bg-white">
                        <div className="border-b px-6 py-4">
                            <h2 className="font-semibold">
                                Suppliers
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Suppliers currently registered
                                in the system.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Supplier
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Contact Person
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Phone
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Rating
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Quotations
                                        </th>

                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {suppliers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-4 py-8 text-center text-sm text-gray-500"
                                            >
                                                No suppliers
                                                found.
                                            </td>
                                        </tr>
                                    ) : (
                                        suppliers.map(
                                            (supplier) => (
                                                <tr
                                                    key={
                                                        supplier.supplier_id
                                                    }
                                                    className="border-b last:border-b-0"
                                                >
                                                    <td className="px-4 py-4 text-sm font-medium">
                                                        {
                                                            supplier.supplier_name
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4 text-sm">
                                                        {supplier.contact_person ||
                                                            "—"}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm">
                                                        {supplier.phone ||
                                                            "—"}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm capitalize">
                                                        {
                                                            supplier.status
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4 text-sm">
                                                        {supplier.rating ??
                                                            "—"}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm">
                                                        {supplier
                                                            .quotations
                                                            ?.length ||
                                                            0}
                                                    </td>

                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleViewSupplier(supplier)
                                                                }
                                                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                                            >
                                                                View
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEditSupplier(supplier)
                                                                }
                                                                className="text-sm font-medium text-gray-700 hover:text-gray-900"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteSupplier(
                                                                        supplier.supplier_id
                                                                    )
                                                                }
                                                                className="text-sm font-medium text-red-600 hover:text-red-700"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Supplier Details Modal */}
            {selectedSupplier && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() =>
                        setSelectedSupplier(null)
                    }
                >
                    <div
                        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {
                                        selectedSupplier.supplier_name
                                    }
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Supplier information and
                                    quotations
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedSupplier(null)
                                }
                                className="text-2xl leading-none text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">
                                        Supplier
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                        {
                                            selectedSupplier.supplier_name
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">
                                        Contact Person
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {selectedSupplier.contact_person ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {selectedSupplier.phone ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">
                                        Email
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {selectedSupplier.email ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">
                                        Address
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {selectedSupplier.address ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-500">
                                        Rating
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {selectedSupplier.rating ??
                                            "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="mb-3 text-sm font-semibold">
                                    Supplier Quotations
                                </h3>

                                <div className="overflow-hidden rounded-lg border">
                                    {supplierQuotations.length ===
                                    0 ? (
                                        <div className="p-6 text-center text-sm text-gray-500">
                                            No quotations found
                                            for this supplier.
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead className="border-b bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                                        Quotation No.
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                                        Date
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                                        Status
                                                    </th>

                                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {supplierQuotations.map(
                                                    (
                                                        quotation
                                                    ) => (
                                                        <tr
                                                            key={quotation.quotation_id}
                                                            className="border-b last:border-b-0"
                                                        >
                                                            <td className="px-4 py-3 text-sm">
                                                                {quotation.quotation_no}
                                                            </td>

                                                            <td className="px-4 py-3 text-sm">
                                                                {quotation.quotation_date
                                                                    ? new Date(
                                                                        quotation.quotation_date
                                                                    ).toLocaleDateString()
                                                                    : "—"}
                                                            </td>

                                                            <td className="px-4 py-3 text-sm capitalize">
                                                                {quotation.status}
                                                            </td>

                                                            <td className="px-4 py-3 text-right">
                                                                <div className="flex justify-end gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleEditQuotation(quotation)
                                                                        }
                                                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeleteQuotation(
                                                                                quotation.quotation_id
                                                                            )
                                                                        }
                                                                        className="text-sm font-medium text-red-600 hover:text-red-700"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedSupplier(
                                            null
                                        )
                                    }
                                    className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
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