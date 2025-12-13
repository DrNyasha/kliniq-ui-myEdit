// lib/appointments-api.ts
/**
 * Appointments API client for patient appointments management.
 */

import { apiClient } from './api-client'

// ============================================================================
// TYPES
// ============================================================================

export interface AppointmentResponse {
    id: string
    doctor_name: string
    specialty?: string
    hospital_name?: string
    location?: string
    scheduled_date: string
    scheduled_time: string
    duration_minutes: number
    type: 'in-person' | 'video'
    status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress'
    notes?: string
    cancellation_reason?: string
    created_at: string
}

export interface AppointmentListResponse {
    appointments: AppointmentResponse[]
    total: number
    page: number
    per_page: number
}

export interface AppointmentActionResponse {
    success: boolean
    message: string
    appointment?: AppointmentResponse
}

export interface AppointmentCreateRequest {
    clinician_id?: string
    hospital_id?: string
    department_id?: string
    scheduled_date: string
    scheduled_time: string
    duration_minutes?: number
    type?: 'in-person' | 'video'
    notes?: string
}

export interface AppointmentUpdateRequest {
    notes?: string
    type?: 'in-person' | 'video'
}

export interface AppointmentRescheduleRequest {
    scheduled_date: string
    scheduled_time: string
}

// ============================================================================
// APPOINTMENT REQUEST TYPES
// ============================================================================

export interface AppointmentRequestCreate {
    hospital_id: string
    department: string
    reason: string
    preferred_type?: 'in-person' | 'video'
    urgency?: 'low' | 'normal' | 'urgent'
}

export interface AppointmentRequestResponse {
    id: string
    hospital_id: string
    hospital_name: string
    department: string
    reason: string
    preferred_type: 'in-person' | 'video'
    urgency: 'low' | 'normal' | 'urgent'
    status: 'pending' | 'approved' | 'rejected'
    rejection_reason?: string
    created_at: string
}

export interface AppointmentRequestListResponse {
    requests: AppointmentRequestResponse[]
    total: number
}

export interface AppointmentRequestActionResponse {
    success: boolean
    message: string
    request?: AppointmentRequestResponse
}

// ============================================================================
// LINKED HOSPITALS TYPES
// ============================================================================

export interface DepartmentInfo {
    id: string
    name: string
}

export interface LinkedHospitalWithDepartments {
    id: string
    name: string
    city: string
    departments: DepartmentInfo[]
}

export interface LinkedHospitalsResponse {
    hospitals: LinkedHospitalWithDepartments[]
}

// ============================================================================
// HELPER
// ============================================================================

const getToken = (): string | undefined => {
    if (typeof window === 'undefined') return undefined
    return localStorage.getItem('kliniq_token') || undefined
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const appointmentsApi = {
    /**
     * Get patient's appointments with optional status filter.
     */
    getAppointments: async (
        status?: 'all' | 'upcoming' | 'completed' | 'cancelled',
        page: number = 1,
        perPage: number = 20
    ): Promise<AppointmentListResponse> => {
        const params = new URLSearchParams()
        if (status && status !== 'all') params.append('status', status)
        params.append('page', page.toString())
        params.append('per_page', perPage.toString())

        return apiClient.get<AppointmentListResponse>(
            `/appointments?${params.toString()}`,
            getToken()
        )
    },

    /**
     * Get a single appointment by ID.
     */
    getAppointment: async (id: string): Promise<AppointmentResponse> => {
        return apiClient.get<AppointmentResponse>(`/appointments/${id}`, getToken())
    },

    /**
     * Create/book a new appointment.
     */
    createAppointment: async (
        request: AppointmentCreateRequest
    ): Promise<AppointmentActionResponse> => {
        return apiClient.post<AppointmentActionResponse>(
            '/appointments',
            request,
            getToken()
        )
    },

    /**
     * Update appointment details.
     */
    updateAppointment: async (
        id: string,
        request: AppointmentUpdateRequest
    ): Promise<AppointmentActionResponse> => {
        return apiClient.put<AppointmentActionResponse>(
            `/appointments/${id}`,
            request,
            getToken()
        )
    },

    /**
     * Reschedule an appointment to a new date/time.
     */
    rescheduleAppointment: async (
        id: string,
        request: AppointmentRescheduleRequest
    ): Promise<AppointmentActionResponse> => {
        return apiClient.put<AppointmentActionResponse>(
            `/appointments/${id}/reschedule`,
            request,
            getToken()
        )
    },

    /**
     * Cancel an appointment.
     */
    cancelAppointment: async (
        id: string,
        reason?: string
    ): Promise<AppointmentActionResponse> => {
        // Note: cancellation reason not sent since apiClient.delete doesn't support body
        return apiClient.delete<AppointmentActionResponse>(
            `/appointments/${id}`,
            getToken()
        )
    },

    // ========================================================================
    // APPOINTMENT REQUESTS
    // ========================================================================

    /**
     * Get patient's appointment requests.
     */
    getAppointmentRequests: async (
        status?: 'all' | 'pending' | 'approved' | 'rejected'
    ): Promise<AppointmentRequestListResponse> => {
        const params = new URLSearchParams()
        if (status && status !== 'all') params.append('status', status)

        return apiClient.get<AppointmentRequestListResponse>(
            `/appointments/requests?${params.toString()}`,
            getToken()
        )
    },

    /**
     * Submit a new appointment request.
     */
    createAppointmentRequest: async (
        request: AppointmentRequestCreate
    ): Promise<AppointmentRequestActionResponse> => {
        return apiClient.post<AppointmentRequestActionResponse>(
            '/appointments/requests',
            request,
            getToken()
        )
    },

    /**
     * Cancel a pending appointment request.
     */
    cancelAppointmentRequest: async (
        requestId: string
    ): Promise<AppointmentRequestActionResponse> => {
        return apiClient.delete<AppointmentRequestActionResponse>(
            `/appointments/requests/${requestId}`,
            getToken()
        )
    },

    // ========================================================================
    // LINKED HOSPITALS
    // ========================================================================

    /**
     * Get patient's linked hospitals with their departments.
     */
    getLinkedHospitals: async (): Promise<LinkedHospitalsResponse> => {
        return apiClient.get<LinkedHospitalsResponse>(
            '/appointments/linked-hospitals',
            getToken()
        )
    }
}
