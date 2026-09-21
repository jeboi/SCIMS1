"use client";

import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/utils/permissions";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Can } from "@/components/auth/Can";                     // ← ADDED
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    Shield,
    Check,
    X,
    Loader2,
    Save,
    RefreshCw,
    Info,
    Eye,
    Plus,
    Pencil,
    Trash2,
    CheckCircle,
    Users,
    Settings,
    FileText,
    BarChart3,
    Package,
    ShoppingCart,
    Truck,
    Warehouse,
    Boxes,
    ClipboardList,
    Key,
    Lock,
    UserCheck,
    UserCog,
    LayoutDashboard
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/lib/axios";

const PERMISSION_MODULES = {
    dashboard: {
        label: 'Dashboard',
        permissions: ['view'],
        icon: LayoutDashboard,
        description: 'Access to main dashboard and overview'
    },
    warehousing: {
        label: 'Warehousing',
        permissions: ['view', 'create', 'edit', 'delete'],
        icon: Warehouse,
        description: 'Manage warehouses, storage locations, and goods'
    },
    inventory: {
        label: 'Inventory',
        permissions: ['view', 'create', 'edit', 'delete', 'adjust'],
        icon: Boxes,
        description: 'Manage items, stock levels, and inventory transactions'
    },
    procurement: {
        label: 'Procurement',
        permissions: ['view', 'create', 'edit', 'delete', 'approve'],
        icon: ShoppingCart,
        description: 'Manage purchase requests, sourcing, and approvals'
    },
    suppliers: {
        label: 'Suppliers',
        permissions: ['view', 'create', 'edit', 'delete', 'evaluate'],
        icon: Users,
        description: 'Manage supplier registration, evaluation, and performance'
    },
    purchase_orders: {
        label: 'Purchase Orders',
        permissions: ['view', 'create', 'edit', 'delete', 'approve'],
        icon: ClipboardList,
        description: 'Manage purchase order creation, approval, and tracking'
    },
    logistics: {
        label: 'Logistics',
        permissions: ['view', 'create', 'edit', 'delete'],
        icon: Truck,
        description: 'Manage deliveries, shipping, and logistics documents'
    },
    reports: {
        label: 'Reports',
        permissions: ['view', 'generate', 'export'],
        icon: BarChart3,
        description: 'View, generate, and export system reports'
    },
    users: {
        label: 'Users',
        permissions: ['view', 'create', 'edit', 'delete'],
        icon: UserCheck,
        description: 'Manage system users and their accounts'
    },
    roles: {
        label: 'Roles',
        permissions: ['view', 'create', 'edit', 'delete'],
        icon: UserCog,
        description: 'Manage roles and role assignments'
    },
    permissions: {
        label: 'Permissions',
        permissions: ['view', 'assign'],
        icon: Key,
        description: 'Manage role-based permissions'
    },
};

const PERMISSION_LEGEND = [
    {
        action: 'view',
        label: 'View',
        color: 'bg-blue-500',
        icon: Eye,
        description: 'Ability to view data and information'
    },
    {
        action: 'create',
        label: 'Create',
        color: 'bg-green-500',
        icon: Plus,
        description: 'Ability to create new records and entries'
    },
    {
        action: 'edit',
        label: 'Edit',
        color: 'bg-yellow-500',
        icon: Pencil,
        description: 'Ability to update and modify existing data'
    },
    {
        action: 'delete',
        label: 'Delete',
        color: 'bg-red-500',
        icon: Trash2,
        description: 'Ability to delete and remove records'
    },
    {
        action: 'approve',
        label: 'Approve',
        color: 'bg-purple-500',
        icon: CheckCircle,
        description: 'Ability to approve requests and orders'
    },
    {
        action: 'evaluate',
        label: 'Evaluate',
        color: 'bg-indigo-500',
        icon: ClipboardList,
        description: 'Ability to evaluate suppliers and performance'
    },
    {
        action: 'generate',
        label: 'Generate',
        color: 'bg-orange-500',
        icon: FileText,
        description: 'Ability to generate reports and documents'
    },
    {
        action: 'export',
        label: 'Export',
        color: 'bg-teal-500',
        icon: BarChart3,
        description: 'Ability to export data and reports'
    },
    {
        action: 'assign',
        label: 'Assign',
        color: 'bg-pink-500',
        icon: Settings,
        description: 'Ability to assign permissions to roles'
    },
    {
        action: 'adjust',
        label: 'Adjust',
        color: 'bg-cyan-500',
        icon: Settings,
        description: 'Ability to adjust inventory stock levels'
    },
];

function PermissionsContent() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState({});
    const [showLegend, setShowLegend] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const rolesRes = await apiClient.get("/roles");
            const rolesData = rolesRes.data.data || rolesRes.data || [];

            const filteredRoles = rolesData.filter(r => r.name !== 'Purchasing Officer');
            setRoles(filteredRoles);

            if (filteredRoles.length > 0 && !selectedRole) {
                setSelectedRole(filteredRoles[0]);
            }

            const permissionsMap = {};
            for (const role of filteredRoles) {
                try {
                    const permRes = await apiClient.get(`/roles/${role.id}/permissions`);
                    permissionsMap[role.id] = permRes.data.data || permRes.data || [];
                } catch (e) {
                    permissionsMap[role.id] = [];
                }
            }
            setRolePermissions(permissionsMap);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load permissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const togglePermission = (permission) => {
        if (!selectedRole) return;

        const currentPermissions = rolePermissions[selectedRole.id] || [];
        const newPermissions = currentPermissions.includes(permission)
            ? currentPermissions.filter(p => p !== permission)
            : [...currentPermissions, permission];

        setRolePermissions({
            ...rolePermissions,
            [selectedRole.id]: newPermissions
        });
    };

    const toggleModulePermissions = (moduleKey, module) => {
        if (!selectedRole) return;

        const allPermissions = module.permissions.map(p => `${moduleKey}.${p}`);
        const currentPermissions = rolePermissions[selectedRole.id] || [];
        const hasAll = allPermissions.every(p => currentPermissions.includes(p));

        let newPermissions;
        if (hasAll) {
            newPermissions = currentPermissions.filter(p => !allPermissions.includes(p));
        } else {
            newPermissions = [...new Set([...currentPermissions, ...allPermissions])];
        }

        setRolePermissions({
            ...rolePermissions,
            [selectedRole.id]: newPermissions
        });
    };

    const hasAllModulePermissions = (moduleKey, module) => {
        if (!selectedRole) return false;
        const currentPermissions = rolePermissions[selectedRole.id] || [];
        const allPermissions = module.permissions.map(p => `${moduleKey}.${p}`);
        return allPermissions.every(p => currentPermissions.includes(p));
    };

    const savePermissions = async () => {
        if (!selectedRole) return;

        try {
            setSaving(true);
            const permissions = rolePermissions[selectedRole.id] || [];
            await apiClient.put(`/roles/${selectedRole.id}/permissions`, { permissions });
            toast.success(`Permissions updated for ${selectedRole.name}`);
        } catch (error) {
            console.error("Error saving permissions:", error);
            toast.error("Failed to save permissions");
        } finally {
            setSaving(false);
        }
    };

    const hasPermission = (permission) => {
        if (!selectedRole) return false;
        const currentPermissions = rolePermissions[selectedRole.id] || [];
        return currentPermissions.includes(permission);
    };

    const getActionColor = (action) => {
        const found = PERMISSION_LEGEND.find(l => l.action === action);
        return found?.color || 'bg-slate-500';
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
                    <h1 className="text-2xl font-bold text-slate-900">Permissions Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage role-based permissions for your system</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowLegend(!showLegend)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                    >
                        <Info className="w-4 h-4" />
                        {showLegend ? 'Hide Legend' : 'Show Legend'}
                    </button>
                    <button
                        onClick={fetchData}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>

                    {/* RBAC: only permissions.assign can save changes */}
                    <Can permission={PERMISSIONS.PERMISSIONS_ASSIGN}>
                        <button
                            onClick={savePermissions}
                            disabled={saving || !selectedRole}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </Can>
                </div>
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-slate-900">Permission Legend</h3>
                        <span className="text-xs text-slate-400">(Click on any permission to toggle it)</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {PERMISSION_LEGEND.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.action} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50/50">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                    <div className="flex items-center gap-1">
                                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-xs font-medium text-slate-700">{item.label}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 truncate" title={item.description}>
                                        {item.description}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Role Selector */}
            <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        className={`px-4 py-2 rounded-lg border transition ${
                            selectedRole?.id === role.id
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {role.name}
                    </button>
                ))}
                {roles.length === 0 && (
                    <p className="text-slate-500">No roles available</p>
                )}
            </div>

            {/* Permissions Matrix */}
            {selectedRole && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    Permissions for <span className="text-blue-600">{selectedRole.name}</span>
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Toggle permissions to control what this role can access
                                </p>
                            </div>
                            <div className="text-xs text-slate-400">
                                {(rolePermissions[selectedRole.id] || []).length} permissions assigned
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(PERMISSION_MODULES).map(([moduleKey, module]) => {
                                const allChecked = hasAllModulePermissions(moduleKey, module);
                                const ModuleIcon = module.icon;
                                return (
                                    <div key={moduleKey} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition">
                                        <div className="flex items-center gap-2 mb-3">
                                            <input
                                                type="checkbox"
                                                checked={allChecked}
                                                onChange={() => toggleModulePermissions(moduleKey, module)}
                                                className="rounded border-slate-300 w-4 h-4"
                                            />
                                            <ModuleIcon className="w-4 h-4 text-slate-500" />
                                            <label className="font-medium text-slate-900 text-sm">
                                                {module.label}
                                            </label>
                                            <span className="text-xs text-slate-400 ml-auto">
                                                {module.permissions.length} permissions
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {module.permissions.map((perm) => {
                                                const permName = `${moduleKey}.${perm}`;
                                                const colorClass = getActionColor(perm);
                                                return (
                                                    <div key={permName} className="flex items-center gap-2 pl-6">
                                                        <input
                                                            type="checkbox"
                                                            checked={hasPermission(permName)}
                                                            onChange={() => togglePermission(permName)}
                                                            className="rounded border-slate-300 w-3.5 h-3.5"
                                                        />
                                                        <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                                                        <label className="text-sm text-slate-600 capitalize">
                                                            {perm}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Permission Summary */}
            {selectedRole && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Permission Summary</h4>
                    <div className="flex flex-wrap gap-2">
                        {(rolePermissions[selectedRole.id] || []).length === 0 ? (
                            <span className="text-sm text-slate-400">No permissions assigned</span>
                        ) : (
                            (rolePermissions[selectedRole.id] || []).map((perm) => {
                                const action = perm.split('.')[1] || perm;
                                const colorClass = getActionColor(action);
                                return (
                                    <span key={perm} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                                        <div className={`w-1.5 h-1.5 rounded-full ${colorClass}`}></div>
                                        {perm}
                                    </span>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PermissionsPage() {
    return (
        <PermissionGuard requiredPermission={PERMISSIONS.PERMISSIONS_VIEW}>
            <PermissionsContent />
        </PermissionGuard>
    );
}