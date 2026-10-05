import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthForm = /\/auth\/(login|register)/.test(err.config?.url || '');
    if (err.response?.status === 401 && !isAuthForm) {
      localStorage.removeItem('sp_token');
      if (!location.pathname.startsWith('/login')) location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export const errMsg = (err) =>
  err.response?.data?.message || (err.request ? 'Cannot reach the server. Check that the API is running.' : err.message);

export default api;
