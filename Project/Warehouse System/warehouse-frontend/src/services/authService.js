const API_BASE = 'http://localhost:5000/api/auth';

const post = async (endpoint, body) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    // Pass through all fields from the error response (e.g. requiresVerification)
    throw { message: data.message || 'Something went wrong', ...data };
  }

  return data;
};

export const authService = {
  // Sign up – creates user and sends OTP to email
  signup: async (userData) => {
    return post('/signup', userData);
  },

  // Verify email with 6-digit OTP
  verifyEmail: async (email, code) => {
    return post('/verify-email', { email, code });
  },

  // Resend verification OTP
  resendVerificationCode: async (email) => {
    return post('/resend-verification', { email });
  },

  // Login – returns JWT token + user object
  login: async (email, password, rememberMe) => {
    const data = await post('/login', { email, password });

    // Persist session
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    return data;
  },

  // Request password reset OTP
  requestPasswordReset: async (email) => {
    return post('/request-reset', { email });
  },

  // Reset password using OTP
  resetPassword: async (email, code, newPassword) => {
    return post('/reset-password', { email, code, newPassword });
  },

  // ─── Local helpers ───────────────────────────────────────────────────────

  getCurrentUser: () => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  getRememberedEmail: () => {
    return localStorage.getItem('rememberedEmail');
  },
};
