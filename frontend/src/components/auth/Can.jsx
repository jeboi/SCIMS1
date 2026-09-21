"use client";

import { usePermission } from "@/hooks/usePermission";

/**
 * <Can> — render children only if the current user has the given permission.
 *
 * Usage:
 *   <Can permission={PERMISSIONS.INVENTORY_CREATE}>
 *     <button>Add Item</button>
 *   </Can>
 *
 *   <Can permission={PERMISSIONS.INVENTORY_DELETE} fallback={<span>—</span>}>
 *     <button>Delete</button>
 *   </Can>
 *
 * Notes:
 *  - Admin (role_id=1 / role="Administrator") passes every check automatically.
 *  - Returns `fallback` (default null) when permission is missing.
 *  - Never redirects — that's what PermissionGuard is for.
 */
export function Can({ permission, children, fallback = null }) {
    const { hasPermission } = usePermission();

    if (!permission) return <>{children}</>;
    if (!hasPermission(permission)) return <>{fallback}</>;

    return <>{children}</>;
}

/**
 * <CanAny> — render children if the user has ANY (default) or ALL of the given permissions.
 *
 * Usage:
 *   <CanAny permissions={[PERMISSIONS.INVENTORY_CREATE, PERMISSIONS.INVENTORY_EDIT]}>
 *     <button>Save</button>
 *   </CanAny>
 */
export function CanAny({ permissions = [], mode = "any", children, fallback = null }) {
    const { hasAnyPermission, hasAllPermissions } = usePermission();

    if (!permissions.length) return <>{children}</>;

    const ok = mode === "all"
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);

    return ok ? <>{children}</> : <>{fallback}</>;
}