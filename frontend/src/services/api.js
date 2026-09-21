import axios from "axios";
import axiosInstance from "@/lib/axios";
import appConfig from "@/config/app";

// Health
export const getHealth = async () => {
    const response = await axiosInstance.get("/health");
    return response.data;
};

// CSRF
export const csrf = async () => {
    await axios.get(`${appConfig.backendUrl}/sanctum/csrf-cookie`, {
        withCredentials: true,
    });
};

// Login
export const login = async (credentials) => {
    const response = await axiosInstance.post("/login", credentials);
    return response.data;
};

// User
export const getUser = async () => {
    const response = await axiosInstance.get("/user");
    return response.data;
};

// Logout
export const logout = async () => {
    console.log("Sending logout request...");
    const response = await axiosInstance.post("/logout");
    console.log("Logout response:", response);
    return response.data;
};

// Dashboard
export const getDashboardMetrics = async () => {
    const response = await axiosInstance.get("/dashboard/metrics");
    return response.data;
};

// Warehouses
export const getWarehouses = async () => {
    const response = await axiosInstance.get("/warehouses");
    return response.data;
};

export const createWarehouse = async (data) => {
    const response = await axiosInstance.post("/warehouses", data);
    return response.data;
};

export const updateWarehouse = async (id, data) => {
    const response = await axiosInstance.put(`/warehouses/${id}`, data);
    return response.data;
};

export const deleteWarehouse = async (id) => {
    const response = await axiosInstance.delete(`/warehouses/${id}`);
    return response.data;
};

// Storage Locations
export const getStorageLocations = async () => {
    const response = await axiosInstance.get("/storage-locations");
    return response.data;
};

export const createStorageLocation = async (data) => {
    const response = await axiosInstance.post("/storage-locations", data);
    return response.data;
};

export const updateStorageLocation = async (id, data) => {
    const response = await axiosInstance.put(`/storage-locations/${id}`, data);
    return response.data;
};

export const deleteStorageLocation = async (id) => {
    const response = await axiosInstance.delete(`/storage-locations/${id}`);
    return response.data;
};

// Deliveries
export const getDeliveries = async () => {
    const response = await axiosInstance.get("/deliveries");
    return response.data;
};

export const createDelivery = async (data) => {
    const response = await axiosInstance.post("/deliveries", data);
    return response.data;
};

// Receiving Records
export const getReceivingRecords = async () => {
    const response = await axiosInstance.get("/receiving-records");
    return response.data;
};

export const createReceivingRecord = async (data) => {
    const response = await axiosInstance.post("/receiving-records", data);
    return response.data;
};

// Delivery Items
export const createDeliveryItems = async (data) => {
    const response = await axiosInstance.post("/delivery-items", data);
    return response.data;
};

// Inventory Monitoring
export const getItemsWithStock = async (params = {}) => {
    const response = await axiosInstance.get("/items", { params });
    return response.data;
};

// Suppliers
export const getSuppliers = async () => {
    const response = await axiosInstance.get("/suppliers");
    return response.data;
};

export const createSupplier = async (data) => {
    const response = await axiosInstance.post("/suppliers", data);
    return response.data;
};

export const updateSupplier = async (id, data) => {
    const response = await axiosInstance.put(`/suppliers/${id}`, data);
    return response.data;
};

export const deleteSupplier = async (id) => {
    const response = await axiosInstance.delete(`/suppliers/${id}`);
    return response.data;
};

// Purchase Orders
export const getPurchaseOrders = async () => {
    const response = await axiosInstance.get("/purchase-orders");
    return response.data;
};

export const createPurchaseOrder = async (data) => {
    const response = await axiosInstance.post("/purchase-orders", data);
    return response.data;
};

export const getPurchaseOrder = async (id) => {
    const response = await axiosInstance.get(`/purchase-orders/${id}`);
    return response.data;
};

export const updatePurchaseOrder = async (id, data) => {
    const response = await axiosInstance.put(`/purchase-orders/${id}`, data);
    return response.data;
};

export const deletePurchaseOrder = async (id) => {
    const response = await axiosInstance.delete(`/purchase-orders/${id}`);
    return response.data;
};

export const updatePurchaseOrderStatus = async (id, status) => {
    const response = await axiosInstance.patch(`/purchase-orders/${id}`, { status });
    return response.data;
};

// Purchase Order Approval
export const getPendingPurchaseOrders = async () => {
    const response = await axiosInstance.get("/purchase-orders");
    return response.data;
};

export const approvePurchaseOrder = async (id, data) => {
    const response = await axiosInstance.patch(`/purchase-orders/${id}`, data);
    return response.data;
};

// Barcode & QR Code
export const generateBarcode = async (itemId) => {
    const response = await axiosInstance.get(`/items/${itemId}`);
    return response.data;
};

export const getItemByBarcode = async (barcode) => {
    const response = await axiosInstance.get(`/items`, {
        params: { barcode }
    });
    return response.data;
};

// Delete Item
export const deleteItem = async (id) => {
    const response = await axiosInstance.delete(`/items/${id}`);
    return response.data;
};

// Toggle Item Status (Active/Inactive)
export const toggleItemStatus = async (id, status) => {
    const response = await axiosInstance.patch(`/items/${id}`, { status });
    return response.data;
};

// Reports - Inventory
export const getInventoryReport = async () => {
    const response = await axiosInstance.get("/inventory-report");
    return response.data;
};

// Procurement Tracking
export const getProcurementDashboard = async () => {
    const response = await axiosInstance.get("/procurement/dashboard");
    return response.data;
};

export const getProcurementTimeline = async (id) => {
    const response = await axiosInstance.get(`/procurement/timeline/${id}`);
    return response.data;
};