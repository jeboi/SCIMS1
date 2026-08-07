"use client";

import { Menu, Bell, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/services/api";

export default function Header({
    sidebarOpen,
    setSidebarOpen,
}) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();

            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="rounded-lg p-2 hover:bg-gray-100"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <h1 className="text-xl font-semibold">
                        Dashboard
                    </h1>

                    <p className="text-sm text-gray-500">
                        Supply Chain & Inventory Management System
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-5">
                <Bell
                    size={20}
                    className="cursor-pointer"
                />

                <div className="flex items-center gap-2">
                    <User size={20} />

                    <span className="text-sm font-medium">
                        Administrator
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg border border-red-500 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </header>
    );
}