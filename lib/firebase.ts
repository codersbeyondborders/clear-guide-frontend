import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

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

// Connect to emulators if in development and flag is set
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  // Prevent connecting twice in hot-reload
  if (!(auth as any)._emulatorConnected) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    ;(auth as any)._emulatorConnected = true
  }
  if (!(db as any)._emulatorConnected) {
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    ;(db as any)._emulatorConnected = true
  }
  if (!(storage as any)._emulatorConnected) {
    connectStorageEmulator(storage, '127.0.0.1', 9199)
    ;(storage as any)._emulatorConnected = true
  }
}
