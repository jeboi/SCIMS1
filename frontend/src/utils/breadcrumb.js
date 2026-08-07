import navigation from "@/config/navigation";

export function getBreadcrumb(pathname) {
    if (pathname === "/dashboard") {
        return [{ title: "Dashboard", path: "/dashboard" }];
    }

    for (const group of navigation) {
        if (!group.children) continue;

        const child = group.children.find(
            (item) => item.path === pathname
        );

        if (child) {
            return [
                {
                    title: "Dashboard",
                    path: "/dashboard",
                },
                {
                    title: group.title,
                    path: null,
                },
                {
                    title: child.title,
                    path: child.path,
                },
            ];
        }
    }

    return [];
}