"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function ApiTestPage() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const testApi = async () => {
            try {
                const response = await axios.get("/hotel-stock-requests");

                console.log("API RESPONSE:", response.data);

                setResult(response.data);
            } catch (error) {
                console.error("API ERROR:", error);

                setError(
                    error.response?.data ||
                    error.message ||
                    "Unable to connect to Laravel API."
                );
            }
        };

        testApi();
    }, []);

    return (
        <main style={{ padding: "40px" }}>
            <h1>SCIMS API Test</h1>

            {error && (
                <pre>
                    {JSON.stringify(error, null, 2)}
                </pre>
            )}

            {result && (
                <pre>
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}

            {!result && !error && <p>Testing API...</p>}
        </main>
    );
}