import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    lastLogin?: string;
  };
}

export interface User {
  id: string;
  username: string;
  role: string;
  lastLogin?: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Login failed');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'Login failed');
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to get user');
      }
      return response.data.data.user;
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post('/auth/refresh');
    return response.data.data;
  },
};

export default api;
