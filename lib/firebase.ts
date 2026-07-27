import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBZYcjc_an_mqMyjWjW2YhE9FFEDe5Ym_E',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'clear-guide.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'clear-guide',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'clear-guide.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '697728888383',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:697728888383:web:a62d059c8f29f0d006928a',
}

// Initialize Firebase (singleton-safe)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
