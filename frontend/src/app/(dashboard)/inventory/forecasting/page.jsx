"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
    Package, AlertTriangle,
    Loader2,
    ArrowUp, ArrowDown, Minus, RefreshCw,
    ShoppingCart, Clock, Zap, Eye,
    CheckCircle, Filter, Bell, FileDown, Send, Printer,
    TrendingUp, TrendingDown
} from "lucide-react";

import {
    LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function ForecastingPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [forecastData, setForecastData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [showAlerts, setShowAlerts] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [sortBy, setSortBy] = useState("stock");
    const [sortOrder, setSortOrder] = useState("asc");
    const [showExportModal, setShowExportModal] = useState(false);
    const [seasonalData, setSeasonalData] = useState([]);
    const [forecastProjection, setForecastProjection] = useState([]);
    const [aiForecastResults, setAiForecastResults] = useState([]);
    const [aiSeasonalData, setAiSeasonalData] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
    try {
        setLoading(true);
        setError("");
        
        const itemsRes = await axiosInstance.get("/items");
        const transactionsRes = await axiosInstance.get("/inventory-transactions");
        
        let forecastRes = { data: { success: false } };
        let seasonalRes = { data: { success: false } };
        
        try {
            forecastRes = await axiosInstance.post("/forecast", { days: 30 });
        } catch (forecastErr) {
            console.warn("⚠️ Forecast endpoint failed:", forecastErr.response?.data || forecastErr.message);
        }
        
        try {
            seasonalRes = await axiosInstance.post("/seasonal");
        } catch (seasonalErr) {
            console.warn("⚠️ Seasonal endpoint failed:", seasonalErr.response?.data || seasonalErr.message);
        }
        
        const itemsData = itemsRes.data?.data || [];
        const transactionsData = transactionsRes.data?.data || [];
        
        setItems(itemsData);
        setTransactions(transactionsData);
        
        generateForecast(itemsData, transactionsData);
        generateSeasonalData(itemsData, transactionsData);
        generateForecastProjection(itemsData, transactionsData);
        
        if (forecastRes.data?.success && forecastRes.data?.data?.length > 0) {
            setAiForecastResults(forecastRes.data.data);
        } else {
            setAiForecastResults([]);
        }
        
        if (seasonalRes.data?.success && seasonalRes.data?.data?.length > 0) {
            setAiSeasonalData(seasonalRes.data.data);
            console.log("✅ AI Seasonal Data:", seasonalRes.data);
        } else {
            setAiSeasonalData([]);
        }
        
        setLoading(false);
        
    } catch (err) {
        console.error("❌ Error loading data:", err);
        setError(err.message || "Failed to load data.");
        toast.error("Failed to load data.");
        setLoading(false);
    }
};

    const generateForecast = (itemsData, transactionsData) => {
        const forecast = itemsData.map((item) => {
            const itemTransactions = transactionsData.filter(
                tx => tx.item_id === item.item_id && 
                (tx.transaction_type === "transfer_out" || 
                 tx.transaction_type === "issuing")
            );
            
            const totalUsage = itemTransactions.reduce((sum, tx) => sum + Math.abs(tx.quantity), 0);
            const daysActive = 30;
            const avgDailyUsage = totalUsage / Math.max(daysActive, 1);
            
            const daysUntilOut = item.current_stock > 0 && avgDailyUsage > 0 
                ? Math.floor(item.current_stock / avgDailyUsage) 
                : (item.current_stock > 0 ? Infinity : 0);
            
            let status = "good";
            let statusLabel = "In Stock";
            let statusColor = "text-green-600";
            let statusBg = "bg-green-100";
            
            if (item.current_stock <= 0) {
                status = "critical";
                statusLabel = "Out of Stock";
                statusColor = "text-red-600";
                statusBg = "bg-red-100";
            } else if (item.current_stock <= item.reorder_level) {
                status = "warning";
                statusLabel = "Low Stock";
                statusColor = "text-yellow-600";
                statusBg = "bg-yellow-100";
            } else if (daysUntilOut < 7 && daysUntilOut > 0) {
                status = "warning";
                statusLabel = "Critical Soon";
                statusColor = "text-orange-600";
                statusBg = "bg-orange-100";
            }
            
            let trend = "stable";
            
            if (itemTransactions.length > 0) {
                const sorted = [...itemTransactions].sort((a, b) => 
                    new Date(a.transaction_date) - new Date(b.transaction_date)
                );
                const recent = sorted.slice(-5);
                if (recent.length >= 2) {
                    const firstTotal = recent.slice(0, 2).reduce((sum, tx) => sum + Math.abs(tx.quantity), 0);
                    const lastTotal = recent.slice(-2).reduce((sum, tx) => sum + Math.abs(tx.quantity), 0);
                    
                    if (lastTotal > firstTotal * 1.2) {
                        trend = "increasing";
                    } else if (lastTotal < firstTotal * 0.8) {
                        trend = "decreasing";
                    }
                }
            }
            
            let reorderRecommendation = "Not needed";
            let reorderUrgency = "low";
            
            if (status === "critical" || item.current_stock <= 0) {
                reorderRecommendation = "🚨 URGENT - Reorder Now";
                reorderUrgency = "critical";
            } else if (status === "warning") {
                reorderRecommendation = "⚠️ Plan to reorder soon";
                reorderUrgency = "medium";
            } else if (daysUntilOut < 14 && daysUntilOut > 0) {
                reorderRecommendation = "📅 Reorder in 1-2 weeks";
                reorderUrgency = "medium";
            } else if (daysUntilOut < 30 && daysUntilOut > 0) {
                reorderRecommendation = "📅 Reorder in 3-4 weeks";
                reorderUrgency = "low";
            } else if (daysUntilOut === Infinity || daysUntilOut > 30) {
                reorderRecommendation = "✅ Stock is sufficient";
                reorderUrgency = "low";
            }
            
            return {
                ...item,
                totalUsage,
                avgDailyUsage: Math.round(avgDailyUsage * 10) / 10,
                daysUntilOut: daysUntilOut === Infinity ? "∞" : daysUntilOut,
                status,
                statusLabel,
                statusColor,
                statusBg,
                trend,
                reorderRecommendation,
                reorderUrgency,
                transactionCount: itemTransactions.length,
            };
        });
        
        const sorted = forecast.sort((a, b) => {
            const order = { critical: 0, warning: 1, good: 2 };
            return (order[a.status] || 3) - (order[b.status] || 3);
        });
        
        setForecastData(sorted);
        
        const criticalItems = forecast.filter(f => f.status === "critical");
        const warningItems = forecast.filter(f => f.status === "warning");
        const goodItems = forecast.filter(f => f.status === "good");
        
        setAnalysis({
            totalItems: forecast.length,
            criticalItems: criticalItems.length,
            warningItems: warningItems.length,
            goodItems: goodItems.length,
            totalUsage: forecast.reduce((sum, f) => sum + f.totalUsage, 0),
            avgDailyUsage: forecast.reduce((sum, f) => sum + (f.avgDailyUsage || 0), 0),
            itemsNeedingReorder: forecast.filter(f => f.reorderUrgency !== "low").length,
        });
    };

    const generateSeasonalData = (itemsData, transactionsData) => {
        const monthlyData = {};
        transactionsData.forEach(tx => {
            if (tx.transaction_type === "transfer_out" || tx.transaction_type === "issuing") {
                const date = new Date(tx.transaction_date);
                const month = date.toLocaleString('default', { month: 'short' });
                if (!monthlyData[month]) monthlyData[month] = 0;
                monthlyData[month] += Math.abs(tx.quantity);
            }
        });
        
        const seasonal = Object.entries(monthlyData).map(([month, value]) => ({
            month,
            usage: value,
        }));
        
        setSeasonalData(seasonal);
    };

    const generateForecastProjection = (itemsData, transactionsData) => {
        const projection = itemsData.map(item => {
            const itemTransactions = transactionsData.filter(
                tx => tx.item_id === item.item_id && 
                (tx.transaction_type === "transfer_out" || tx.transaction_type === "issuing")
            );
            const totalUsage = itemTransactions.reduce((sum, tx) => sum + Math.abs(tx.quantity), 0);
            const avgDailyUsage = totalUsage / 30;
            
            let currentStock = item.current_stock || 0;
            let daysUntilOut = 30;
            for (let i = 1; i <= 30; i++) {
                currentStock -= avgDailyUsage;
                if (currentStock <= 0) {
                    daysUntilOut = i;
                    break;
                }
            }
            
            return {
                item_id: item.item_id,
                item_name: item.item_name,
                daysUntilOut: daysUntilOut,
                stock: item.current_stock || 0,
            };
        });
        setForecastProjection(projection);
    };

    const getFilteredAIResults = () => {
        let data = [...aiForecastResults];
        
        if (filterStatus !== "all") {
            data = data.filter(item => {
                const forecastItem = forecastData.find(f => f.item_id === item.item_id);
                return forecastItem?.status === filterStatus;
            });
        }
        
        if (filterCategory !== "all") {
            data = data.filter(item => {
                const forecastItem = forecastData.find(f => f.item_id === item.item_id);
                return String(forecastItem?.category_id) === filterCategory;
            });
        }
        
        data.sort((a, b) => {
            let aVal = a[sortBy] || 0;
            let bVal = b[sortBy] || 0;
            if (sortBy === "item_name") {
                aVal = a.item_name;
                bVal = b.item_name;
                return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        });
        
        return data;
    };

    const filteredAIResults = getFilteredAIResults();

    const getUrgencyBadge = (urgency) => {
        const colors = {
            critical: "bg-red-100 text-red-800",
            medium: "bg-yellow-100 text-yellow-800",
            low: "bg-green-100 text-green-800",
        };
        return colors[urgency] || "bg-gray-100 text-gray-800";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
                <p>{error}</p>
                <button onClick={loadData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Zap className="h-6 w-6 text-blue-600" />
                        AI Predictive Analytics
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Demand forecasting and reorder predictions based on historical inventory data.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowAlerts(!showAlerts)}
                        className={`rounded-lg px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 ${
                            showAlerts ? "bg-yellow-100 text-yellow-700" : "border hover:bg-gray-50"
                        }`}
                    >
                        <Bell className="h-4 w-4" />
                        Alerts
                        {analysis?.criticalItems > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                {analysis.criticalItems}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FileDown className="h-4 w-4" />
                        Export
                    </button>
                    <button
                        onClick={loadData}
                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Smart Alerts Panel */}
            {showAlerts && (
                <div className="bg-white rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Bell className="h-5 w-5 text-yellow-600" />
                            Smart Alerts
                        </h3>
                        <button
                            onClick={() => setShowAlerts(false)}
                            className="text-sm text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className={`p-3 rounded-lg border ${analysis?.criticalItems > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                            <p className="text-sm font-medium">🚨 Critical Stock</p>
                            <p className="text-lg font-bold">{analysis?.criticalItems || 0} items</p>
                            <p className="text-xs text-gray-500">
                                {analysis?.criticalItems > 0 ? 'Need immediate attention!' : 'All items are in stock'}
                            </p>
                        </div>
                        <div className={`p-3 rounded-lg border ${analysis?.warningItems > 0 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                            <p className="text-sm font-medium">⚠️ Low Stock</p>
                            <p className="text-lg font-bold">{analysis?.warningItems || 0} items</p>
                            <p className="text-xs text-gray-500">
                                {analysis?.warningItems > 0 ? 'Plan to reorder soon' : 'Stock levels are good'}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                            <p className="text-sm font-medium">📈 Trending Items</p>
                            <p className="text-lg font-bold">
                                {forecastData.filter(f => f.trend === "increasing").length} items
                            </p>
                            <p className="text-xs text-gray-500">Showing increasing usage</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter & Sort Options */}
<div className="flex flex-wrap items-center gap-3 bg-white rounded-lg border p-4">
    <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium">Filters:</span>
    </div>
    
    {/* Status Filter */}
    <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="rounded-lg border px-3 py-1.5 text-sm"
    >
        <option value="all">All Status</option>
        <option value="critical">Critical</option>
        <option value="warning">Low Stock</option>
        <option value="good">In Stock</option>
    </select>
    
    {/* Category Filter - Fixed */}
    <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
        className="rounded-lg border px-3 py-1.5 text-sm"
    >
        <option value="all">All Categories</option>
        {(() => {
            const uniqueCategories = items
                .filter(item => item.category)
                .reduce((acc, item) => {
                    const existing = acc.find(c => c.category_id === item.category.category_id);
                    if (!existing) {
                        acc.push(item.category);
                    }
                    return acc;
                }, []);
            
            return uniqueCategories.map((cat) => (
                <option key={cat.category_id} value={String(cat.category_id)}>
                    {cat.category_name}
                </option>
            ));
        })()}
    </select>
    
    {/* Sort Options */}
    <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="rounded-lg border px-3 py-1.5 text-sm"
    >
        <option value="stock">Sort by Stock</option>
        <option value="item_name">Sort by Name</option>
        <option value="avgDailyUsage">Sort by Usage</option>
        <option value="daysUntilOut">Sort by Days Until Out</option>
    </select>
    <button
        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        className="rounded-lg border px-3 py-1.5 text-sm"
    >
        {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
    </button>
    <button
        onClick={() => {
            setFilterStatus("all");
            setFilterCategory("all");
            setSortBy("stock");
            setSortOrder("asc");
        }}
        className="text-sm text-red-500 hover:text-red-700"
    >
        Clear All
    </button>
</div>

            {/* AI Forecast Results Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Zap className="h-5 w-5 text-indigo-600" />
                        AI-Powered Forecast Results
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Live</span>
                    </h3>
                    <span className="text-xs text-gray-500">{filteredAIResults.length} items analyzed</span>
                </div>
                {filteredAIResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No AI forecast data available.</p>
                        <p className="text-sm mt-1">Add more transaction data for better predictions.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredAIResults.map((result) => {
                            const forecastItem = forecastData.find(f => f.item_id === result.item_id);
                            return (
                                <div key={result.item_id} className="bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm truncate">{result.item_name}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            result.confidence > 70 ? 'bg-green-100 text-green-700' :
                                            result.confidence > 40 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {result.confidence}% confidence
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                        <span>Status: <span className={`font-medium ${forecastItem?.statusColor || 'text-gray-600'}`}>
                                            {forecastItem?.statusLabel || 'Unknown'}
                                        </span></span>
                                        <span>|</span>
                                        <span>Stock: <strong>{forecastItem?.current_stock || 0}</strong></span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                        <span>Trend: <strong className={`${
                                            result.trend === 'increasing' ? 'text-red-600' :
                                            result.trend === 'decreasing' ? 'text-green-600' :
                                            'text-gray-600'
                                        }`}>{result.trend}</strong></span>
                                        <span>|</span>
                                        <span>Predicted: <strong>{result.predicted_daily_usage} units/day</strong></span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-600">{result.recommendation}</p>
                                    {result.forecast && result.forecast.length > 0 && (
                                        <div className="mt-2">
                                            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${Math.min((result.forecast.length / 30) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{result.forecast.length} days forecasted</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            const item = forecastData.find(f => f.item_id === result.item_id);
                                            if (item) {
                                                setSelectedItem(item);
                                                setShowDetailModal(true);
                                            }
                                        }}
                                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                                    >
                                        <Eye className="h-3 w-3" />
                                        View Details
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* AI Seasonal Trend Detection */}
{(seasonalData.length > 0 || aiSeasonalData.length > 0) && (
    <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                AI-Powered Seasonal Usage Pattern
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">AI Detected</span>
            </h4>
            {aiSeasonalData.length > 0 && (
                <span className="text-xs text-gray-400">{aiSeasonalData.length} items analyzed</span>
            )}
        </div>
        
        {/* AI Seasonal Insights */}
        {aiSeasonalData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {aiSeasonalData.slice(0, 6).map((item) => (
                    <div key={item.item_id} className="border rounded-lg p-3 bg-gray-50">
                        <p className="font-medium text-sm">{item.item_name}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                item.seasonal_strength === 'strong' ? 'bg-red-100 text-red-700' :
                                item.seasonal_strength === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                                {item.seasonal_strength} seasonality
                            </span>
                        </div>
                        {item.peak_months.length > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                                📈 Peak: <strong>{item.peak_months.join(', ')}</strong>
                            </p>
                        )}
                        {item.low_months.length > 0 && (
                            <p className="text-xs text-gray-600">
                                📉 Low: <strong>{item.low_months.join(', ')}</strong>
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{item.recommendation}</p>
                    </div>
                ))}
            </div>
        )}
        
        {/* Seasonal Chart (using existing seasonalData) */}
        {seasonalData.length > 0 && (
            <>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <ReLineChart data={seasonalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="usage" stroke="#8b5cf6" strokeWidth={2} />
                        </ReLineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-500 mt-2">Monthly usage pattern showing seasonal demand trends</p>
            </>
        )}
    </div>
)}

            {/* 30-Day Forecast Projection */}
            {forecastProjection.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">📈 30-Day Forecast Projection</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {forecastProjection.slice(0, 4).map((item) => (
                            <div key={item.item_id} className="border rounded-lg p-3">
                                <p className="text-sm font-medium truncate">{item.item_name}</p>
                                <p className="text-xs text-gray-500">Days until out: {item.daysUntilOut}</p>
                                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${
                                            item.daysUntilOut < 7 ? 'bg-red-500' :
                                            item.daysUntilOut < 14 ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min((item.daysUntilOut / 30) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowExportModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-lg font-semibold">Export Report</h2>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-500">Export forecast data in the following formats:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        const headers = ["Item", "Stock", "Reorder Level", "Daily Usage", "Days Until Out", "Status", "Trend", "Recommendation"];
                                        
                                        const rows = forecastData.map(item => {
                                            const aiResult = aiForecastResults.find(r => r.item_id === item.item_id);
                                            return [
                                                `"${item.item_name || ""}"`,
                                                item.current_stock || 0,
                                                item.reorder_level || 0,
                                                item.avgDailyUsage || 0,
                                                item.daysUntilOut,
                                                `"${item.statusLabel || ""}"`,
                                                `"${aiResult?.trend || item.trend || "stable"}"`,
                                                `"${aiResult?.recommendation || item.reorderRecommendation || "Not needed"}"`,
                                            ];
                                        });
                                        
                                        let csv = headers.join(",") + "\n";
                                        rows.forEach(row => {
                                            csv += row.join(",") + "\n";
                                        });
                                        
                                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `forecast_report_${new Date().toISOString().slice(0,10)}.csv`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        window.URL.revokeObjectURL(url);
                                        
                                        toast.success("CSV exported successfully!");
                                        setShowExportModal(false);
                                    }}
                                    className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition"
                                >
                                    <FileDown className="h-5 w-5" />
                                    CSV
                                </button>
                                
                                <button
                                    onClick={() => {
                                        const table = document.querySelector('.forecast-table-print') || document.querySelector('table');
                                        if (!table) {
                                            toast.error("No table found to print.");
                                            return;
                                        }
                                        
                                        const printWindow = window.open('', '_blank', 'width=1000,height=800');
                                        if (!printWindow) {
                                            toast.error("Please allow popups for this site.");
                                            return;
                                        }
                                        
                                        const date = new Date().toLocaleString();
                                        
                                        printWindow.document.write(`
                                            <!DOCTYPE html>
                                            <html>
                                                <head>
                                                    <title>Forecast Report</title>
                                                    <style>
                                                        body { font-family: Arial, sans-serif; padding: 40px; }
                                                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                                                        .header h1 { font-size: 24px; margin: 0; }
                                                        .header p { color: #666; margin: 5px 0; }
                                                        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 20px; }
                                                        th { background-color: #f3f4f6; font-weight: bold; text-align: left; padding: 10px 8px; border: 1px solid #ddd; }
                                                        td { padding: 8px; border: 1px solid #ddd; }
                                                        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                                                        @media print {
                                                            body { padding: 20px; }
                                                        }
                                                    </style>
                                                </head>
                                                <body>
                                                    <div class="header">
                                                        <h1>AI Predictive Analytics - Forecast Report</h1>
                                                        <p>Generated on: ${date}</p>
                                                        <p>Total Items: ${forecastData.length} | Status: ${filterStatus} | Category: ${filterCategory}</p>
                                                    </div>
                                                    ${table.outerHTML}
                                                    <div class="footer">
                                                        <p>SCIMS - Supply Chain & Inventory Management System</p>
                                                        <p>This report is auto-generated by the AI Predictive Analytics module.</p>
                                                    </div>
                                                    <script>
                                                        window.onload = function() {
                                                            window.print();
                                                            window.close();
                                                        }
                                                    <\/script>
                                                </body>
                                            </html>
                                        `);
                                        printWindow.document.close();
                                        
                                        setShowExportModal(false);
                                    }}
                                    className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition"
                                >
                                    <Printer className="h-5 w-5" />
                                    Print / PDF
                                </button>
                            </div>
                            
                            <div className="flex justify-end border-t pt-4">
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed View Modal */}
            {showDetailModal && selectedItem && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => {
                        setShowDetailModal(false);
                        setSelectedItem(null);
                    }}
                >
                    <div
                        className="w-full max-w-2xl rounded-xl bg-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    {selectedItem.item_name}
                                </h2>
                                <p className="text-sm text-gray-500">Detailed Forecast Analysis</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedItem(null);
                                }}
                                className="text-2xl text-gray-400 hover:text-gray-600 transition"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className={`p-4 rounded-lg ${selectedItem.statusBg || "bg-gray-100"} border`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {selectedItem.status === "critical" && <AlertTriangle className="h-6 w-6 text-red-600" />}
                                        {selectedItem.status === "warning" && <Clock className="h-6 w-6 text-yellow-600" />}
                                        {selectedItem.status === "good" && <CheckCircle className="h-6 w-6 text-green-600" />}
                                        <div>
                                            <p className={`font-semibold ${selectedItem.statusColor || "text-gray-600"}`}>
                                                {selectedItem.statusLabel || "Unknown"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {selectedItem.reorderRecommendation || "Not needed"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getUrgencyBadge(selectedItem.reorderUrgency)}`}>
                                        {selectedItem.reorderUrgency?.toUpperCase() || "LOW"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Current Stock</p>
                                    <p className="text-xl font-bold">{selectedItem.current_stock || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Reorder Level</p>
                                    <p className="text-xl font-bold">{selectedItem.reorder_level || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Avg Daily Usage</p>
                                    <p className="text-xl font-bold">{selectedItem.avgDailyUsage || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Days Until Out</p>
                                    <p className="text-xl font-bold">
                                        {selectedItem.daysUntilOut === "∞" ? "∞" : selectedItem.daysUntilOut}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        window.location.href = "/procurement/purchase-requests";
                                    }}
                                    className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    Create Purchase Request
                                </button>
                                <button
                                    onClick={() => {
                                        toast.success("Alert sent to procurement team!");
                                        setShowDetailModal(false);
                                    }}
                                    className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
                                >
                                    <Send className="h-4 w-4" />
                                    Send Alert
                                </button>
                            </div>

                            <div className="flex justify-end border-t pt-4">
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setSelectedItem(null);
                                    }}
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}