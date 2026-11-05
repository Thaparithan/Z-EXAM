// Authentication Service for Z-EXAM Admin Portal
// Configured Credentials:
// Username: zynor.ta
// Password: zynor@2911#

const ADMIN_USER = 'zynor.ta';
const ADMIN_PASS = 'zynor@2911#';
const AUTH_STORAGE_KEY = 'zexam_admin_auth_token';

export const authService = {
  login: async (username, password) => {
    // Artificial small delay for UX realism
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      const sessionData = {
        username: ADMIN_USER,
        role: 'admin',
        loginTime: Date.now(),
        token: `zexam_jwt_${btoa(ADMIN_USER + '_' + Date.now())}`
      };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    }

    return {
      success: false,
      error: 'Invalid admin credentials. Access denied.'
    };
  },

  logout: () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  },

  isAuthenticated: () => {
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return parsed && parsed.role === 'admin' && parsed.username === ADMIN_USER;
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

