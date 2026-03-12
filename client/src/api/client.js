import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor – attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  refresh: (data) => apiClient.post('/auth/refresh', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
};

// ─── Users API ──────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  invite: (data) => apiClient.post('/users/invite', data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  deactivate: (id) => apiClient.delete(`/users/${id}`),
  updateProfile: (data) => apiClient.put('/users/profile', data),
};

// ─── Tenant API ─────────────────────────────────────────────────────────────
export const tenantApi = {
  get: () => apiClient.get('/tenant'),
  update: (data) => apiClient.put('/tenant', data),
  getSubscription: () => apiClient.get('/tenant/subscription'),
  getAuditLogs: (params) => apiClient.get('/tenant/audit-logs', { params }),
};

// ─── Analytics API ──────────────────────────────────────────────────────────
export const analyticsApi = {
  getTenantAnalytics: () => apiClient.get('/analytics/tenant'),
  getPlatformAnalytics: () => apiClient.get('/analytics/platform'),
};

// ─── Admin API ───────────────────────────────────────────────────────────────
export const adminApi = {
  getAllTenants: (params) => apiClient.get('/admin/tenants', { params }),
  toggleTenantStatus: (id) => apiClient.patch(`/admin/tenants/${id}/status`),
  updateTenantPlan: (id, plan) => apiClient.patch(`/admin/tenants/${id}/plan`, { plan }),
};

export default apiClient;
