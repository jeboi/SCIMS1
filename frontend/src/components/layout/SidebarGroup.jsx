"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import SidebarItem from "./SidebarItem";

export default function SidebarGroup({
    title,
    icon: Icon,
    children,
    open,
}) {
    const pathname = usePathname();

    const hasActiveChild = children.some(
        (child) => child.path === pathname
    );

    const [expanded, setExpanded] =
        useState(hasActiveChild);

    useEffect(() => {
        if (hasActiveChild) {
            setExpanded(true);
        }
    }, [hasActiveChild]);

    return (
        <div className="mb-2">
            <button
                onClick={() =>
                    setExpanded(!expanded)
                }
                className={`
                    flex w-full items-center rounded-lg px-3 py-2
                    hover:bg-gray-100 transition-colors
                    ${
                        hasActiveChild
                            ? "bg-blue-50"
                            : ""
                    }
                `}
            >
                <div className="flex items-center gap-3 flex-1">
                    {Icon && (
                        <Icon
                            size={20}
                            className="flex-shrink-0"
                        />
                    )}

                    {open && (
                        <span className="text-sm font-medium">
                            {title}
                        </span>
                    )}
                </div>

                {open &&
                    (expanded ? (
                        <ChevronDown size={18} />
                    ) : (
                        <ChevronRight size={18} />
                    ))}
            </button>

            {open && expanded && (
                <div className="mt-1 ml-8 space-y-1">
                    {children.map((item) => (
                        <SidebarItem
                            key={item.path}
                            title={item.title}
                            path={item.path}
                            open={open}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}