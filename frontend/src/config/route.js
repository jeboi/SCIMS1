const routes = {
    dashboard: "/dashboard",

    warehouse: {
        setup: "/warehouse/setup",
        receiving: "/warehouse/receiving",
        storage: "/warehouse/storage",
        operations: "/warehouse/operations",
        barcode: "/warehouse/barcode",
        locations: "/warehouse/locations",
        reports: "/warehouse/reports",
    },

    inventory: {
        items: "/inventory/items",
        monitoring: "/inventory/monitoring",
        transactions: "/inventory/transactions",
        forecasting: "/inventory/forecasting",
        reports: "/inventory/reports",
    },

    procurement: {
        purchaseRequests: "/procurement/purchase-requests",
        supplierSourcing: "/procurement/supplier-sourcing",
        approval: "/procurement/approval",
        tracking: "/procurement/tracking",
        reports: "/procurement/reports",
    },

    suppliers: {
        registration: "/suppliers/registration",
        information: "/suppliers/information",
        evaluation: "/suppliers/evaluation",
        performance: "/suppliers/performance",
        reports: "/suppliers/reports",
    },

    purchaseOrders: {
        creation: "/purchase-orders/creation",
        approval: "/purchase-orders/approval",
        processing: "/purchase-orders/processing",
        tracking: "/purchase-orders/tracking",
        reports: "/purchase-orders/reports",
    },

    logistics: {
        documents: "/logistics/documents",
        tracking: "/logistics/tracking",
        monitoring: "/logistics/monitoring",
        deliveryConfirmation: "/logistics/delivery-confirmation",
        auditTrail: "/logistics/audit-trail",
    },

    reports: "/reports",

    settings: "/settings",

    auth: {
        login: "/login",
        register: "/register",
        forgotPassword: "/forgot-password",
    },

    errors: {
        unauthorized: "/unauthorized",
        forbidden: "/forbidden",
        notFound: "/404",
    },
};

export default routes;