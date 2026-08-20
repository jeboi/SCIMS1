"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { getDashboardMetrics } from "@/services/api";
import axiosInstance from "@/lib/axios";

import {
    ArrowUpRight,
    Boxes,
    ShoppingCart,
    Users,
    Warehouse,
    AlertTriangle,
    FileText,
    ClipboardList,
    Package,
    Activity,
    TrendingUp,
    CircleCheck,
    Zap,
    Truck,
    Calendar,
    Clock,
    Eye,
    Plus,
    RefreshCw,
    Loader2
} from "lucide-react";

// Dynamic SVG Coordinate Generator for Object Data Array
const getSparklinePointsWithCoords = (data = [], width = 200, height = 40) => {
    if (!data || data.length === 0) return { pointsStr: `0,${height / 2} ${width},${height / 2}`, coords: [] };

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const coords = data.map((item, idx) => {
        const x = data.length === 1 ? width / 2 : (idx / (data.length - 1)) * width;
        const y = range === 0 ? height / 2 : height - ((item.value - min) / range) * (height - 12) - 6;
        return { x, y, value: item.value, date: item.date };
    });

    const pointsStr = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");

    return { pointsStr, coords };
};

const operations = [
    {
        title: "Smart Warehousing System",
        description: "Monitor warehouse operations, storage, receiving, and stock locations.",
        icon: Warehouse,
        iconClass: "bg-blue-50 text-blue-600",
        href: "/warehouse/setup",
    },
    {
        title: "Inventory Management System",
        description: "Manage items, stock levels, transactions, and inventory forecasting.",
        icon: Boxes,
        iconClass: "bg-emerald-50 text-emerald-600",
        href: "/inventory/items",
    },
    {
        title: "Procurement & Sourcing Management",
        description: "Manage purchase requests, sourcing, approvals, and procurement tracking.",
        icon: ShoppingCart,
        iconClass: "bg-orange-50 text-orange-600",
        href: "/procurement/purchase-requests",
    },
    {
        title: "Supplier Management",
        description: "Manage supplier information, evaluations, and performance.",
        icon: Users,
        iconClass: "bg-purple-50 text-purple-600",
        href: "/suppliers/information",
    },
];

// Quick Actions
const quickActions = [
    { title: "Add Item", icon: Plus, href: "/inventory/items", color: "bg-blue-50 text-blue-600" },
    { title: "Create PO", icon: ShoppingCart, href: "/purchase-orders/creation", color: "bg-green-50 text-green-600" },
    { title: "Receive Goods", icon: Package, href: "/warehouse/receiving", color: "bg-purple-50 text-purple-600" },
    { title: "View Reports", icon: FileText, href: "/inventory/reports", color: "bg-orange-50 text-orange-600" },
];

export default function DashboardPage() {
    const { user } = useAuth();
    
    const [dashboardMetrics, setDashboardMetrics] = useState({
        totalItemsHistory: [],
        lowStockHistory: [],
        pendingRequestsHistory: [],
        pendingOrdersHistory: [],
        stockValueHistory: [],
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredCardKey, setHoveredCardKey] = useState(null);
    const [hoveredDataPoint, setHoveredDataPoint] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [inventoryStatus, setInventoryStatus] = useState([
        { label: "In Stock", value: 0, color: "bg-emerald-500", width: "0%" },
        { label: "Low Stock", value: 0, color: "bg-orange-500", width: "0%" },
        { label: "Out of Stock", value: 0, color: "bg-red-500", width: "0%" },
    ]);

    // Live API Data Fetching & Polling
    useEffect(() => {
        let isMounted = true;

        async function fetchDashboardMetrics() {
            try {
                const data = await getDashboardMetrics();
                if (isMounted) {
                    const now = new Date().toLocaleDateString();
                    setDashboardMetrics({
                        totalItemsHistory: [{ value: data.totalItems || 0, date: now }],
                        lowStockHistory: [{ value: data.lowStockItems || 0, date: now }],
                        pendingRequestsHistory: [{ value: data.pendingRequests || 0, date: now }],
                        pendingOrdersHistory: [{ value: data.pendingOrders || 0, date: now }],
                        stockValueHistory: [{ value: 0, date: now }],
                    });
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error loading metrics:", error);
                if (isMounted) setIsLoading(false);
            }
        }

        // Fetch additional dashboard data
        async function fetchAdditionalData() {
            try {
                // Fetch items for low stock alerts
                const itemsRes = await axiosInstance.get("/items");
                const items = itemsRes.data?.data || [];
                
                // Calculate inventory status
                const total = items.length;
                const lowStock = items.filter(item => 
                    item.current_stock <= item.reorder_level && item.current_stock > 0
                ).length;
                const outOfStock = items.filter(item => item.current_stock <= 0).length;
                const inStock = total - lowStock - outOfStock;

                setInventoryStatus([
                    { label: "In Stock", value: inStock, color: "bg-emerald-500", width: total ? `${Math.round((inStock / total) * 100)}%` : "0%" },
                    { label: "Low Stock", value: lowStock, color: "bg-orange-500", width: total ? `${Math.round((lowStock / total) * 100)}%` : "0%" },
                    { label: "Out of Stock", value: outOfStock, color: "bg-red-500", width: total ? `${Math.round((outOfStock / total) * 100)}%` : "0%" },
                ]);

                // Get low stock items for alerts
                const lowStockList = items
                    .filter(item => item.current_stock <= item.reorder_level)
                    .sort((a, b) => (a.current_stock / a.reorder_level) - (b.current_stock / b.reorder_level))
                    .slice(0, 5);
                setLowStockItems(lowStockList);

                // Fetch recent transactions
                const txRes = await axiosInstance.get("/inventory-transactions");
                const transactions = txRes.data?.data || [];
                const recent = transactions
                    .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
                    .slice(0, 5);
                setRecentActivity(recent);

                // Generate monthly trend
                const monthlyData = {};
                transactions.forEach(tx => {
                    if (tx.transaction_type === "transfer_out" || tx.transaction_type === "issuing") {
                        const date = new Date(tx.transaction_date);
                        const month = date.toLocaleString('default', { month: 'short' });
                        if (!monthlyData[month]) monthlyData[month] = 0;
                        monthlyData[month] += Math.abs(tx.quantity);
                    }
                });
                const trend = Object.entries(monthlyData)
                    .map(([month, value]) => ({ month, usage: value }))
                    .sort((a, b) => {
                        const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return order.indexOf(a.month) - order.indexOf(b.month);
                    });
                setMonthlyTrend(trend);

            } catch (err) {
                console.error("Error loading additional data:", err);
            }
        }

        fetchDashboardMetrics();
        fetchAdditionalData();
        const interval = setInterval(fetchDashboardMetrics, 30000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // Add axios import for additional data fetching
    // Note: Make sure axiosInstance is imported or use the existing one
    // If axiosInstance is not available, add this import at the top:
    // import axiosInstance from "@/lib/axios";

    // Calculate Dynamic Inventory Status Counts
    const totalItems = dashboardMetrics.totalItemsHistory.slice(-1)[0]?.value || 0;
    const lowStockItemsCount = dashboardMetrics.lowStockHistory.slice(-1)[0]?.value || 0;
    const inStockItems = Math.max(0, totalItems - lowStockItemsCount);

    const kpiCards = [
        {
            key: "totalItems",
            title: "Total Items",
            data: dashboardMetrics.totalItemsHistory,
            description: "Items registered in inventory",
            icon: Boxes,
            iconClass: "bg-blue-50 text-blue-600",
            strokeColor: "#2563eb",
            gradientId: "kpiBlue",
            unit: "Items",
        },
        {
            key: "lowStock",
            title: "Low Stock Items",
            data: dashboardMetrics.lowStockHistory,
            description: "Items requiring attention",
            icon: AlertTriangle,
            iconClass: "bg-orange-50 text-orange-600",
            strokeColor: "#f97316",
            gradientId: "kpiOrange",
            unit: "Items",
        },
        {
            key: "pendingRequests",
            title: "Pending Requests",
            data: dashboardMetrics.pendingRequestsHistory,
            description: "Procurement requests",
            icon: FileText,
            iconClass: "bg-purple-50 text-purple-600",
            strokeColor: "#9333ea",
            gradientId: "kpiPurple",
            unit: "Requests",
        },
        {
            key: "pendingOrders",
            title: "Pending Orders",
            data: dashboardMetrics.pendingOrdersHistory,
            description: "Purchase orders",
            icon: ShoppingCart,
            iconClass: "bg-emerald-50 text-emerald-600",
            strokeColor: "#10b981",
            gradientId: "kpiEmerald",
            unit: "Orders",
        },
    ];

    const currentStockValue = dashboardMetrics.stockValueHistory.slice(-1)[0]?.value || 0;
    const { pointsStr: stockPoints } = getSparklinePointsWithCoords(dashboardMetrics.stockValueHistory, 300, 70);

    useEffect(() => {
        const shouldShowWelcome = sessionStorage.getItem("show_welcome_toast");

        if (shouldShowWelcome && user) {
            const userName = user?.name || user?.first_name || "System Administrator";

            toast.success(`Welcome back, ${userName}! 👋`, {
                duration: 5000,
            });

            sessionStorage.removeItem("show_welcome_toast");
        }
    }, [user]);

    const userNameDisplay = user?.name || user?.first_name || "System Administrator";

    const getTransactionIcon = (type) => {
        const icons = {
            receiving: <Package className="h-4 w-4 text-green-600" />,
            transfer_in: <ArrowUpRight className="h-4 w-4 text-blue-600" />,
            transfer_out: <ArrowUpRight className="h-4 w-4 text-orange-600" />,
            adjustment: <Activity className="h-4 w-4 text-purple-600" />,
            return: <RefreshCw className="h-4 w-4 text-red-600" />,
        };
        return icons[type] || <Activity className="h-4 w-4 text-gray-400" />;
    };

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className={styles.dashboard}>
            {/* BREADCRUMB */}
            <div className={styles.breadcrumb}>
                <span>Dashboard</span>
                <span>/</span>
                <span>Overview</span>
            </div>

            {/* WELCOME BANNER */}
            <section className={styles.welcomeBanner}>
                <div className={styles.welcomeContent}>
                    <p className={styles.welcomeLabel}>Welcome back,</p>
                    <h1 className={styles.welcomeTitle}>{userNameDisplay}</h1>
                    <p className={styles.welcomeDescription}>
                        Monitor your supply chain operations, inventory, procurement, suppliers, and logistics from one place.
                    </p>
                </div>
                <div className={styles.welcomeDecoration}>
                    <Zap className="h-16 w-16 text-blue-300/30" />
                </div>
            </section>

            {/* SYSTEM OVERVIEW */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>System Overview</h2>
                    <p className={styles.sectionDescription}>Current supply chain and inventory status.</p>
                </div>

                <div className={styles.kpiGrid}>
                    {kpiCards.map((card) => {
                        const Icon = card.icon;
                        const latestValue = card.data.slice(-1)[0]?.value || 0;
                        const isHoveredCard = hoveredCardKey === card.key;
                        const displayedValue = isHoveredCard && hoveredDataPoint ? hoveredDataPoint.value : latestValue;

                        const { pointsStr, coords } = getSparklinePointsWithCoords(card.data, 200, 40);

                        return (
                            <div key={card.key} className={styles.kpiCard}>
                                <div className={styles.kpiTop}>
                                    <div className={`${styles.kpiIcon} ${card.iconClass}`}>
                                        <Icon size={19} strokeWidth={2} />
                                    </div>
                                    <ArrowUpRight size={17} className="text-slate-300" />
                                </div>

                                <p className={styles.kpiLabel}>{card.title}</p>
                                <p className={styles.kpiValue}>{displayedValue.toLocaleString()}</p>
                                <p className={styles.kpiDescription}>
                                    {isHoveredCard && hoveredDataPoint ? `${hoveredDataPoint.date} Count` : card.description}
                                </p>

                                {/* INTERACTIVE SPARKLINE */}
                                <div className={styles.kpiSparklineWrapper}>
                                    {isHoveredCard && hoveredDataPoint && (
                                        <div
                                            className={styles.sparklineTooltip}
                                            style={{
                                                left: `${(hoveredDataPoint.x / 200) * 100}%`,
                                            }}
                                        >
                                            <span className={styles.tooltipDate}>{hoveredDataPoint.date}</span>
                                            <span className={styles.tooltipVal}>
                                                {hoveredDataPoint.value} {card.unit}
                                            </span>
                                        </div>
                                    )}

                                    <svg
                                        viewBox="0 0 200 40"
                                        className={styles.sparklineSvg}
                                        preserveAspectRatio="none"
                                        onMouseLeave={() => {
                                            setHoveredCardKey(null);
                                            setHoveredDataPoint(null);
                                        }}
                                    >
                                        <defs>
                                            <linearGradient id={card.gradientId} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={card.strokeColor} stopOpacity="0.25" />
                                                <stop offset="100%" stopColor={card.strokeColor} stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        <polygon
                                            fill={`url(#${card.gradientId})`}
                                            points={`0,40 ${pointsStr} 200,40`}
                                        />

                                        <polyline
                                            fill="none"
                                            stroke={card.strokeColor}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={pointsStr}
                                        />

                                        {isHoveredCard && hoveredDataPoint && (
                                            <g>
                                                <circle
                                                    cx={hoveredDataPoint.x}
                                                    cy={hoveredDataPoint.y}
                                                    r="5"
                                                    fill={card.strokeColor}
                                                    stroke="#ffffff"
                                                    strokeWidth="2"
                                                />
                                            </g>
                                        )}

                                        {coords.map((coord, idx) => (
                                            <rect
                                                key={idx}
                                                x={Math.max(0, coord.x - 12)}
                                                y="0"
                                                width="24"
                                                height="40"
                                                fill="transparent"
                                                style={{ cursor: "pointer" }}
                                                onMouseEnter={() => {
                                                    setHoveredCardKey(card.key);
                                                    setHoveredDataPoint(coord);
                                                }}
                                            />
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* QUICK ACTIONS - NEW */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                    <p className={styles.sectionDescription}>Common tasks to streamline your workflow.</p>
                </div>
                <div className={styles.quickActionsGrid}>
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.title}
                                href={action.href}
                                className={`flex items-center gap-3 p-4 rounded-xl ${action.color} hover:shadow-md transition border border-transparent hover:border-current/20`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-sm font-medium">{action.title}</span>
                                <ArrowUpRight size={14} className="ml-auto opacity-60" />
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* OPERATIONS */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Operations</h2>
                    <p className={styles.sectionDescription}>Access the main supply chain management modules.</p>
                </div>

                <div className={styles.operationsGrid}>
                    {operations.map((module) => {
                        const Icon = module.icon;
                        return (
                            <Link key={module.title} href={module.href} className={styles.operationCard}>
                                <div className={`${styles.operationIcon} ${module.iconClass}`}>
                                    <Icon size={19} strokeWidth={2} />
                                </div>
                                <h3 className={styles.operationTitle}>{module.title}</h3>
                                <p className={styles.operationDescription}>{module.description}</p>
                                <span className={styles.operationAction}>
                                    Open Module
                                    <ArrowUpRight size={15} />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* LOWER DASHBOARD - Enhanced */}
            <section className={styles.lowerGrid}>
                {/* Inventory Status */}
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h3 className={styles.panelTitle}>Inventory Status</h3>
                            <p className={styles.panelDescription}>Current inventory condition.</p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Package size={18} />
                        </div>
                    </div>

                    <div className={styles.panelBody}>
                        <div className="space-y-5">
                            {inventoryStatus.map((item) => (
                                <div key={item.label}>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm text-slate-500">{item.label}</span>
                                        <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className={`h-full rounded-full ${item.color}`}
                                            style={{ width: item.width }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stock Value Overview */}
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h3 className={styles.panelTitle}>Stock Value Overview</h3>
                            <p className={styles.panelDescription}>Total inventory value.</p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <TrendingUp size={18} />
                        </div>
                    </div>

                    <div className={styles.panelBody}>
                        <p className={styles.stockValue}>
                            ₱{currentStockValue.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className={styles.stockLabel}>
                            {currentStockValue === 0 ? "No inventory value recorded yet." : "Updated based on recent transactions."}
                        </p>

                        <div className={styles.sparklineWrapper}>
                            <svg viewBox="0 0 300 70" className={styles.sparklineSvg} preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <polygon fill="url(#sparklineGradient)" points={`0,70 ${stockPoints} 300,70`} />
                                <polyline
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={stockPoints}
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts - NEW */}
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h3 className={styles.panelTitle}>Low Stock Alerts</h3>
                            <p className={styles.panelDescription}>Items that need reordering.</p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                            <AlertTriangle size={18} />
                        </div>
                    </div>

                    <div className={styles.panelBody}>
                        {lowStockItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                                <CircleCheck className="h-8 w-8 text-emerald-500 mb-2" />
                                <p className="text-sm font-medium text-slate-700">All items are well-stocked</p>
                                <p className="text-xs text-slate-400">No items need reordering at this time.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {lowStockItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <div>
                                            <p className="text-sm font-medium">{item.item_name}</p>
                                            <p className="text-xs text-slate-500">
                                                Stock: {item.current_stock} / Reorder: {item.reorder_level}
                                            </p>
                                        </div>
                                        <Link
                                            href="/inventory/items"
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            View
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity - Enhanced */}
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h3 className={styles.panelTitle}>Recent Activity</h3>
                            <p className={styles.panelDescription}>Latest system activity.</p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                            <Activity size={18} />
                        </div>
                    </div>

                    <div className={styles.panelBody}>
                        {recentActivity.length === 0 ? (
                            <div className="flex min-h-[150px] flex-col items-center justify-center text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <ClipboardList size={20} />
                                </div>
                                <p className="mt-4 text-sm font-medium text-slate-700">No recent activity</p>
                                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                                    System activities will appear here once transactions are recorded.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {recentActivity.map((tx, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition">
                                        {getTransactionIcon(tx.transaction_type)}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium capitalize">
                                                {tx.transaction_type?.replace("_", " ")}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {tx.item?.item_name || "Unknown"} × {tx.quantity}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {formatDate(tx.transaction_date)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* SYSTEM STATUS */}
            <section className={styles.systemStatus}>
                <div className={styles.statusIndicator} />
                <div className={styles.statusContent}>
                    <p className={styles.statusTitle}>All systems operational</p>
                    <p className={styles.statusDescription}>SCIMS services are running normally.</p>
                </div>
                <div className="ml-auto hidden items-center gap-2 text-xs font-medium text-emerald-700 sm:flex">
                    <CircleCheck size={15} />
                    Operational
                </div>
            </section>
        </div>
    );
}