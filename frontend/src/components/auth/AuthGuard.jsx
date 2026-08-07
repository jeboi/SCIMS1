"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/services/api";

export default function AuthGuard({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                await getUser();
                setLoading(false);
            } catch {
                router.replace("/login");
            }
        }

        checkAuth();
    }, [router]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return children;
}