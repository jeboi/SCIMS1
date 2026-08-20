'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { settingsService } from '@/features/settings/settings.service';
import { 
    User, Mail, Briefcase, Calendar, Clock, Edit2, Save, X, Camera,
    CheckCircle, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AccountProfilePage() {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        avatar: null,
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const data = await settingsService.getProfile();
            setProfile(data);
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                avatar: null,
            });
            setAvatarPreview(data.avatarUrl || null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Unable to load your profile. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setIsSaving(true);
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                avatar: formData.avatar,
            };
            
            const response = await settingsService.updateProfile(updateData);
            setProfile(response.data || response);
            
            if (updateUser && response.data) {
                updateUser(response.data);
            }
            
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
            
            toast({
                title: 'Success',
                description: 'Profile updated successfully.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Unable to update profile.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            avatar: null,
        });
        setAvatarPreview(profile.avatarUrl || null);
        setErrors({});
        setIsEditing(false);
    };

    // Loading Skeleton
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded-lg mb-8"></div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <div className="flex flex-col items-center">
                            <div className="h-24 w-24 rounded-full bg-gray-200 mb-6"></div>
                            <div className="w-full space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50">
                                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Account Profile
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your personal account information and profile details.
                </p>
            </div>

            {/* Success Alert */}
            {showSuccess && (
                <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-green-800">Success</p>
                        <p className="text-sm text-green-700">Your profile has been updated successfully.</p>
                    </div>
                    <button 
                        onClick={() => setShowSuccess(false)}
                        className="ml-auto text-green-600 hover:text-green-800"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                            ACCOUNT PROFILE
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isEditing ? 'Edit your profile information' : 'View your account details'}
                        </p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Card Content */}
                <div className="px-6 sm:px-8 py-6">
                    <div className="flex flex-col items-center">
                        {/* Avatar */}
                        <div className="relative mb-6">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                                {avatarPreview || profile?.avatarUrl ? (
                                    <img 
                                        src={avatarPreview || profile?.avatarUrl} 
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-semibold text-gray-600">
                                        {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                                    </span>
                                )}
                            </div>
                            {isEditing && (
                                <>
                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        <Camera className="h-4 w-4 text-white" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </>
                            )}
                        </div>

                        {/* Profile Fields */}
                        <div className="w-full">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <User className="h-4 w-4 inline mr-1.5" />
                                            First Name
                                        </label>
                                        <input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Enter first name"
                                            className={`w-full px-4 py-2.5 rounded-xl border ${
                                                errors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <User className="h-4 w-4 inline mr-1.5" />
                                            Last Name
                                        </label>
                                        <input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Enter last name"
                                            className={`w-full px-4 py-2.5 rounded-xl border ${
                                                errors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <Mail className="h-4 w-4 inline mr-1.5" />
                                            Email Address
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter email address"
                                            className={`w-full px-4 py-2.5 rounded-xl border ${
                                                errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    <div className="flex items-center gap-4 py-3.5">
                                        <span className="font-medium text-sm text-gray-500 w-32 flex-shrink-0">Full Name</span>
                                        <span className="text-sm text-gray-900">
                                            {profile?.firstName} {profile?.lastName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 py-3.5">
                                        <span className="font-medium text-sm text-gray-500 w-32 flex-shrink-0 flex items-center gap-1.5">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </span>
                                        <span className="text-sm text-gray-900">{profile?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-4 py-3.5">
                                        <span className="font-medium text-sm text-gray-500 w-32 flex-shrink-0 flex items-center gap-1.5">
                                            <Briefcase className="h-4 w-4" />
                                            Role
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            {profile?.role || 'User'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 py-3.5">
                                        <span className="font-medium text-sm text-gray-500 w-32 flex-shrink-0 flex items-center gap-1.5">
                                            <CheckCircle className="h-4 w-4" />
                                            Status
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            profile?.status === 'Active' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {profile?.status || 'Active'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 py-3.5">
                                        <span className="font-medium text-sm text-gray-500 w-32 flex-shrink-0 flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            Created
                                        </span>
                                        <span className="text-sm text-gray-900">
                                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 pt-3.5">
                                        <span className="font-medium text-sm text-gray-500 w-32 flex-shrink-0 flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            Updated
                                        </span>
                                        <span className="text-sm text-gray-900">
                                            {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex w-full gap-4 pt-6 mt-4 border-t border-gray-100">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
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
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}