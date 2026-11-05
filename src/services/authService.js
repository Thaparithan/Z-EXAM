// Authentication Service for Z-EXAM Admin Portal
// Supports both:
// 1. Classic Stealth Master Passkey: zynor.ta / zynor@2911#
// 2. Supabase Auth (Email / Password)

import { supabase, isSupabaseConfigured } from './supabase.js';

const ADMIN_USER = 'zynor.ta';
const ADMIN_PASS = 'zynor@2911#';
const AUTH_STORAGE_KEY = 'zexam_admin_auth_token';

export const authService = {
  login: async (identifier, password) => {
    const trimmed = identifier.trim();

    // 1. Direct Master Passkey Check
    if (trimmed === ADMIN_USER && password === ADMIN_PASS) {
      const sessionData = {
        username: ADMIN_USER,
        email: 'zynor.ta@zexam.lk',
        role: 'admin',
        loginTime: Date.now(),
        token: `zexam_jwt_${btoa(ADMIN_USER + '_' + Date.now())}`
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    }

    // 2. Supabase Auth Check (if configured and input looks like an email)
    if (isSupabaseConfigured && trimmed.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmed,
          password: password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data?.user) {
          const sessionData = {
            username: data.user.email.split('@')[0],
            email: data.user.email,
            role: 'admin',
            userId: data.user.id,
            loginTime: Date.now(),
            token: data.session?.access_token || `zexam_${Date.now()}`
          };
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
          return { success: true, user: sessionData };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    return {
      success: false,
      error: 'Invalid admin credentials. Access denied.'
    };
  },

  logout: async () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
  },

  isAuthenticated: () => {
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return parsed && parsed.role === 'admin';
    } catch {
      return false;
    }
  },

  getCurrentUser: () => {
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
};
