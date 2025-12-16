// lib/clinician-api.ts
/**
 * Clinician API client for nurse and doctor dashboard endpo// Clinician API Client
 */

import { apiClient } from './api-client'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getToken = (): string | undefined => {
    if (typeof window === 'undefined') return undefined
    return localStorage.getItem('kliniq_token') || undefined
}

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

export interface ClinicianStat {
    label: string
    value: number | string
    trend?: string
    icon?: any
}

export interface TriageCaseResponse {
    id: string
    patient_name: string
    patient_id: string
    symptoms: string
    duration?: string
    urgency: 'low' | 'medium' | 'high'
    language: string
    submitted_at: string
    status: 'pending' | 'in-review' | 'escalated' | 'resolved'
    ai_summary?: string
}

export interface EscalatedQueryResponse {
    id: string
    patient_name: string
    patient_id: string
    question: string
    nurse_note?: string
    urgency: 'medium' | 'high'
    submitted_at: string
    status: 'pending' | 'answered'
    ai_draft?: string
}

export interface PointsBreakdown {
    action: string
    points: number
    count: number
}

export interface PointsSummary {
    current: number
    goal: number
    this_month: number
    last_month: number
    breakdown: PointsBreakdown[]
}

export interface RecentActivity {
    action: string
    time: string
    points: string
}

export interface ClinicianDashboardResponse {
    clinician_name: string
    role: 'nurse' | 'doctor'
    hospital_name?: string
    stats: ClinicianStat[]
    triage_cases?: TriageCaseResponse[]
    escalated_queries?: EscalatedQueryResponse[]
    points: PointsSummary
    recent_activity: RecentActivity[]
}

// =============================================================================
// PATIENTS LIST TYPES
// =============================================================================

export interface PatientListItem {
    id: string
    name: string
    patient_id: string
    age: number
    gender: string
    last_visit: string
    status: 'active' | 'pending' | 'completed'
    urgency: 'low' | 'medium' | 'high'
    condition: string
    avatar: string
    avatar_initials: string
}

export interface PatientsListResponse {
    patients: PatientListItem[]
    total: number
}

// =============================================================================
// PATIENT DETAIL TYPES
// =============================================================================

export interface PatientDemographics {
    id: string
    patient_id: string
    name: string
    age: number
    gender: string
    phone: string
    email: string
    location: string
    language: string
    avatar: string
    blood_type: string | null
    allergies: string[]
    current_medications: string[]
    linked_since: string
}

export interface VitalSigns {
    blood_pressure: string
    heart_rate: number
    temperature: number
    respiratory_rate: number
    oxygen_saturation: number
    oxygen_level: number  // Alias for oxygen_saturation
    recorded_at: string
}

export interface TriageDetail {
    id: string
    symptoms: string
    duration?: string
    ai_summary: string
    ai_recommendations: string[]
    ai_recommendation?: string  // Singular alias
    urgency: 'low' | 'medium' | 'high'
    status: string
    submitted_at: string
    vitals: VitalSigns | null
    vital_signs?: VitalSigns | null  // Alias for vitals
}

export interface MedicalNoteResponse {
    id: string
    note: string
    created_by: string
    created_at: string
    category: string
}

export interface PendingQueryResponse {
    id: string
    question: string
    submitted_at: string
    ai_draft?: string
    nurse_note?: string
    status: string
}

export interface HistoryItemResponse {
    id: string
    type: string
    title: string
    doctor: string
    date: string
    description: string
    status?: string
}

export interface PatientDetailResponse {
    patient: PatientDemographics
    triage: TriageDetail | null
    medical_notes: MedicalNoteResponse[]
    pending_queries: PendingQueryResponse[]
    history: HistoryItemResponse[]
}

// =============================================================================
// APPOINTMENT REQUESTS TYPES
// =============================================================================

export interface AppointmentRequestItem {
    id: string
    patient_name: string
    patient_age: number
    patient_phone: string
    patient_email: string
    hospital: string
    hospital_id: string  // Added for fetching doctors
    department: string
    reason: string
    preferred_type: string  // "in-person" or "video"
    urgency: string  // "low", "normal", "urgent"
    status: string  // "pending", "approved", "rejected"
    submitted_at: string  // relative time
    submitted_date: string  // formatted date
}

export interface AppointmentRequestsResponse {
    requests: AppointmentRequestItem[]
    total: number
    pending: number
    urgent: number
}

export interface ApproveRequestData {
    clinician_id: string
    scheduled_date: string  // YYYY-MM-DD
    scheduled_time: string  // HH:MM
}

export interface RejectRequestData {
    rejection_reason: string
}

// =============================================================================
// SIDEBAR COUNTS TYPES
// =============================================================================

export interface SidebarCountsResponse {
    patients_count: number
    requests_count: number
    pending_queries_count: number
}

// =============================================================================
// DOCTORS LIST TYPES
// =============================================================================

export interface DoctorListItem {
    id: string
    full_name: string
    specialty: string | null
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

export const clinicianApi = {
    /**
     * Get main clinician dashboard data
     */
    getDashboard: async (): Promise<ClinicianDashboardResponse> => {
        return apiClient.get<ClinicianDashboardResponse>('/clinician', getToken())
    },

    /**
     * Get list of patients with active triage cases
     */
    getPatients: async (): Promise<PatientsListResponse> => {
        return apiClient.get<PatientsListResponse>('/clinician/patients', getToken())
    },

    /**
     * Get detailed patient information
     */
    getPatientDetail: async (patientId: string): Promise<PatientDetailResponse> => {
        return apiClient.get<PatientDetailResponse>(`/clinician/patient/${patientId}`, getToken())
    },

    /**
     * Get appointment requests for nurse review
     */
    getRequests: async (status: string = 'pending'): Promise<AppointmentRequestsResponse> => {
        return apiClient.get<AppointmentRequestsResponse>(`/clinician/requests?status=${status}`, getToken())
    },

    /**
     * Approve appointment request and schedule
     */
    approveRequest: async (requestId: string, data: ApproveRequestData): Promise<void> => {
        await apiClient.post(`/clinician/requests/${requestId}/approve`, data, getToken())
    },

    /**
     * Reject appointment request with reason
     */
    rejectRequest: async (requestId: string, data: RejectRequestData): Promise<void> => {
        await apiClient.post(`/clinician/requests/${requestId}/reject`, data, getToken())
    },

    /**
   * Get sidebar badge counts
   */
    getSidebarCounts: async (): Promise<SidebarCountsResponse> => {
        return apiClient.get<SidebarCountsResponse>('/clinician/counts', getToken())
    },

    /**
     * Get doctors by hospital for appointment scheduling
     */
    getDoctorsByHospital: async (hospitalId: string): Promise<DoctorListItem[]> => {
        return apiClient.get<DoctorListItem[]>(`/clinician/doctors/${hospitalId}`, getToken())
    },
}

export default clinicianApi
