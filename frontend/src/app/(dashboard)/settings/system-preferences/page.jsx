'use client';

import { useState, useEffect } from 'react';
import { 
    Globe, Bell, Package, Layout, Save, RotateCcw, Monitor, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { settingsService } from '@/features/settings/settings.service';
import { apiClient } from '@/lib/api-client';

export default function SystemPreferencesPage() {
    const { toast } = useToast();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showResetAlert, setShowResetAlert] = useState(false);
    const [preferences, setPreferences] = useState({
        general: {
            language: 'en-US',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12-hour',
            timeZone: 'Asia/Manila',
            defaultPage: 'dashboard',
        },
        notifications: {
            lowStock: true,
            outOfStock: true,
            purchaseRequestUpdates: true,
            purchaseOrderUpdates: true,
            deliveryUpdates: false,
            receivingUpdates: true,
        },
        inventory: {
            defaultWarehouse: '',
            defaultView: 'list',
            itemsPerPage: 25,
        },
        display: {
            theme: 'light',
            tableDensity: 'standard',
            itemsPerPage: 25,
        },
    });

    useEffect(() => {
        fetchPreferences();
        fetchWarehouses();
    }, []);

    const fetchPreferences = async () => {
        try {
            setIsLoading(true);
            const data = await settingsService.getPreferences();
            setPreferences(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Unable to load preferences. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const response = await apiClient.get('/warehouses');
            setWarehouses(response.data?.data || []);
        } catch (error) {
            setWarehouses([]);
        }
    };

    const handleGeneralChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            general: { ...prev.general, [key]: value },
        }));
    };

    const handleNotificationChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            notifications: { ...prev.notifications, [key]: value },
        }));
    };

    const handleInventoryChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            inventory: { ...prev.inventory, [key]: value },
        }));
    };

    const handleDisplayChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            display: { ...prev.display, [key]: value },
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await settingsService.updatePreferences(preferences);
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 5000);
            toast({
                title: 'Success',
                description: 'Preferences saved successfully.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Unable to save preferences. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        try {
            setIsSaving(true);
            await settingsService.resetPreferences();
            setShowResetAlert(true);
            setTimeout(() => setShowResetAlert(false), 5000);
            await fetchPreferences();
            toast({
                title: 'Success',
                description: 'Preferences reset to defaults.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Unable to reset preferences. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Loading Skeleton
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded-lg mb-8"></div>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                            <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
                            <div className="grid grid-cols-3 gap-4">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="space-y-2">
                                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                        <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    System Preferences
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Customize application, notification, and display preferences.
                </p>
            </div>

            {/* Success Alert */}
            {showSuccessAlert && (
                <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-start gap-3">
                    <Save className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-green-800">Saved</p>
                        <p className="text-sm text-green-700">Your preferences have been saved successfully.</p>
                    </div>
                </div>
            )}

            {/* Reset Alert */}
            {showResetAlert && (
                <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3">
                    <RotateCcw className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-800">Reset Complete</p>
                        <p className="text-sm text-blue-700">Your preferences have been reset to default values.</p>
                    </div>
                </div>
            )}

            {/* General Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        GENERAL
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Configure your language, date, time, and regional preferences.</p>
                </div>
                <div className="px-6 sm:px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                            <select
                                value={preferences.general.language}
                                onChange={(e) => handleGeneralChange('language', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="en-US">English (US)</option>
                                <option value="en-GB">English (UK)</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="ja">Japanese</option>
                                <option value="zh-CN">Chinese (Simplified)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Format</label>
                            <select
                                value={preferences.general.dateFormat}
                                onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Format</label>
                            <select
                                value={preferences.general.timeFormat}
                                onChange={(e) => handleGeneralChange('timeFormat', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="12-hour">12-hour (hh:mm AM/PM)</option>
                                <option value="24-hour">24-hour (hh:mm)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Zone</label>
                            <select
                                value={preferences.general.timeZone}
                                onChange={(e) => handleGeneralChange('timeZone', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">America/New_York</option>
                                <option value="America/Los_Angeles">America/Los_Angeles</option>
                                <option value="Europe/London">Europe/London</option>
                                <option value="Europe/Paris">Europe/Paris</option>
                                <option value="Asia/Dubai">Asia/Dubai</option>
                                <option value="Asia/Manila">Asia/Manila</option>
                                <option value="Asia/Tokyo">Asia/Tokyo</option>
                                <option value="Australia/Sydney">Australia/Sydney</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Landing Page</label>
                            <select
                                value={preferences.general.defaultPage}
                                onChange={(e) => handleGeneralChange('defaultPage', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="dashboard">Dashboard</option>
                                <option value="inventory">Inventory</option>
                                <option value="procurement">Procurement</option>
                                <option value="warehouse">Warehouse</option>
                                <option value="suppliers">Suppliers</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        NOTIFICATIONS
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Control which notifications you receive.</p>
                </div>
                <div className="px-6 sm:px-8 py-6">
                    <div className="space-y-4">
                        {[
                            { id: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified when items are running low.', key: 'lowStock' },
                            { id: 'outOfStock', label: 'Out-of-Stock Alerts', desc: 'Get notified when items are out of stock.', key: 'outOfStock' },
                            { id: 'purchaseRequestUpdates', label: 'Purchase Request Updates', desc: 'Get notified about purchase request changes.', key: 'purchaseRequestUpdates' },
                            { id: 'purchaseOrderUpdates', label: 'Purchase Order Updates', desc: 'Get notified about purchase order changes.', key: 'purchaseOrderUpdates' },
                            { id: 'deliveryUpdates', label: 'Delivery Updates', desc: 'Get notified about delivery status changes.', key: 'deliveryUpdates' },
                            { id: 'receivingUpdates', label: 'Receiving Updates', desc: 'Get notified about receiving transactions.', key: 'receivingUpdates' },
                        ].map((item, index) => (
                            <div key={item.id}>
                                {index > 0 && <hr className="border-gray-100" />}
                                <div className={`flex items-center justify-between ${index > 0 ? 'pt-4' : ''}`}>
                                    <div>
                                        <label htmlFor={item.id} className="font-medium text-gray-800 text-sm">
                                            {item.label}
                                        </label>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                    <button
                                        role="switch"
                                        aria-checked={preferences.notifications[item.key]}
                                        onClick={() => handleNotificationChange(item.key, !preferences.notifications[item.key])}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                            preferences.notifications[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                            preferences.notifications[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                                        }`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inventory Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        INVENTORY PREFERENCES
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Configure your inventory display preferences.</p>
                </div>
                <div className="px-6 sm:px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Warehouse</label>
                            <select
                                value={preferences.inventory.defaultWarehouse || ''}
                                onChange={(e) => handleInventoryChange('defaultWarehouse', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="">None</option>
                                {warehouses.length === 0 ? (
                                    <option value="" disabled>No warehouses available</option>
                                ) : (
                                    warehouses.map(warehouse => (
                                        <option key={warehouse.id || warehouse.warehouse_id} value={warehouse.id || warehouse.warehouse_id}>
                                            {warehouse.name || warehouse.warehouse_name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Inventory View</label>
                            <select
                                value={preferences.inventory.defaultView}
                                onChange={(e) => handleInventoryChange('defaultView', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="list">List View</option>
                                <option value="grid">Grid View</option>
                                <option value="table">Table View</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Items Per Page</label>
                            <select
                                value={String(preferences.inventory.itemsPerPage || 25)}
                                onChange={(e) => handleInventoryChange('itemsPerPage', parseInt(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Display Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Layout className="h-4 w-4" />
                        DISPLAY PREFERENCES
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Configure your application display preferences.</p>
                </div>
                <div className="px-6 sm:px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Theme</label>
                            <select
                                value={preferences.display.theme}
                                onChange={(e) => handleDisplayChange('theme', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System Default</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Table Density</label>
                            <select
                                value={preferences.display.tableDensity}
                                onChange={(e) => handleDisplayChange('tableDensity', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="compact">Compact</option>
                                <option value="standard">Standard</option>
                                <option value="comfortable">Comfortable</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Items Per Page</label>
                            <select
                                value={String(preferences.display.itemsPerPage || 25)}
                                onChange={(e) => handleDisplayChange('itemsPerPage', parseInt(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </button>
                <button
                    onClick={handleReset}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Default
                </button>
            </div>
        </div>
    );
}