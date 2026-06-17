import axios from 'axios';
import { BACKEND_URL } from '../config';

const apiClient = axios.create({ baseURL: BACKEND_URL });

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
