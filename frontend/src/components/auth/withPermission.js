"use client";

import { PermissionGuard } from "./PermissionGuard";

export function withPermission(Component, requiredPermission) {
    return function WrappedComponent(props) {
        return (
            <PermissionGuard requiredPermission={requiredPermission}>
                <Component {...props} />
            </PermissionGuard>
        );
    };
}