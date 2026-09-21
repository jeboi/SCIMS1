"use client";

import { useAuth } from "@/context/AuthContext";

export function usePermission() {
    const { user, permissions } = useAuth();

    // Check if user has a specific permission
    const hasPermission = (permissionName) => {
        if (!user) return false;
        
        // Admin has all permissions (role_id = 1 or role = 'Administrator')
        if (user.role_id === 1 || user.role === 'Administrator' || user.role?.name === 'Administrator') {
            return true;
        }
        
        // Check if user has the permission
        return permissions?.includes(permissionName) || false;
    };

    // Check if user has any of the given permissions
    const hasAnyPermission = (permissionList) => {
        if (!user) return false;
        if (user.role_id === 1 || user.role === 'Administrator' || user.role?.name === 'Administrator') {
            return true;
        }
        return permissionList.some(perm => permissions?.includes(perm));
    };

    // Check if user has all of the given permissions
    const hasAllPermissions = (permissionList) => {
        if (!user) return false;
        if (user.role_id === 1 || user.role === 'Administrator' || user.role?.name === 'Administrator') {
            return true;
        }
        return permissionList.every(perm => permissions?.includes(perm));
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        permissions,
    };
}