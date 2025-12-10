import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            {
              refreshToken,
            }
          );

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  token: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'done';
  user_id: string;
  assigned_to: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  assigned_to?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskResponse {
  message: string;
  task: Task;
}

export interface TasksResponse {
  message: string;
  tasks: Task[];
}

export interface TaskFilters {
  status?: 'todo' | 'in-progress' | 'done';
  assigned_to?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Auth API functions
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/api/auth/me');
    return response.data;
  },

  updateProfile: async (
    data: { name?: string; email?: string }
  ): Promise<{ message: string; user: User }> => {
    const response = await api.put<{ message: string; user: User }>(
      '/api/auth/profile',
      data
    );
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
};

// Task API functions
export const taskAPI = {
  getTasks: async (filters?: TaskFilters): Promise<TasksResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters?.priority) params.append('priority', filters.priority);

    const queryString = params.toString();
    const url = queryString ? `/api/tasks?${queryString}` : '/api/tasks';
    const response = await api.get<TasksResponse>(url);
    return response.data;
  },

  getTask: async (id: string): Promise<TaskResponse> => {
    const response = await api.get<TaskResponse>(`/api/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: CreateTaskData): Promise<TaskResponse> => {
    const response = await api.post<TaskResponse>('/api/tasks', data);
    return response.data;
  },

  updateTask: async (
    id: string,
    data: UpdateTaskData
  ): Promise<TaskResponse> => {
    const response = await api.put<TaskResponse>(`/api/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/api/tasks/${id}`);
    return response.data;
  },
};

export default api;
