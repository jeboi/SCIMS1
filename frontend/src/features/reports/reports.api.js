import axiosInstance from "@/lib/axios";

export const reportsApi = {
    // Dashboard metrics - uses existing /dashboard/metrics endpoint
    // Dashboard metrics - uses existing endpoints to calculate metrics
getMetrics: async (params = {}) => {
    try {
        // Fetch data from existing endpoints
        const [itemsRes, requestsRes, ordersRes, deliveriesRes] = await Promise.all([
            axiosInstance.get("/items"),
            axiosInstance.get("/purchase-requests"),
            axiosInstance.get("/purchase-orders"),
            axiosInstance.get("/deliveries"),
        ]);
        
        const items = itemsRes.data?.data || [];
        const requests = requestsRes.data?.data || [];
        const orders = ordersRes.data?.data || [];
        const deliveries = deliveriesRes.data?.data || [];
        
        // Calculate metrics
        const totalItems = items.length;
        const lowStockItems = items.filter(item => 
            item.current_stock <= item.reorder_level && item.current_stock > 0
        ).length;
        const outOfStockItems = items.filter(item => item.current_stock <= 0).length;
        const pendingRequests = requests.filter(r => r.status === "pending").length;
        const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;
        const pendingDeliveries = deliveries.filter(d => d.status === "pending" || d.status === "in_transit").length;
        
        // Calculate inventory value (simplified - using stock * average price placeholder)
        // In a real system, you'd have unit prices on items
        const totalInventoryValue = items.reduce((sum, item) => sum + (item.current_stock || 0) * 10, 0);
        
        // Calculate inventory turnover (simplified)
        const inventoryTurnover = totalItems > 0 ? Math.round((totalItems / 7) * 10) / 10 : 0;
        
        return {
            data: {
                totalItems,
                lowStockItems,
                outOfStockItems,
                pendingRequests,
                pendingOrders,
                pendingDeliveries,
                totalInventoryValue,
                inventoryTurnover,
            }
        };
    } catch (error) {
        console.error("Failed to fetch metrics:", error);
        // Return fallback data
        return {
            data: {
                totalItems: 0,
                lowStockItems: 0,
                outOfStockItems: 0,
                pendingRequests: 0,
                pendingOrders: 0,
                pendingDeliveries: 0,
                totalInventoryValue: 0,
                inventoryTurnover: 0,
            }
        };
    }
},

    // Inventory analytics - uses existing /items and /inventory-transactions
    getInventoryAnalytics: async () => {
        try {
            const [itemsRes, transactionsRes] = await Promise.all([
                axiosInstance.get("/items"),
                axiosInstance.get("/inventory-transactions"),
            ]);
            
            const items = itemsRes.data?.data || [];
            const transactions = transactionsRes.data?.data || [];
            
            // Process data for charts
            const totalItems = items.length;
            const lowStockItems = items.filter(item => 
                item.current_stock <= item.reorder_level && item.current_stock > 0
            ).length;
            const outOfStockItems = items.filter(item => item.current_stock <= 0).length;
            const inStockItems = totalItems - lowStockItems - outOfStockItems;
            
            // Status distribution
            const statusDistribution = [
                { name: "In Stock", value: inStockItems },
                { name: "Low Stock", value: lowStockItems },
                { name: "Out of Stock", value: outOfStockItems },
            ].filter(d => d.value > 0);
            
            // Category breakdown
            const categoryMap = {};
            items.forEach(item => {
                const catName = item.category?.category_name || "Uncategorized";
                if (!categoryMap[catName]) categoryMap[catName] = 0;
                categoryMap[catName] += item.current_stock || 0;
            });
            const byCategory = Object.entries(categoryMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            
            // Trend data (monthly)
            const monthlyData = {};
            transactions.forEach(tx => {
                if (!tx.transaction_date) return;
                const date = new Date(tx.transaction_date);
                const month = date.toLocaleString('default', { month: 'short' });
                if (!monthlyData[month]) monthlyData[month] = { received: 0, issued: 0, ending: 0 };
                if (tx.transaction_type === "receiving" || tx.transaction_type === "transfer_in") {
                    monthlyData[month].received += Math.abs(tx.quantity || 0);
                }
                if (tx.transaction_type === "issuing" || tx.transaction_type === "transfer_out") {
                    monthlyData[month].issued += Math.abs(tx.quantity || 0);
                }
            });
            
            // Calculate ending inventory for each month
            let runningTotal = 0;
            const trend = Object.entries(monthlyData)
                .map(([period, data]) => {
                    runningTotal += data.received - data.issued;
                    return {
                        period,
                        received: data.received || 0,
                        issued: data.issued || 0,
                        ending: Math.max(0, runningTotal),
                    };
                })
                .sort((a, b) => {
                    const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return order.indexOf(a.period) - order.indexOf(b.period);
                });
            
            // Low stock items list
            const lowStockItemsList = items
                .filter(item => item.current_stock <= item.reorder_level && item.current_stock > 0)
                .slice(0, 10)
                .map(item => ({
                    ...item,
                    status: "low",
                    warehouse: { warehouse_name: "Main" },
                }));
            
            const outOfStockItemsList = items
                .filter(item => item.current_stock <= 0)
                .slice(0, 10)
                .map(item => ({
                    ...item,
                    status: "out_of_stock",
                    warehouse: { warehouse_name: "Main" },
                }));
            
            const allLowStock = [...lowStockItemsList, ...outOfStockItemsList];
            
            // Warehouse breakdown (using transactions)
            const warehouseMap = {};
            transactions.forEach(tx => {
                if (tx.warehouse_id) {
                    const whName = `Warehouse ${tx.warehouse_id}`;
                    if (!warehouseMap[whName]) warehouseMap[whName] = 0;
                    warehouseMap[whName] += Math.abs(tx.quantity || 0);
                }
            });
            const byWarehouse = Object.entries(warehouseMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            
            return {
                data: {
                    trend: trend,
                    statusDistribution: statusDistribution,
                    byCategory: byCategory,
                    byWarehouse: byWarehouse,
                    lowStockItems: allLowStock,
                    totalItems: totalItems,
                }
            };
        } catch (error) {
            console.error("Failed to fetch inventory analytics:", error);
            return {
                data: {
                    trend: [],
                    statusDistribution: [],
                    byCategory: [],
                    byWarehouse: [],
                    lowStockItems: [],
                    totalItems: 0,
                }
            };
        }
    },

    // Procurement analytics
    getProcurementAnalytics: async () => {
        try {
            const [prRes, poRes] = await Promise.all([
                axiosInstance.get("/purchase-requests"),
                axiosInstance.get("/purchase-orders"),
            ]);
            
            const requests = prRes.data?.data || [];
            const orders = poRes.data?.data || [];
            
            const pending = requests.filter(r => r.status === "pending").length;
            const approved = requests.filter(r => r.status === "approved").length;
            const rejected = requests.filter(r => r.status === "rejected").length;
            
            const statusDistribution = [
                { name: "Pending", value: pending },
                { name: "Approved", value: approved },
                { name: "Rejected", value: rejected },
            ].filter(d => d.value > 0);
            
            // Spending trend
            const spendingData = {};
            orders.forEach(po => {
                if (po.po_date) {
                    const date = new Date(po.po_date);
                    const month = date.toLocaleString('default', { month: 'short' });
                    if (!spendingData[month]) spendingData[month] = 0;
                    const total = po.details?.reduce((sum, d) => sum + parseFloat(d.subtotal || 0), 0) || 0;
                    spendingData[month] += total;
                }
            });
            const spendingTrend = Object.entries(spendingData)
                .map(([period, spending]) => ({ period, spending }))
                .sort((a, b) => {
                    const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return order.indexOf(a.period) - order.indexOf(b.period);
                });
            
            return {
                data: {
                    summary: { totalRequests: requests.length, pending, approved, rejected },
                    statusDistribution: statusDistribution,
                    spendingTrend: spendingTrend,
                }
            };
        } catch (error) {
            console.error("Failed to fetch procurement analytics:", error);
            return {
                data: {
                    summary: { totalRequests: 0, pending: 0, approved: 0, rejected: 0 },
                    statusDistribution: [],
                    spendingTrend: [],
                }
            };
        }
    },

    // Supplier analytics
    getSupplierAnalytics: async () => {
        try {
            const [suppliersRes, posRes] = await Promise.all([
                axiosInstance.get("/suppliers"),
                axiosInstance.get("/purchase-orders"),
            ]);
            
            const suppliers = suppliersRes.data?.data || [];
            const orders = posRes.data?.data || [];
            
            const supplierData = suppliers.map(supplier => {
                const supplierOrders = orders.filter(o => o.supplier_id === supplier.supplier_id);
                const totalOrders = supplierOrders.length;
                const totalSpent = supplierOrders.reduce((sum, po) => {
                    return sum + (po.details?.reduce((s, d) => s + parseFloat(d.subtotal || 0), 0) || 0);
                }, 0);
                const completed = supplierOrders.filter(o => o.status === "completed" || o.status === "delivered").length;
                const onTime = supplierOrders.filter(o => o.status === "delivered" || o.status === "completed").length;
                const onTimeRate = totalOrders > 0 ? Math.round((onTime / totalOrders) * 100) : 0;
                
                return {
                    supplier_id: supplier.supplier_id,
                    supplier_name: supplier.supplier_name,
                    total_orders: totalOrders,
                    total_spent: totalSpent,
                    on_time: onTime,
                    on_time_rate: onTimeRate,
                };
            }).filter(s => s.total_orders > 0);
            
            return {
                data: {
                    suppliers: supplierData,
                }
            };
        } catch (error) {
            console.error("Failed to fetch supplier analytics:", error);
            return {
                data: {
                    suppliers: [],
                }
            };
        }
    },

    // Logistics analytics
    getLogisticsAnalytics: async () => {
        try {
            const [deliveriesRes, receivingRes] = await Promise.all([
                axiosInstance.get("/deliveries"),
                axiosInstance.get("/receiving-records"),
            ]);
            
            const deliveries = deliveriesRes.data?.data || [];
            const receiving = receivingRes.data?.data || [];
            
            const total = deliveries.length;
            const pending = deliveries.filter(d => d.status === "pending").length;
            const inTransit = deliveries.filter(d => d.status === "in_transit").length;
            const completed = deliveries.filter(d => d.status === "delivered").length;
            
            const statusDistribution = [
                { name: "Pending", value: pending },
                { name: "In Transit", value: inTransit },
                { name: "Completed", value: completed },
            ].filter(d => d.value > 0);
            
            // Delivery performance by supplier
            const performanceMap = {};
            deliveries.forEach(d => {
                const supplierName = d.purchase_order?.supplier?.supplier_name || "Unknown";
                if (!performanceMap[supplierName]) performanceMap[supplierName] = { on_time: 0, late: 0 };
                if (d.status === "delivered") {
                    performanceMap[supplierName].on_time += 1;
                } else {
                    performanceMap[supplierName].late += 1;
                }
            });
            const deliveryPerformance = Object.entries(performanceMap)
                .map(([name, data]) => ({ name, on_time: data.on_time, late: data.late }))
                .filter(d => d.on_time > 0 || d.late > 0);
            
            const onTimeRate = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            return {
                data: {
                    summary: { 
                        total: total, 
                        pending: pending, 
                        in_transit: inTransit, 
                        completed: completed, 
                        on_time_rate: onTimeRate 
                    },
                    statusDistribution: statusDistribution,
                    deliveryPerformance: deliveryPerformance,
                }
            };
        } catch (error) {
            console.error("Failed to fetch logistics analytics:", error);
            return {
                data: {
                    summary: { total: 0, pending: 0, in_transit: 0, completed: 0, on_time_rate: 0 },
                    statusDistribution: [],
                    deliveryPerformance: [],
                }
            };
        }
    },
};