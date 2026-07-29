import axios from 'axios';
import { auth } from './firebase';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the Firebase ID token
apiClient.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// A native fetch wrapper for easy migration of existing fetch() calls
export async function authFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    } catch (e) {
      console.warn('Failed to get Firebase token for authFetch', e);
    }
  }
  return fetch(input, { ...init, headers });
}
