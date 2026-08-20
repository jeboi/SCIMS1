'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { settingsService } from '@/features/settings/settings.service';
import { 
    Search, Filter, X, RefreshCw, Calendar as CalendarIcon, Eye,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

export default function ActivityLogPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [showFilterAlert, setShowFilterAlert] = useState(false);
    
    const [filters, setFilters] = useState({
        dateFrom: null,
        dateTo: null,
        module: 'All Modules',
        activityType: 'All Types',
        status: 'All',
        search: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10,
        total: 0,
        lastPage: 1,
    });

    useEffect(() => {
        fetchActivities();
    }, [filters, pagination.page]);

    const fetchActivities = async () => {
        try {
            setIsLoading(true);
            const response = await settingsService.getActivities({
                ...filters,
                page: pagination.page,
                perPage: pagination.perPage,
            });
            setActivities(response.data || []);
            setPagination({
                page: response.currentPage || 1,
                perPage: response.perPage || 10,
                total: response.total || 0,
                lastPage: response.lastPage || 1,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Unable to load activity log. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleApplyFilters = () => {
        fetchActivities();
        setShowFilterAlert(true);
        setTimeout(() => setShowFilterAlert(false), 5000);
    };

    const handleResetFilters = () => {
        setFilters({
            dateFrom: null,
            dateTo: null,
            module: 'All Modules',
            activityType: 'All Types',
            status: 'All',
            search: '',
        });
        setPagination(prev => ({ ...prev, page: 1 }));
        setShowFilterAlert(false);
    };

    const handleViewDetails = (activity) => {
        setSelectedActivity(activity);
        setIsDetailOpen(true);
    };

    const formatDate = (date) => {
        if (!date) return '';
        return format(new Date(date), 'MMM dd, yyyy');
    };

    const formatDateTime = (date) => {
        if (!date) return '';
        return format(new Date(date), 'MMM dd, yyyy HH:mm');
    };

    const getStatusBadge = (status) => {
        const variants = {
            Success: 'bg-green-100 text-green-700',
            Warning: 'bg-yellow-100 text-yellow-700',
            Failed: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-600'}`}>
                {status || 'N/A'}
            </span>
        );
    };

    const getModuleBadge = (module) => {
        const colors = {
            Authentication: 'bg-blue-100 text-blue-700',
            Inventory: 'bg-green-100 text-green-700',
            Warehouse: 'bg-purple-100 text-purple-700',
            Procurement: 'bg-yellow-100 text-yellow-700',
            Supplier: 'bg-indigo-100 text-indigo-700',
            System: 'bg-gray-100 text-gray-600',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[module] || 'bg-gray-100 text-gray-600'}`}>
                {module || 'N/A'}
            </span>
        );
    };

    // Loading Skeleton
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded-lg mb-8"></div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    {[...Array(5)].map((_, j) => (
                                        <div key={j} className="h-6 w-24 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Activity Log
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Review the activities and actions performed through your account.
                </p>
            </div>

            {/* Filter Alert */}
            {showFilterAlert && (filters.dateFrom || filters.dateTo) && (
                <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3">
                    <Filter className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-800">Filter Applied</p>
                        <p className="text-sm text-blue-700">
                            Showing activities from {filters.dateFrom ? formatDate(filters.dateFrom) : 'any date'} to {filters.dateTo ? formatDate(filters.dateTo) : 'any date'}
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowFilterAlert(false)}
                        className="ml-auto text-blue-600 hover:text-blue-800"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Filters Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Apply filters to narrow down your activity log.</p>
                </div>
                <div className="px-6 sm:px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Date From */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date From</label>
                            <input
                                type="date"
                                value={filters.dateFrom ? format(new Date(filters.dateFrom), 'yyyy-MM-dd') : ''}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : null)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date To</label>
                            <input
                                type="date"
                                value={filters.dateTo ? format(new Date(filters.dateTo), 'yyyy-MM-dd') : ''}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : null)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            />
                        </div>

                        {/* Module Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Module</label>
                            <select
                                value={filters.module}
                                onChange={(e) => handleFilterChange('module', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="All Modules">All Modules</option>
                                <option value="Authentication">Authentication</option>
                                <option value="Inventory">Inventory</option>
                                <option value="Warehouse">Warehouse</option>
                                <option value="Procurement">Procurement</option>
                                <option value="Supplier">Supplier</option>
                                <option value="System">System</option>
                            </select>
                        </div>

                        {/* Activity Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Activity Type</label>
                            <select
                                value={filters.activityType}
                                onChange={(e) => handleFilterChange('activityType', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="All Types">All Types</option>
                                <option value="Login">Login</option>
                                <option value="Created Item">Created Item</option>
                                <option value="Updated Item">Updated Item</option>
                                <option value="Approved Request">Approved Request</option>
                                <option value="Stock Adjustment">Stock Adjustment</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                            >
                                <option value="All">All</option>
                                <option value="Success">Success</option>
                                <option value="Warning">Warning</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div className="lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    placeholder="Search activities..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                                />
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex items-end gap-2 lg:col-span-2">
                            <button
                                onClick={handleApplyFilters}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={handleResetFilters}
                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-1.5"
                            >
                                <X className="h-4 w-4" />
                                Reset
                            </button>
                            <button
                                onClick={fetchActivities}
                                className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-4 sm:px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="text-left px-4 sm:px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                                <th className="text-left px-4 sm:px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                                <th className="text-left px-4 sm:px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                                <th className="text-left px-4 sm:px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-4 sm:px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {activities.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 text-gray-300" />
                                            <p className="font-medium">No activity records found.</p>
                                            <p className="text-sm">Activities will appear here as you interact with the system.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                activities.map((activity) => (
                                    <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                                            {formatDateTime(activity.createdAt)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 text-gray-800">{activity.activity}</td>
                                        <td className="px-4 sm:px-6 py-3.5">{getModuleBadge(activity.module)}</td>
                                        <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-gray-500">
                                            {activity.reference || '-'}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">{getStatusBadge(activity.status)}</td>
                                        <td className="px-4 sm:px-6 py-3.5 text-right">
                                            <button
                                                onClick={() => handleViewDetails(activity)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {activities.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <div className="text-sm text-gray-500">
                        Showing {(pagination.page - 1) * pagination.perPage + 1} to{' '}
                        {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
                        {pagination.total} results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page >= pagination.lastPage}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Activity Detail Modal */}
            {isDetailOpen && selectedActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={() => setIsDetailOpen(false)}
                    />
                    <div className="relative z-50 w-full max-w-2xl bg-white rounded-2xl shadow-dialog max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsDetailOpen(false)}
                            className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">Activity Details</h2>
                            <p className="text-sm text-gray-500">Detailed information about the selected activity.</p>
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedActivity.activity || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {selectedActivity.created_at ? format(new Date(selectedActivity.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Module</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedActivity.module || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                                    <p className="mt-1">{getStatusBadge(selectedActivity.status)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{selectedActivity.reference || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedActivity.performed_by || 'N/A'}</p>
                                </div>
                            </div>
                            {selectedActivity.details && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Additional Details</label>
                                    <div className="mt-2 p-3 bg-gray-50 rounded-xl">
                                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
                                            {typeof selectedActivity.details === 'string' 
                                                ? selectedActivity.details 
                                                : JSON.stringify(selectedActivity.details, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}