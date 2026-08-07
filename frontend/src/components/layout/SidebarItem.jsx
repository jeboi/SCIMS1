"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function SidebarItem({
    title,
    path,
    open,
}) {
    const pathname = usePathname();

    const active = pathname === path;

    return (
        <Link
            href={path}
            className={clsx(
                "flex items-center rounded-lg px-3 py-2 transition-colors duration-200",
                active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
            )}
        >
            {open && (
                <span className="text-sm">
                    {title}
                </span>
            )}
        </Link>
    );
}