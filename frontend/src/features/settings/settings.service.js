import { settingsApi } from './settings.api';

export const settingsService = {
    // ==================== PROFILE ====================
    getProfile: async () => {
        const response = await settingsApi.getProfile();
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await settingsApi.updateProfile(data);
        return response.data;
    },

    // ==================== ACTIVITY LOG ====================
    getActivities: async (filters) => {
        const response = await settingsApi.getActivities(filters);
        return {
            data: response.data || [],
            total: response.total || 0,
            currentPage: response.current_page || 1,
            perPage: response.per_page || 10,
            lastPage: response.last_page || 1,
        };
    },
    getActivityDetail: async (id) => {
        const response = await settingsApi.getActivityDetail(id);
        return response.data;
    },

    // ==================== PREFERENCES ====================
    getPreferences: async () => {
        const response = await settingsApi.getPreferences();
        return response.data;
    },
    updatePreferences: async (data) => {
        const response = await settingsApi.updatePreferences(data);
        return response.data;
    },
    resetPreferences: async () => {
        const response = await settingsApi.resetPreferences();
        return response.data;
    },

    // ==================== SECURITY ====================
    changePassword: async (data) => {
        const response = await settingsApi.changePassword(data);
        return response.data;
    },
    getSecurityInfo: async () => {
        const response = await settingsApi.getSecurityInfo();
        return response.data;
    },
    getSessions: async () => {
        const response = await settingsApi.getSessions();
        return response.data;
    },
    logoutOtherSessions: async () => {
        const response = await settingsApi.logoutOtherSessions();
        return response.data;
    },
};