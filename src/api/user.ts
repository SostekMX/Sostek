import apiClient from './client';

export const getProfile = () =>
  apiClient.get('/user/profile').then(res => res.data);

export const editProfile = (data: Record<string, unknown>) =>
  apiClient.post('/user/edit', data).then(res => res.data);

export const uploadAvatar = (formData: FormData) =>
  apiClient.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);

export const deleteAccount = () =>
  apiClient.delete('/user').then(res => res.data);

export const saveScore = (score_test: number) =>
  apiClient.post('/user/score', { score_test }).then(res => res.data);

export const getFavorites = () =>
  apiClient.get('/user/favorites').then(res => res.data);

export const addFavorite = (content_id: string, type: 'article' | 'presentation') =>
  apiClient.post('/user/favorites', { content_id, type }).then(res => res.data);

export const removeFavorite = (content_id: string) =>
  apiClient.delete(`/user/favorites/${content_id}`).then(res => res.data);
