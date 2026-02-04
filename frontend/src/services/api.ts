/**
 * AegisSign - API Service
 * 
 * Axios client for communicating with the backend API.
 */

import axios, { AxiosError, AxiosInstance } from 'axios';

// ============================================================================
// Type Definitions
// ============================================================================

export interface User {
    id: string;
    email: string;
    publicKey: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
}

export interface VerifyResponse {
    success: boolean;
    message: string;
    verified?: boolean;
    signerPublicKey?: string;
}

export interface ApiError {
    success: false;
    message: string;
}

// ============================================================================
// API Client Setup
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('aegis_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
            // Clear token on unauthorized
            localStorage.removeItem('aegis_token');
            localStorage.removeItem('aegis_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
    signup: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/signup', {
            email,
            password,
        });
        return response.data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    getProfile: async (): Promise<{ success: boolean; user: User }> => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },
};

// ============================================================================
// Document API
// ============================================================================

export const documentApi = {
    sign: async (file: File, password: string): Promise<Blob> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        const response = await apiClient.post('/documents/sign', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob',
        });

        return response.data;
    },

    verify: async (file: File): Promise<VerifyResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<VerifyResponse>('/documents/verify', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },
};

// ============================================================================
// Auth Helpers
// ============================================================================

export const authHelpers = {
    saveAuth: (token: string, user: User): void => {
        localStorage.setItem('aegis_token', token);
        localStorage.setItem('aegis_user', JSON.stringify(user));
    },

    getUser: (): User | null => {
        const userStr = localStorage.getItem('aegis_user');
        if (userStr) {
            try {
                return JSON.parse(userStr) as User;
            } catch {
                return null;
            }
        }
        return null;
    },

    getToken: (): string | null => {
        return localStorage.getItem('aegis_token');
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('aegis_token');
    },

    logout: (): void => {
        localStorage.removeItem('aegis_token');
        localStorage.removeItem('aegis_user');
    },
};

export default apiClient;
