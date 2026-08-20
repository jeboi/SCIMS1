import { NextResponse } from "next/server";
import appConfig from "@/config/app";

export async function GET(request) {
    try {
        const response = await fetch(
            `${appConfig.apiUrl}/dashboard/metrics`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Cookie: request.headers.get("cookie") ?? "",
                },
                cache: "no-store",
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error:
                        data?.message ||
                        "Failed to load dashboard metrics.",
                },
                {
                    status: response.status,
                }
            );
        }

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Dashboard metrics error:", error);

        return NextResponse.json(
            {
                error: "Unable to connect to the Laravel API.",
            },
            {
                status: 500,
            }
        );
    }
}