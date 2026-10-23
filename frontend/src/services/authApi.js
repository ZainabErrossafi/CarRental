import api, { TOKEN_KEY, SESSION_KEY, clearSession } from './api';

const readLoginMethod = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')?.loginMethod; }
  catch { return null; }
};

// Google returns JWTs in the URL fragment after its server-side callback.
const consumeGoogleCallback = () => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const access = params.get('access');
  const refresh = params.get('refresh');
  if (!access || !refresh) return null;
  clearSession();
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ access, refresh }));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ loginMethod: 'google' }));
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  const returnTo = sessionStorage.getItem('rently_booking_return');
  sessionStorage.removeItem('rently_booking_return');
  return /^\/vehicles\/[^/?#]+(?:[?#].*)?$/.test(returnTo || '') ? returnTo : null;
};

const asUser = (user) => ({
  ...user,
  // Prefer server metadata when available; otherwise use the current login method.
  canChangePassword: typeof user.has_usable_password === 'boolean'
    ? user.has_usable_password
    : readLoginMethod() !== 'google',
  name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username,
});

export const getCurrentUser = async () => {
  const returnTo = consumeGoogleCallback();
  if (!localStorage.getItem(TOKEN_KEY)) return null;
  const { data } = await api.get('users/me/');
  if (returnTo) window.location.replace(returnTo);
  return asUser(data);
};

export const login = async ({ email, password }) => {
  clearSession();
  const { data } = await api.post('token/', { email, password });
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ loginMethod: 'password' }));
  try {
    return await getCurrentUser();
  } catch (error) {
    clearSession();
    throw error;
  }
};

export const googleLogin = async ({ access_token, code }) => {
  if (!access_token && !code) {
    throw new Error('A Google access token or authorization code is required.');
  }
  clearSession();
  try {
    const { data } = await api.post('auth/google/', access_token ? { access_token } : { code });
    if (!data.access || !data.refresh) {
      throw new Error('Google login did not return the required session tokens.');
    }
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ access: data.access, refresh: data.refresh }));
    localStorage.setItem(SESSION_KEY, JSON.stringify({ loginMethod: 'google' }));
    return await getCurrentUser();
  } catch (error) {
    clearSession();
    throw error;
  }
};

export const logout = async () => clearSession();

export const signup = async () => {
  throw new Error('Ask an administrator to create your account. Public administrator registration is unavailable.');
};

export const verifyEmail = async () => {
  throw new Error('Email verification is not available on this backend. Please sign in with your administrator account.');
};
