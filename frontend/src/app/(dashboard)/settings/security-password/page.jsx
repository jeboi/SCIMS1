'use client';

import { useState, useEffect } from 'react';
import { 
    Lock, Shield, Smartphone, Monitor, Globe, AlertCircle, CheckCircle, Clock, LogOut,
    Eye, EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { settingsService } from '@/features/settings/settings.service';

export default function SecurityPage() {
    const { toast } = useToast();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [securityInfo, setSecurityInfo] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    useEffect(() => {
        fetchSecurityInfo();
    }, []);

    const fetchSecurityInfo = async () => {
        try {
            setIsLoading(true);
            const [info, sessionData] = await Promise.all([
                settingsService.getSecurityInfo(),
                settingsService.getSessions(),
            ]);
            setSecurityInfo(info);
            setSessions(sessionData.sessions || []);
            setCurrentSession(sessionData.current || null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Unable to load security information. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validatePasswordForm = () => {
        const newErrors = {};
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
        if (!passwordForm.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }
        if (!passwordForm.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (!passwordRegex.test(passwordForm.newPassword)) {
            newErrors.newPassword = 'Password must meet all requirements';
        }
        if (!passwordForm.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return;

        try {
            setIsChangingPassword(true);
            await settingsService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
            });
            
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 5000);
            
            toast({
                title: 'Success',
                description: 'Password changed successfully.',
            });
            
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setErrors({});
            
            await fetchSecurityInfo();
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Unable to change password. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleLogoutOtherSessions = async () => {
        try {
            await settingsService.logoutOtherSessions();
            toast({
                title: 'Success',
                description: 'Other sessions have been signed out.',
            });
            await fetchSecurityInfo();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Unable to sign out other sessions. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'mobile':
                return <Smartphone className="h-4 w-4" />;
            case 'tablet':
                return <Smartphone className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            inactive: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
                {status === 'active' ? 'Active' : status || 'N/A'}
            </span>
        );
    };

    // Loading Skeleton
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded-lg mb-8"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                            <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-3">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="space-y-1">
                                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
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
                    Security & Password
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your password and account security settings.
                </p>
            </div>

            {/* Success Alert */}
            {showSuccessAlert && (
                <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-green-800">Success</p>
                        <p className="text-sm text-green-700">Your password has been changed successfully.</p>
                    </div>
                </div>
            )}

            {/* Change Password Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        CHANGE PASSWORD
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Update your password to keep your account secure.</p>
                </div>
                <div className="px-6 sm:px-8 py-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                            <div className="relative">
                                <input
                                    name="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                    className={`w-full px-4 py-2.5 rounded-xl border ${
                                        errors.currentPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                                    } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                            <div className="relative">
                                <input
                                    name="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                    className={`w-full px-4 py-2.5 rounded-xl border ${
                                        errors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                                    } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                    className={`w-full px-4 py-2.5 rounded-xl border ${
                                        errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                                    } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            onClick={handleChangePassword}
                            disabled={isChangingPassword}
                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isChangingPassword ? (
                                <>
                                    <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                    Changing Password...
                                </>
                            ) : (
                                'Change Password'
                            )}
                        </button>

                        {/* Password Requirements */}
                        <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Password Requirements</p>
                                    <ul className="mt-1 text-xs text-gray-500 space-y-0.5 list-disc list-inside">
                                        <li>Minimum 8 characters</li>
                                        <li>At least 1 uppercase letter</li>
                                        <li>At least 1 lowercase letter</li>
                                        <li>At least 1 number</li>
                                        <li>At least 1 special character</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Information */}
            {securityInfo && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            SECURITY INFORMATION
                        </h2>
                    </div>
                    <div className="px-6 sm:px-8 py-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <Clock className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Last Password Change</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {securityInfo.lastPasswordChange 
                                            ? new Date(securityInfo.lastPasswordChange).toLocaleDateString()
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Password Status</p>
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        securityInfo.passwordStatus === 'Strong' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {securityInfo.passwordStatus || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                            {securityInfo.failedLoginAttempts !== undefined && (
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                    <AlertCircle className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Failed Login Attempts</p>
                                        <p className="text-sm font-medium text-gray-800">{securityInfo.failedLoginAttempts}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Active Sessions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        ACTIVE SESSIONS
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your active sessions across all devices.</p>
                </div>
                <div className="px-6 sm:px-8 py-6">
                    {sessions.length === 0 && !currentSession ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No active sessions found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {currentSession && !sessions.some(s => s.isCurrent) && (
                                <div className="flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-blue-50/30">
                                    <div className="flex items-center gap-4">
                                        {getDeviceIcon(currentSession.deviceType)}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-800">
                                                    {currentSession.device} • {currentSession.browser}
                                                </p>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    Current Session
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">Last Active: Now</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        Active
                                    </span>
                                </div>
                            )}

                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border ${
                                        session.isCurrent ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {getDeviceIcon(session.deviceType)}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-800">
                                                    {session.device} • {session.browser}
                                                </p>
                                                {session.isCurrent && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-4 text-sm text-gray-500">
                                                <span>IP: {session.ipAddress || 'Unknown'}</span>
                                                <span>Last Active: {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {getStatusBadge(session.status)}
                                </div>
                            ))}

                            {sessions.length > 1 && (
                                <button
                                    onClick={handleLogoutOtherSessions}
                                    className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-xl transition-colors text-sm flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out Other Sessions
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Security */}
            {securityInfo?.twoFactorEnabled !== undefined && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            ADDITIONAL SECURITY
                        </h2>
                    </div>
                    <div className="px-6 sm:px-8 py-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    securityInfo.twoFactorEnabled 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {securityInfo.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                            
                            {securityInfo.loginNotifications !== undefined && (
                                <>
                                    <hr className="border-gray-100" />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">Login Notifications</p>
                                            <p className="text-sm text-gray-500">Get email notifications for new login attempts.</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            securityInfo.loginNotifications 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {securityInfo.loginNotifications ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}