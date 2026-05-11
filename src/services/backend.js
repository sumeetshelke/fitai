import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'fitai.authToken';
const PRODUCTION_API_URL = 'https://fitai-api-0dzz.onrender.com';
const API_URL = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;

async function request(path, options = {}) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

export async function signup({ name, email, password }) {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export async function login({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getCurrentUser() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const data = await request('/auth/me');
  return data.user;
}

export async function updateProfile(profile) {
  const data = await request('/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
  return data.user;
}

export async function listFoodLogs() {
  const data = await request(`/food-logs?date=${new Date().toISOString().slice(0, 10)}`);
  return data.logs;
}

export async function createFoodLog(meal, item) {
  const data = await request('/food-logs', {
    method: 'POST',
    body: JSON.stringify({ meal, ...item }),
  });
  return data.log;
}

export async function deleteFoodLog(id) {
  await request(`/food-logs/${id}`, { method: 'DELETE' });
}

export async function listWorkoutLogs() {
  const data = await request(`/workout-logs?date=${new Date().toISOString().slice(0, 10)}`);
  return data.logs;
}

export async function createWorkoutLog(workout) {
  const data = await request('/workout-logs', {
    method: 'POST',
    body: JSON.stringify(workout),
  });
  return data.log;
}

export async function updateWorkoutLog(id, workout) {
  const data = await request(`/workout-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(workout),
  });
  return data.log;
}

export { API_URL };
