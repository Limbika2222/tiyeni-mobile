import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDsEAju5gN6lySPFtguQMS9KpVpDeOS58Q',
  authDomain: 'tiyeni-aff3c.firebaseapp.com',
  projectId: 'tiyeni-aff3c',
  storageBucket: 'tiyeni-aff3c.firebasestorage.app',
  messagingSenderId: '665726792910',
  appId: '1:665726792910:web:828da2a720689f45a8cc9f',
}

// Prevent re-initialization in Expo Fast Refresh
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// ✅ Proper React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})

export const db = getFirestore(app)

export { app }
