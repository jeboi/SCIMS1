"use client";

import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar open={sidebarOpen} />

            <div className="flex flex-1 flex-col">
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="px-6 py-4">
                    <Breadcrumb />
                </div>

                <main className="flex-1 px-6 pb-6">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
}