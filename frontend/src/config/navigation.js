import {
    LayoutDashboard,
    Warehouse,
    Boxes,
    ShoppingCart,
    Users,
    ClipboardList,
    Truck,
    FileBarChart,
    Settings,
} from "lucide-react";

import routes from "@/config/route";

const navigation = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: routes.dashboard,
    },

    {
        title: "Smart Warehousing System",
        icon: Warehouse,
        children: [
            {
                title: "Warehouse Setup",
                path: routes.warehouse.setup,
            },
            {
                title: "Goods Receiving",
                path: routes.warehouse.receiving,
            },
            {
                title: "Warehouse Storage",
                path: routes.warehouse.storage,
            },
            {
                title: "Warehouse Operations",
                path: routes.warehouse.operations,
            },
            {
                title: "Barcode & QR Code Management",
                path: routes.warehouse.barcode,
            },
            {
                title: "Stock Location Management",
                path: routes.warehouse.locations,
            },
            {
                title: "Warehouse Reports",
                path: routes.warehouse.reports,
            },
        ],
    },

    {
        title: "Inventory Management System",
        icon: Boxes,
        children: [
            {
                title: "Item Management",
                path: routes.inventory.items,
            },
            {
                title: "Inventory Monitoring",
                path: routes.inventory.monitoring,
            },
            {
                title: "Inventory Transactions",
                path: routes.inventory.transactions,
            },
            {
                title: "Inventory Forecasting",
                path: routes.inventory.forecasting,
            },
            {
                title: "Inventory Reports",
                path: routes.inventory.reports,
            },
        ],
    },

    {
        title: "Procurement & Sourcing Management",
        icon: ShoppingCart,
        children: [
            {
                title: "Purchase Request Management",
                path: routes.procurement.purchaseRequests,
            },
            {
                title: "Supplier Sourcing",
                path: routes.procurement.supplierSourcing,
            },
            {
                title: "Procurement Approval",
                path: routes.procurement.approval,
            },
            {
                title: "Procurement Tracking",
                path: routes.procurement.tracking,
            },
            {
                title: "Procurement Reports",
                path: routes.procurement.reports,
            },
        ],
    },

    {
        title: "Supplier Management",
        icon: Users,
        children: [
            {
                title: "Supplier Registration",
                path: routes.suppliers.registration,
            },
            {
                title: "Supplier Information Management",
                path: routes.suppliers.information,
            },
            {
                title: "Supplier Evaluation",
                path: routes.suppliers.evaluation,
            },
            {
                title: "Supplier Performance Monitoring",
                path: routes.suppliers.performance,
            },
            {
                title: "Supplier Reports",
                path: routes.suppliers.reports,
            },
        ],
    },

    {
        title: "Purchase Order Management",
        icon: ClipboardList,
        children: [
            {
                title: "Purchase Order Creation",
                path: routes.purchaseOrders.creation,
            },
            {
                title: "Purchase Order Approval",
                path: routes.purchaseOrders.approval,
            },
            {
                title: "Purchase Order Processing",
                path: routes.purchaseOrders.processing,
            },
            {
                title: "Purchase Order Tracking",
                path: routes.purchaseOrders.tracking,
            },
            {
                title: "Purchase Order Reports",
                path: routes.purchaseOrders.reports,
            },
        ],
    },

    {
        title: "Document Tracking & Logistics Records System",
        icon: Truck,
        children: [
            {
                title: "Logistics Documents",
                path: routes.logistics.documents,
            },
            {
                title: "Document Tracking",
                path: routes.logistics.tracking,
            },
            {
                title: "Logistics Monitoring",
                path: routes.logistics.monitoring,
            },
            {
                title: "Delivery Confirmation",
                path: routes.logistics.deliveryConfirmation,
            },
            {
                title: "Audit Trail & Reports",
                path: routes.logistics.auditTrail,
            },
        ],
    },

    {
        title: "Reports",
        icon: FileBarChart,
        path: routes.reports,
    },

    {
        title: "Settings",
        icon: Settings,
        path: routes.settings,
    },
];

export default navigation;