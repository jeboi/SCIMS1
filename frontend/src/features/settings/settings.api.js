import axiosInstance from '@/lib/axios';

export const settingsApi = {
    // ==================== PROFILE ENDPOINTS ====================
    getProfile: async () => {
        const response = await axiosInstance.get('/user/profile');
        return response.data;
    },
    updateProfile: async (data) => {
        const formData = new FormData();
        formData.append('first_name', data.firstName || '');
        formData.append('last_name', data.lastName || '');
        formData.append('email', data.email || '');
        
        if (data.avatar instanceof File) {
            formData.append('avatar', data.avatar);
        }
        
        formData.append('_method', 'PUT');
        
        const response = await axiosInstance.post('/user/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // ==================== ACTIVITY LOG ENDPOINTS ====================
    getActivities: async (params = {}) => {
        const response = await axiosInstance.get('/user/activities', { 
            params: {
                page: params.page || 1,
                per_page: params.perPage || 10,
                date_from: params.dateFrom ? new Date(params.dateFrom).toISOString().split('T')[0] : undefined,
                date_to: params.dateTo ? new Date(params.dateTo).toISOString().split('T')[0] : undefined,
                module: params.module !== 'All Modules' ? params.module : undefined,
                activity_type: params.activityType !== 'All Types' ? params.activityType : undefined,
                status: params.status !== 'All' ? params.status : undefined,
                search: params.search || undefined,
            }
        });
        return response.data;
    },
    getActivityDetail: async (id) => {
        const response = await axiosInstance.get(`/user/activities/${id}`);
        return response.data;
    },

    // ==================== PREFERENCES ENDPOINTS ====================
    getPreferences: async () => {
        const response = await axiosInstance.get('/user/preferences');
        return response.data;
    },
    updatePreferences: async (data) => {
        const response = await axiosInstance.put('/user/preferences', data);
        return response.data;
    },
    resetPreferences: async () => {
        const response = await axiosInstance.post('/user/preferences/reset');
        return response.data;
    },

    // ==================== SECURITY ENDPOINTS ====================
changePassword: async (data) => {
    const response = await axiosInstance.post('/user/change-password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.confirmPassword,  // ← Change this
    });
    return response.data;
},
    getSecurityInfo: async () => {
        const response = await axiosInstance.get('/user/security');
        return response.data;
    },
    getSessions: async () => {
        const response = await axiosInstance.get('/user/sessions');
        return response.data;
    },
    logoutOtherSessions: async () => {
        const response = await axiosInstance.post('/user/sessions/logout-others');
        return response.data;
    },
};