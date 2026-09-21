"use client";

import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { PERMISSIONS } from "@/utils/permissions";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Check,
    X,
    Loader2,
    User as UserIcon,
    Mail,
    Shield,
    KeyRound
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/lib/axios";

function UsersContent() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        first_name: "",
        last_name: "",
        role_id: "",
        password: "",
        password_confirmation: "",
        status: "active",
    });

    const filteredRoles = roles.filter(role => role.name !== 'Purchasing Officer');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes] = await Promise.all([
                apiClient.get("/users"),
                apiClient.get("/roles")
            ]);
            setUsers(usersRes.data.data || usersRes.data || []);
            setRoles(rolesRes.data.data || rolesRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            first_name: "",
            last_name: "",
            role_id: "",
            password: "",
            password_confirmation: "",
            status: "active",
        });
    };

    const handleOpenCreate = () => {
        setEditingUser(null);
        resetForm();
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim())      { toast.error("Name is required"); return; }
        if (!formData.email.trim())     { toast.error("Email is required"); return; }
        if (!formData.role_id)          { toast.error("Please select a role"); return; }
        if (!editingUser && !formData.password) { toast.error("Password is required"); return; }
        if (!editingUser && formData.password !== formData.password_confirmation) {
            toast.error("Passwords do not match"); return;
        }

        try {
            setSubmitting(true);

            const dataToSend = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                first_name: formData.first_name.trim() || null,
                last_name: formData.last_name.trim() || null,
                role_id: Number(formData.role_id),
                status: formData.status,
            };

            if (formData.password) {
                dataToSend.password = formData.password;
                dataToSend.password_confirmation = formData.password_confirmation;
            }

            if (editingUser) {
                await apiClient.put(`/users/${editingUser.id}`, dataToSend);
                toast.success("User updated successfully");
            } else {
                await apiClient.post("/users", dataToSend);
                toast.success("User created successfully");
            }

            setShowModal(false);
            setEditingUser(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error("Error saving user:", error);
            const errorMessage =
                error.response?.data?.message ||
                (error.response?.data?.errors
                    ? Object.values(error.response.data.errors).flat().join(", ")
                    : "Failed to save user");
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await apiClient.delete(`/users/${id}`);
            toast.success("User deleted successfully");
            fetchData();
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(error.response?.data?.message || "Failed to delete user");
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || "",
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            role_id: user.role_id || "",
            password: "",
            password_confirmation: "",
            status: user.status || "active",
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (submitting) return;
        setShowModal(false);
        setEditingUser(null);
        resetForm();
    };

    const getRoleName = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        return role?.name || "No Role";
    };

    const getStatusBadge = (status) => {
        if (status === "active") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    <Check className="w-3 h-3" /> Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                <X className="w-3 h-3" /> Inactive
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage system users and their role assignments
                    </p>
                </div>

                {/* RBAC: only users.create can see Add User */}
                <Can permission={PERMISSIONS.USERS_CREATE}>
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add User
                    </button>
                </Can>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">💡 Managing User Permissions</p>
                <p>
                    User permissions are inherited from their assigned role.
                    To modify permissions, go to the <strong>Roles</strong> or <strong>Permissions</strong> page.
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{user.name}</div>
                                                    {user.first_name && user.last_name && (
                                                        <div className="text-xs text-slate-400">
                                                            {user.first_name} {user.last_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                                <Shield className="w-3 h-3" />
                                                {getRoleName(user.role_id)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* RBAC: only users.edit can see Edit */}
                                                <Can permission={PERMISSIONS.USERS_EDIT}>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit user"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </Can>

                                                {/* RBAC: only users.delete can see Delete (and not on self) */}
                                                {user.id !== currentUser?.id && (
                                                    <Can permission={PERMISSIONS.USERS_DELETE}>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete user"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
            </div>

            {/* User Modal — only openable if user has create/edit, but keep guard for safety */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => e.target === e.currentTarget && handleCloseModal()}
                >
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingUser ? "Edit User" : "Add New User"}
                                </h2>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                disabled={submitting}
                                className="text-2xl text-slate-400 hover:text-slate-600 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="Full name"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="user@scims.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        <select
                                            required
                                            value={formData.role_id}
                                            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white"
                                        >
                                            <option value="">Select role</option>
                                            {filteredRoles.map((role) => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <KeyRound className="w-4 h-4 text-slate-500" />
                                    <h3 className="text-sm font-semibold text-slate-700">
                                        {editingUser ? "Change Password" : "Password"}
                                    </h3>
                                    {editingUser && (
                                        <span className="text-xs text-slate-400">(leave blank to keep current)</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Password {!editingUser && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type="password"
                                            required={!editingUser}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            placeholder={editingUser ? "New password (optional)" : "Enter password"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Confirm Password {!editingUser && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type="password"
                                            required={!editingUser}
                                            value={formData.password_confirmation}
                                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                                <strong>Note:</strong> Permissions are automatically inherited from the assigned role.
                                Manage them on the <strong>Roles</strong> or <strong>Permissions</strong> page.
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>{editingUser ? "Update User" : "Create User"}</>
                                    )}
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
        <PermissionGuard requiredPermission={PERMISSIONS.USERS_VIEW}>
            <UsersContent />
        </PermissionGuard>
    );
}