"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getBreadcrumb } from "@/utils/breadcrumb";

export default function Breadcrumb() {
    const pathname = usePathname();

    const items = getBreadcrumb(pathname);

    return (
        <nav className="flex items-center gap-2 text-sm text-gray-500">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2"
                >
                    {index !== 0 && (
                        <ChevronRight size={16} />
                    )}

                    {item.path ? (
                        <Link
                            href={item.path}
                            className="hover:text-blue-600"
                        >
                            {item.title}
                        </Link>
                    ) : (
                        <span>{item.title}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}