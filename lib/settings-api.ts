// lib/settings-api.ts
// API client for settings endpoints

import { apiClient } from './api-client'

// ============================================================================
// HELPER
// ============================================================================

const getToken = (): string | undefined => {
    if (typeof window === 'undefined') return undefined
    return localStorage.getItem('kliniq_token') || undefined
}

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationSettings {
    appointments: boolean
    messages: boolean
    reminders: boolean
    updates: boolean
}

export interface SettingsResponse {
    preferred_language: string | null
    notification_settings: NotificationSettings
}

export interface UpdateSettingsRequest {
    preferred_language?: string
    notification_settings?: NotificationSettings
}

export interface SettingsActionResponse {
    success: boolean
    message: string
    settings?: SettingsResponse
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const settingsApi = {
    /**
     * Get current patient settings
     */
    getSettings: async (): Promise<SettingsResponse> => {
        const token = getToken()
        return apiClient.get<SettingsResponse>('/settings', token)
    },

    /**
     * Update patient settings
     */
    updateSettings: async (request: UpdateSettingsRequest): Promise<SettingsActionResponse> => {
        const token = getToken()
        return apiClient.put<SettingsActionResponse>('/settings', request, token)
    },
}
