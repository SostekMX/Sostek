import apiClient from './client';

export const getArticles = () =>
  apiClient.get('/articles').then(res => res.data);

export const getArticle = (id: string) =>
  apiClient.get(`/articles/${id}`).then(res => res.data);

export const getPresentations = () =>
  apiClient.get('/presentations').then(res => res.data);

export const getEvaluations = () =>
  apiClient.get('/evaluations').then(res => res.data);

export const getEvaluation = (id: string) =>
  apiClient.get(`/evaluations/${id}`).then(res => res.data);

export const getTutorial = () =>
  apiClient.get('/tutorial').then(res => res.data);
