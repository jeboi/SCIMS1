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
} from "lucide-react";

export const sidebarMenu = [
    {
        category: null,
        items: [
            {
                title: "Dashboard",
                icon: LayoutDashboard,
                href: "/dashboard",
            },
        ],
    },
    {
        category: "OPERATIONS",
        items: [
            {
                title: "Smart Warehousing System",
                icon: Warehouse,
                children: [
                    { title: "Warehouse Setup", href: "/warehouse/setup" },
                    { title: "Goods Receiving", href: "/warehouse/receiving" },
                    { title: "Warehouse Storage", href: "/warehouse/storage" },
                    { title: "Warehouse Operations", href: "/warehouse/operations" },
                    { title: "Barcode & QR Code Management", href: "/warehouse/barcode" },
                    { title: "Stock Location Management", href: "/warehouse/locations" },
                    { title: "Warehouse Reports", href: "/warehouse/reports" },
                ],
            },
            {
                title: "Inventory Management System",
                icon: Boxes,
                children: [
                    { title: "Item Management", href: "/inventory/items" },
                    { title: "Inventory Monitoring", href: "/inventory/monitoring" },
                    { title: "Inventory Transactions", href: "/inventory/transactions" },
                    { title: "Inventory Forecasting", href: "/inventory/forecasting" },
                    { title: "Inventory Reports", href: "/inventory/reports" },
                ],
            },
            {
                title: "Procurement & Sourcing Management",
                icon: ShoppingCart,
                children: [
                    { title: "Purchase Request Management", href: "/procurement/purchase-requests" },
                    { title: "Supplier Sourcing", href: "/procurement/supplier-sourcing" },
                    { title: "Procurement Approval", href: "/procurement/approval" },
                    { title: "Procurement Tracking", href: "/procurement/tracking" },
                    { title: "Procurement Reports", href: "/procurement/reports" },
                ],
            },
            {
                title: "Supplier Management",
                icon: Users,
                children: [
                    { title: "Supplier Registration", href: "/suppliers/registration" },
                    { title: "Supplier Information Management", href: "/suppliers/information" },
                    { title: "Supplier Evaluation", href: "/suppliers/evaluation" },
                    { title: "Supplier Performance Monitoring", href: "/suppliers/performance" },
                    { title: "Supplier Reports", href: "/suppliers/reports" },
                ],
            },
            {
                title: "Purchase Order Management",
                icon: ClipboardList,
                children: [
                    { title: "Order Creation", href: "/purchase-orders/creation" },
                    { title: "Order Approval", href: "/purchase-orders/approval" },
                    { title: "Order Processing", href: "/purchase-orders/processing" },
                    { title: "Order Tracking", href: "/purchase-orders/tracking" },
                    { title: "Order Reports", href: "/purchase-orders/reports" },
                ],
            },
            {
                title: "Document Tracking & Logistics (DTRS)",
                icon: Truck,
                children: [
                    { title: "Logistics Documents", href: "/logistics/documents" },
                    { title: "Document Tracking", href: "/logistics/tracking" },
                    { title: "Logistics Monitoring", href: "/logistics/monitoring" },
                    { title: "Delivery Confirmation", href: "/logistics/delivery-confirmation" },
                    { title: "Audit Trail & Reports", href: "/logistics/audit-trail" },
                ],
            },
            {
                title: "Stock Requests",
                icon: Package,
                children: [
                    { title: "Restaurant Stock Requests", href: "/stock-request/restaurant-stock-requests" },
                    { title: "Hotel Stock Requests", href: "/stock-request/hotel-stock-requests" },
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
            },
        ],
    },
    
];

export default sidebarMenu;