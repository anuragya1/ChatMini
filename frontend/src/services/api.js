import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export const loginUser = async (data) => api.post('/auth/login', data).then((res) => res.data);
export const registerUser = async (data) => api.post('/auth/register', data).then((res) => res.data);
export const getMessages = async (recipientId) => api.get(`/messages/${recipientId}`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
}).then((res) => res.data);