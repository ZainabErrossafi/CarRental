import api, { TOKEN_KEY, SESSION_KEY, clearSession } from './api';
import { consumeGoogleRedirect } from './googleRedirect';

const readLoginMethod = () => {
  try {
    const tokens = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return tokens?.loginMethod || session?.loginMethod;
  }
  catch { return null; }
};

const consumeGoogleCallback = () => {
  if (!consumeGoogleRedirect(window, TOKEN_KEY)) return null;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ loginMethod: 'google' }));
  const returnTo = sessionStorage.getItem('rently_booking_return');
  sessionStorage.removeItem('rently_booking_return');
  return /^\/vehicles\/[^/?#]+(?:[?#].*)?$/.test(returnTo || '') ? returnTo : null;
};

const asUser = (user) => {
  if (!user) throw new Error("The server did not return a user profile.");
  return ({
  ...user,

  canChangePassword: typeof user.has_usable_password === 'boolean'
    ? user.has_usable_password
    : readLoginMethod() !== 'google',
  name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username,
  });
};

export const getCurrentUser = async () => {
  const returnTo = consumeGoogleCallback();
  if (!localStorage.getItem(TOKEN_KEY)) return null;
  const { data } = await api.get('users/me/');
  if (returnTo) window.location.replace(returnTo);
  return asUser(data);
};

export const login = async ({ username, password }) => {
  clearSession();
  const { data } = await api.post('token/', { username, password });
  if (data.two_factor_required) {
    sessionStorage.setItem('rently_verification_token', data.ephemeral_token);
    sessionStorage.setItem('rently_verification_email', data.email);
    return data;
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ ...data, loginMethod: "password" }));
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
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ access: data.access, refresh: data.refresh, loginMethod: "google" }));
    localStorage.setItem(SESSION_KEY, JSON.stringify({ loginMethod: 'google' }));
    return await getCurrentUser();
  } catch (error) {
    clearSession();
    throw error;
  }
};

export const logout = async () => clearSession();

const VERIFICATION_KEY = 'rently_verification_token';

const verificationToken = (email) => {
  const token = sessionStorage.getItem(VERIFICATION_KEY);
  if (!token || sessionStorage.getItem('rently_verification_email') !== email) {
    throw new Error('Your verification session has expired. Please sign up again.');
  }
  return token;
};

export const signup = async ({ name, email, password }) => {
  clearSession();
  sessionStorage.removeItem(VERIFICATION_KEY);
  sessionStorage.removeItem('rently_verification_email');
  const { data } = await api.post('auth/signup/', { username: name.trim(), email: email.trim(), password });
  if (!data.ephemeral_token || !data.email) {
    throw new Error('Signup did not return an email verification session.');
  }
  sessionStorage.setItem(VERIFICATION_KEY, data.ephemeral_token);
  sessionStorage.setItem('rently_verification_email', data.email);
  return data;
};

export const verifyEmail = async ({ email, code }) => {
  const { data } = await api.post('auth/2fa/verify/', {
    ephemeral_token: verificationToken(email), code,
  });
  if (!data.access || !data.refresh) {
    throw new Error('Verification did not return the required session tokens.');
  }
  sessionStorage.removeItem(VERIFICATION_KEY);
  sessionStorage.removeItem('rently_verification_email');
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ access: data.access, refresh: data.refresh, loginMethod: "password" }));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ loginMethod: 'password' }));
  try {
    return await getCurrentUser();
  } catch (error) {
    clearSession();
    throw error;
  }
};

export const resendVerification = async (email) => {
  const { data } = await api.post('auth/2fa/resend/', {
    ephemeral_token: verificationToken(email),
  });
  return { ...data, detail: data.message };
};
