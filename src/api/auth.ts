import apiClient from './client';

export const login = (email: string, password: string) =>
  apiClient.post('/user/login', { email, password }).then(res => res.data);

export const signup = (data: Record<string, unknown>) =>
  apiClient.post('/user/signup', data).then(res => res.data);

export const forgotPassword = (email: string) =>
  apiClient.post('/user/forgot-password', { email }).then(res => res.data);

export const resetPassword = (token: string, new_password: string) =>
  apiClient.post('/user/reset-password', { token, new_password }).then(res => res.data);
