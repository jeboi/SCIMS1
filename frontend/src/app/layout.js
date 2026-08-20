import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "SCIMS Portal",
    description: "Supply Chain & Inventory Management System",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: "#0f172a",
                            color: "#f8fafc",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            fontSize: "14px",
                        },
                    }}
                />
            </body>
        </html>
    );
}