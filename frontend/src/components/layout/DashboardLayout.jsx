"use client";

import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen((current) => !current);
    };

    return (
        /* Lock root container to exact viewport height to stop overall page scroll */
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900">
            {/* Sidebar (Fixed height handled internally via h-screen) */}
            <Sidebar open={sidebarOpen} />

            {/* Application wrapper filling remaining height */}
            <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                {/* Header (Stays pinned at the top) */}
                <Header
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={toggleSidebar}
                />

                {/* Main Content Area (Only this container will scroll) */}
                <main className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}