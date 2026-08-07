"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/services/api";

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            try {
                await getUser();
            } catch (error) {
                console.log("Not authenticated");
                router.replace("/login");
            }
        }

        checkAuth();
    }, [router]);

    return (
        <div>
            Dashboard
        </div>
    );
}