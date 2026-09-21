import {
    LayoutDashboard,
    Warehouse,
    Boxes,
    ShoppingCart,
    Users,
    ClipboardList,
    Truck,
    BarChart3,
    Settings,
    Package,
    Shield,
    Key,
} from "lucide-react";

import { PERMISSIONS } from "@/utils/permissions";

export const sidebarMenu = [
    {
        category: null,
        items: [
            {
                title: "Dashboard",
                icon: LayoutDashboard,
                href: "/dashboard",
                requiredPermission: PERMISSIONS.DASHBOARD_VIEW,
            },
        ],
    },
    {
        category: "OPERATIONS",
        items: [
            {
                title: "Smart Warehousing System",
                icon: Warehouse,
                requiredPermission: PERMISSIONS.WAREHOUSING_VIEW,
                children: [
                    {
                        title: "Warehouse Setup",
                        href: "/warehouse/setup",
                        requiredPermission: PERMISSIONS.WAREHOUSING_VIEW,
                    },
                    {
                        title: "Goods Receiving",
                        href: "/warehouse/receiving",
                        requiredPermission: PERMISSIONS.WAREHOUSING_CREATE,
                    },
                    {
                        title: "Warehouse Storage",
                        href: "/warehouse/storage",
                        requiredPermission: PERMISSIONS.WAREHOUSING_VIEW,
                    },
                    {
                        title: "Warehouse Operations",
                        href: "/warehouse/operations",
                        requiredPermission: PERMISSIONS.WAREHOUSING_EDIT,
                    },
                    {
                        title: "Barcode & QR Code Management",
                        href: "/warehouse/barcode",
                        requiredPermission: PERMISSIONS.WAREHOUSING_EDIT,
                    },
                    {
                        title: "Stock Location Management",
                        href: "/warehouse/locations",
                        requiredPermission: PERMISSIONS.WAREHOUSING_EDIT,
                    },
                    {
                        title: "Warehouse Reports",
                        href: "/warehouse/reports",
                        requiredPermission: PERMISSIONS.REPORTS_VIEW,
                    },
                ],
            },
            {
                title: "Inventory Management System",
                icon: Boxes,
                requiredPermission: PERMISSIONS.INVENTORY_VIEW,
                children: [
                    {
                        title: "Item Management",
                        href: "/inventory/items",
                        requiredPermission: PERMISSIONS.INVENTORY_VIEW,
                    },
                    {
                        title: "Inventory Monitoring",
                        href: "/inventory/monitoring",
                        requiredPermission: PERMISSIONS.INVENTORY_VIEW,
                    },
                    {
                        title: "Inventory Transactions",
                        href: "/inventory/transactions",
                        requiredPermission: PERMISSIONS.INVENTORY_VIEW,
                    },
                    {
                        title: "Inventory Forecasting",
                        href: "/inventory/forecasting",
                        requiredPermission: PERMISSIONS.INVENTORY_VIEW,
                    },
                    {
                        title: "Inventory Reports",
                        href: "/inventory/reports",
                        requiredPermission: PERMISSIONS.REPORTS_VIEW,
                    },
                ],
            },
            {
                title: "Procurement & Sourcing Management",
                icon: ShoppingCart,
                requiredPermission: PERMISSIONS.PROCUREMENT_VIEW,
                children: [
                    {
                        title: "Purchase Request Management",
                        href: "/procurement/purchase-requests",
                        requiredPermission: PERMISSIONS.PROCUREMENT_VIEW,
                    },
                    {
                        title: "Supplier Sourcing",
                        href: "/procurement/supplier-sourcing",
                        requiredPermission: PERMISSIONS.PROCUREMENT_VIEW,
                    },
                    {
                        title: "Procurement Approval",
                        href: "/procurement/approval",
                        requiredPermission: PERMISSIONS.PROCUREMENT_APPROVE,
                    },
                    {
                        title: "Procurement Tracking",
                        href: "/procurement/tracking",
                        requiredPermission: PERMISSIONS.PROCUREMENT_VIEW,
                    },
                    {
                        title: "Procurement Reports",
                        href: "/procurement/reports",
                        requiredPermission: PERMISSIONS.REPORTS_VIEW,
                    },
                ],
            },
            {
                title: "Supplier Management",
                icon: Users,
                requiredPermission: PERMISSIONS.SUPPLIERS_VIEW,
                children: [
                    {
                        title: "Supplier Registration",
                        href: "/suppliers/registration",
                        requiredPermission: PERMISSIONS.SUPPLIERS_CREATE,
                    },
                    {
                        title: "Supplier Information Management",
                        href: "/suppliers/information",
                        requiredPermission: PERMISSIONS.SUPPLIERS_VIEW,
                    },
                    {
                        title: "Supplier Evaluation",
                        href: "/suppliers/evaluation",
                        requiredPermission: PERMISSIONS.SUPPLIERS_EVALUATE,
                    },
                    {
                        title: "Supplier Performance Monitoring",
                        href: "/suppliers/performance",
                        requiredPermission: PERMISSIONS.SUPPLIERS_VIEW,
                    },
                    {
                        title: "Supplier Reports",
                        href: "/suppliers/reports",
                        requiredPermission: PERMISSIONS.REPORTS_VIEW,
                    },
                ],
            },
            {
                title: "Purchase Order Management",
                icon: ClipboardList,
                requiredPermission: PERMISSIONS.PURCHASE_ORDERS_VIEW,
                children: [
                    {
                        title: "Order Creation",
                        href: "/purchase-orders/creation",
                        requiredPermission: PERMISSIONS.PURCHASE_ORDERS_CREATE,
                    },
                    {
                        title: "Order Approval",
                        href: "/purchase-orders/approval",
                        requiredPermission: PERMISSIONS.PURCHASE_ORDERS_APPROVE,
                    },
                    {
                        title: "Order Processing",
                        href: "/purchase-orders/processing",
                        requiredPermission: PERMISSIONS.PURCHASE_ORDERS_EDIT,
                    },
                    {
                        title: "Order Tracking",
                        href: "/purchase-orders/tracking",
                        requiredPermission: PERMISSIONS.PURCHASE_ORDERS_VIEW,
                    },
                    {
                        title: "Order Reports",
                        href: "/purchase-orders/reports",
                        requiredPermission: PERMISSIONS.REPORTS_VIEW,
                    },
                ],
            },
            {
                title: "Document Tracking & Logistics (DTRS)",
                icon: Truck,
                requiredPermission: PERMISSIONS.LOGISTICS_VIEW,
                children: [
                    {
                        title: "Logistics Documents",
                        href: "/logistics/documents",
                        requiredPermission: PERMISSIONS.LOGISTICS_VIEW,
                    },
                    {
                        title: "Document Tracking",
                        href: "/logistics/tracking",
                        requiredPermission: PERMISSIONS.LOGISTICS_VIEW,
                    },
                    {
                        title: "Logistics Monitoring",
                        href: "/logistics/monitoring",
                        requiredPermission: PERMISSIONS.LOGISTICS_VIEW,
                    },
                    {
                        title: "Delivery Confirmation",
                        href: "/logistics/delivery-confirmation",
                        requiredPermission: PERMISSIONS.LOGISTICS_CREATE,
                    },
                    {
                        title: "Audit Trail & Reports",
                        href: "/logistics/audit-trail",
                        requiredPermission: PERMISSIONS.REPORTS_VIEW,
                    },
                ],
            },
            {
                title: "Stock Requests",
                icon: Package,
                requiredPermission: PERMISSIONS.INVENTORY_VIEW,
                children: [
                    {
                        title: "Restaurant Stock Requests",
                        href: "/stock-request/restaurant-stock-requests",
                        requiredPermission: PERMISSIONS.INVENTORY_VIEW,
                    },
                    {
                        title: "Hotel Stock Requests",
                        href: "/stock-request/hotel-stock-requests",
                        requiredPermission: PERMISSIONS.INVENTORY_VIEW,
                    },
                ]
            }
        ],
    },
    {
        category: "ANALYTICS",
        items: [
            {
                title: "Reports & Analytics",
                icon: BarChart3,
                href: "/reports",
                requiredPermission: PERMISSIONS.REPORTS_VIEW,
            },
        ],
    },
    {
        category: "USER MANAGEMENT",
        items: [
            {
                title: "Users",
                icon: Users,
                href: "/users",
                requiredPermission: PERMISSIONS.USERS_VIEW,
            },
            {
                title: "Roles & Permissions",
                icon: Shield,
                href: "/permissions",
                requiredPermission: PERMISSIONS.PERMISSIONS_VIEW,
            },
        ],
    },
];

export default sidebarMenu;