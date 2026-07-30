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

// Helper to await Firebase auth initialization
const getFirebaseToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      auth.currentUser.getIdToken().then(resolve).catch(() => resolve(null));
      return;
    }
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        try {
          const token = await user.getIdToken();
          resolve(token);
        } catch (e) {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// A native fetch wrapper for easy migration of existing fetch() calls
export async function authFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const token = await getFirebaseToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    console.warn('authFetch: Firebase user is null, sending request without Authorization header');
  }
  return fetch(input, { ...init, headers });
}
