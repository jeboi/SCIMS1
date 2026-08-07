"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/services/api";

export default function GuestGuard({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function check() {
            try {
                await getUser();
                router.replace("/dashboard");
            } catch {
                setLoading(false);
            }
        }

        check();
    }, [router]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return children;
}