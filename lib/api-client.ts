// API Client for Kliniq Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        // Handle token expiry - 401 Unauthorized
        if (response.status === 401) {
            // Clear auth data from localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('kliniq_token');
                localStorage.removeItem('kliniq_user');

                // Redirect to login page
                window.location.href = '/auth?expired=true';
            }
        }

        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            errorData.detail || errorData.message || 'An error occurred'
        );
    }
    return response.json();
}

export const apiClient = {
    async get<T>(endpoint: string, token?: string): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });
        return handleResponse<T>(response);
    },

    async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse<T>(response);
    },

    async put<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse<T>(response);
    },

    async delete<T>(endpoint: string, token?: string): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        return handleResponse<T>(response);
    },
};

export { ApiError };
export default apiClient;
