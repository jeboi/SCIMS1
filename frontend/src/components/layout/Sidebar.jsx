"use client";

import navigation from "@/config/navigation";
import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";

export default function Sidebar({ open }) {
    return (
        <aside
            className={`${
                open ? "w-72" : "w-20"
            } flex-shrink-0 overflow-y-auto border-r bg-white p-4 transition-all duration-300`}
        >
            <div className="mb-6">
                {open && (
                    <>
                        <h1 className="text-xl font-bold">
                            SCIMS
                        </h1>

                        <p className="text-sm text-gray-500">
                            Supply Chain & Inventory
                        </p>
                    </>
                )}
            </div>

            <nav className="space-y-2">
                {navigation.map((item) =>
                    item.children ? (
                        <SidebarGroup
                            key={item.title}
                            title={item.title}
                            icon={item.icon}
                            children={item.children}
                            open={open}
                        />
                    ) : (
                        <SidebarItem
                            key={item.path}
                            title={item.title}
                            path={item.path}
                            open={open}
                        />
                    )
                )}
            </nav>
        </aside>
    );
}