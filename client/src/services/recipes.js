import api from './http.js';

export const fetchRecipes = async (params = {}) => {
  const { data } = await api.get('/recipes', { params });
  return data;
};

export const fetchRecipe = async (id) => {
  const { data } = await api.get(`/recipes/${id}`);
  return data;
};

export const createRecipe = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'ingredients' || key === 'instructions') {
      formData.append(key, Array.isArray(value) ? value.join('\n') : value);
    } else if (key === 'photo' && value) {
      formData.append('photo', value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const { data } = await api.post('/recipes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateRecipe = async (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'ingredients' || key === 'instructions') {
      formData.append(key, Array.isArray(value) ? value.join('\n') : value);
    } else if (key === 'photo' && value instanceof File) {
      formData.append('photo', value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const { data } = await api.put(`/recipes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteRecipe = async (id) => {
  const { data } = await api.delete(`/recipes/${id}`);
  return data;
};

export const addComment = async (id, text) => {
  const { data } = await api.post(`/recipes/${id}/comments`, { text });
  return data;
};

export const rateRecipe = async (id, value) => {
  const { data } = await api.post(`/recipes/${id}/rating`, { value });
  return data;
};

export const favoriteRecipe = async (id) => {
  const { data } = await api.post(`/recipes/${id}/favorite`);
  return data;
};

