import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC2Ar44ScQgfFVu6URqLZ_zc8CGl2J64ZI',
  authDomain: 'the-barber-mosaic.firebaseapp.com',
  projectId: 'the-barber-mosaic',
  storageBucket: 'the-barber-mosaic.firebasestorage.app',
  messagingSenderId: '412468188187',
  appId: '1:412468188187:web:1bd028460e7b895ffe14be',
  measurementId: 'G-JX6P9YMV00',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
