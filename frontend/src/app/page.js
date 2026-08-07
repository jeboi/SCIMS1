"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
    const [result, setResult] = useState("Loading...");

    useEffect(() => {
        console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

        axios
            .get("http://127.0.0.1:8000/api/health")
            .then((res) => {
                console.log(res.data);
                setResult(JSON.stringify(res.data, null, 2));
            })
            .catch((err) => {
                console.error(err);

                if (err.response) {
                    console.log("Response:", err.response);
                }

                if (err.request) {
                    console.log("Request:", err.request);
                }

                setResult(err.message);
            });
    }, []);

    return (
        <main style={{ padding: 40 }}>
            <h1>SCIMS Connection Test</h1>

            <pre>{result}</pre>
        </main>
    );
}