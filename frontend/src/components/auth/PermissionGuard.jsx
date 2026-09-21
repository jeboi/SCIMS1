"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export function PermissionGuard({ 
    children, 
    requiredPermission,
    redirectTo = "/dashboard",
    fallback = null 
}) {
    const { user, loading, hasPermission } = useAuth();
    const router = useRouter();
    const redirectAttempted = useRef(false);

    // Compute permission check during render (not in effect)
    const hasAccess = !requiredPermission || (user && hasPermission(requiredPermission));

    useEffect(() => {
        if (loading || redirectAttempted.current) return;

        // No user → redirect to login
        if (!user) {
            redirectAttempted.current = true;
            router.replace("/login");
            return;
        }

        // Missing permission → redirect to dashboard
        if (requiredPermission && !hasPermission(requiredPermission)) {
            redirectAttempted.current = true;
            router.replace(redirectTo);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading, requiredPermission, redirectTo, router]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // No user → render nothing (redirect in progress)
    if (!user) {
        return null;
    }

    // Permission check failed
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return fallback || (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="text-red-500 text-6xl mb-4">🚫</div>
                <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
                <p className="text-gray-500 mt-2">
                    You don't have permission to access this page.
                </p>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return <>{children}</>;
}