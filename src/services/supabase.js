import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://yhhsfeixpzxqqosajouc.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloaHNmZWl4cHp4cXFvc2Fqb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDkzMTUsImV4cCI6MjEwNDUyNTMxNX0.1Zqm8fG5xQZrdI9bE2E0Pa7P8dK9lwOP_0ngbizXIkY';

// Robust storage adapter compatible with React Native, Web & Node environments
const storageAdapter = {
  getItem: async (key) => {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        return await AsyncStorage.getItem(key);
      }
    } catch (e) {}
    return null;
  },
  setItem: async (key, value) => {
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {}
  },
  removeItem: async (key) => {
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {}
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
