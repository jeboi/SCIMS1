"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/services/api";

export default function GuestGuard({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function check() {
            try {
                // First check if we have a token
                const token = localStorage.getItem("token") || localStorage.getItem("access_token");
                
                // If no token, user is definitely not authenticated
                if (!token) {
                    if (isMounted) {
                        setLoading(false);
                        setIsAuthenticated(false);
                    }
                    return;
                }

                // Try to get user with the token
                try {
                    const response = await getUser();
                    
                    // If getUser succeeds, user is authenticated
                    if (isMounted) {
                        setIsAuthenticated(true);
                        // Add a small delay before redirect to prevent flash
                        setTimeout(() => {
                            router.replace("/dashboard");
                        }, 300);
                    }
                } catch (error) {
                    // getUser failed - token is invalid or expired
                    console.log("Auth check failed:", error);
                    
                    // Clear invalid tokens
                    localStorage.removeItem("token");
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("permissions");
                    
                    if (isMounted) {
                        setLoading(false);
                        setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                console.error("Auth check error:", error);
                if (isMounted) {
                    setLoading(false);
                    setIsAuthenticated(false);
                }
            }
        }

        // Add a small delay before checking to ensure state is stable
        const initialDelay = setTimeout(() => {
            check();
        }, 300);

        return () => {
            isMounted = false;
            clearTimeout(initialDelay);
        };
    }, [router]);

    // Show loading state while checking
    if (loading) {
        return (
            <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50/80 font-sans antialiased">
                {/* AMBIENT LIGHT BACKGROUND GLOWS */}
                <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-200/40 blur-[120px]" />
                <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-200/40 blur-[120px]" />

                {/* CENTRAL POPUP CARD WITH ENHANCED ANIMATION */}
                <div className="relative z-10 flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-all animate-in fade-in-0 zoom-in-95 duration-300 ease-out sm:p-10">
                    
                    {/* DUAL-RING ORBITING SPINNER & ICON */}
                    <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                        {/* Outer Slow Rotating Gradient Ring */}
                        <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-2 border-transparent border-t-indigo-600 border-r-blue-400/30" />

                        {/* Inner Fast Reverse Orbit Ring */}
                        <div className="absolute inset-2 animate-[spin_1.5s_linear_infinite_reverse] rounded-full border-2 border-transparent border-b-blue-600 border-l-indigo-300" />

                        {/* Glowing Glass Icon Core */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-md shadow-indigo-500/10 ring-1 ring-slate-200/80">
                            <svg
                                className="h-6 w-6 animate-pulse"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* BRANDING & STATUS TEXT */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-center gap-2">
                            <h2 className="text-base font-bold tracking-tight text-slate-900">
                                SCIMS Portal
                            </h2>
                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-500/10">
                                Enterprise
                            </span>
                        </div>

                        <p className="text-xs font-medium text-slate-500">
                            Authenticating your session...
                        </p>
                    </div>

                    {/* LIVE STATUS INDICATOR BADGE */}
                    <div className="mt-6 flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100/60 px-3.5 py-1.5 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-[11px] font-semibold tracking-wide text-slate-600">
                            Securing Connection
                        </span>
                    </div>

                </div>
            </div>
        );
    }

    return children;
}