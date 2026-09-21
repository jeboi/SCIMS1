"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AdminGuard({ children, requiredPermissions = [] }) {
    const { user, loading, permissions } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If not loading and no user, redirect to login
        if (!loading && !user) {
            router.push("/login");
            return;
        }

        // If not loading and user exists, check if admin
        if (!loading && user) {
            // Check if user is Administrator
            const isAdmin = user.role_id === 1 || user.role === 'Administrator' || user.role?.name === 'Administrator';
            
            // If admin, allow access
            if (isAdmin) {
                return;
            }

            // If specific permissions are required, check them
            if (requiredPermissions.length > 0) {
                const hasAllPermissions = requiredPermissions.every(perm => 
                    permissions.includes(perm)
                );
                
                if (!hasAllPermissions) {
                    router.push("/dashboard");
                    return;
                }
            } else {
                // Non-admin without specific permissions - redirect
                router.push("/dashboard");
            }
        }
    }, [user, loading, router, permissions, requiredPermissions]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm text-slate-500">Checking permissions...</p>
                </div>
            </div>
        );
    }

    // If no user, don't render anything (will redirect)
    if (!user) {
        return null;
    }

    // Check if user is admin
    const isAdmin = user.role_id === 1 || user.role === 'Administrator' || user.role?.name === 'Administrator';
    
    // If admin, allow access
    if (isAdmin) {
        return <>{children}</>;
    }

    // Check specific permissions
    if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(perm => 
            permissions.includes(perm)
        );
        
        if (hasAllPermissions) {
            return <>{children}</>;
        }
    }

    // If not authorized, don't render anything
    return null;
}

export default AdminGuard;