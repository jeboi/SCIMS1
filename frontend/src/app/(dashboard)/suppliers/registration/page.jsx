"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Building, User, Phone, Mail, MapPin, 
    Star, Loader2, ArrowLeft, CheckCircle
} from "lucide-react";

export default function SupplierRegistrationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        supplier_name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        rating: 0,
        status: "active",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!form.supplier_name.trim()) {
            newErrors.supplier_name = "Supplier name is required.";
        }
        if (!form.contact_person.trim()) {
            newErrors.contact_person = "Contact person is required.";
        }
        if (!form.phone.trim()) {
            newErrors.phone = "Phone number is required.";
        }
        if (!form.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Please enter a valid email address.";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        try {
            setLoading(true);
            
            const payload = {
                supplier_name: form.supplier_name.trim(),
                contact_person: form.contact_person.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                address: form.address.trim() || null,
                rating: Number(form.rating) || 0,
                status: form.status,
            };

            await axiosInstance.post("/suppliers", payload);
            
            toast.success("Supplier registered successfully!");
            setForm({
                supplier_name: "",
                contact_person: "",
                phone: "",
                email: "",
                address: "",
                rating: 0,
                status: "active",
            });
            
            // Redirect to supplier information page after short delay
            setTimeout(() => {
                router.push("/suppliers/information");
            }, 1500);
            
        } catch (err) {
            console.error(err);
            
            if (err.response?.data?.errors) {
                const validationErrors = err.response.data.errors;
                const formattedErrors = {};
                Object.keys(validationErrors).forEach((key) => {
                    formattedErrors[key] = validationErrors[key][0];
                });
                setErrors(formattedErrors);
                toast.error("Please fix the validation errors.");
            } else {
                toast.error(err.response?.data?.message || "Failed to register supplier.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setForm({
            supplier_name: "",
            contact_person: "",
            phone: "",
            email: "",
            address: "",
            rating: 0,
            status: "active",
        });
        setErrors({});
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/suppliers/information")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Back to Suppliers"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold">Supplier Registration</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Register a new supplier to the system.
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                    <p className="font-medium">Registration Guide</p>
                    <p className="text-blue-600">
                        Fill in the supplier details below. Fields marked with * are required.
                        After registration, the supplier will appear in the Supplier Information list.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-5">
                {/* Supplier Name */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Supplier Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            name="supplier_name"
                            value={form.supplier_name}
                            onChange={handleChange}
                            placeholder="e.g. ABC Hotel Supplies"
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 ${
                                errors.supplier_name
                                    ? "border-red-500 focus:ring-red-500/20"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                            }`}
                        />
                    </div>
                    {errors.supplier_name && (
                        <p className="mt-1 text-xs text-red-500">{errors.supplier_name}</p>
                    )}
                </div>

                {/* Contact Person */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Contact Person <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            name="contact_person"
                            value={form.contact_person}
                            onChange={handleChange}
                            placeholder="e.g. Juan Dela Cruz"
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 ${
                                errors.contact_person
                                    ? "border-red-500 focus:ring-red-500/20"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                            }`}
                        />
                    </div>
                    {errors.contact_person && (
                        <p className="mt-1 text-xs text-red-500">{errors.contact_person}</p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="e.g. 09171234567"
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 ${
                                errors.phone
                                    ? "border-red-500 focus:ring-red-500/20"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                            }`}
                        />
                    </div>
                    {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="e.g. supplier@company.com"
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 ${
                                errors.email
                                    ? "border-red-500 focus:ring-red-500/20"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                            }`}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                </div>

                {/* Address */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Address
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            rows="2"
                            placeholder="e.g. Quezon City, Philippines"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                {/* Rating */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Rating
                    </label>
                    <select
                        name="rating"
                        value={form.rating}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="0">⭐ Not Rated</option>
                        <option value="1">⭐ 1 Star</option>
                        <option value="2">⭐⭐ 2 Stars</option>
                        <option value="3">⭐⭐⭐ 3 Stars</option>
                        <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                    </select>
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end border-t pt-5">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Building className="h-4 w-4" />
                        )}
                        {loading ? "Registering..." : "Register Supplier"}
                    </button>
                </div>
            </form>

            {/* Footer Link */}
            <div className="text-center">
                <button
                    onClick={() => router.push("/suppliers/information")}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                    ← View all registered suppliers
                </button>
            </div>
        </div>
    );
}