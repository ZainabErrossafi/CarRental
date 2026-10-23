import api, { TOKEN_KEY, clearSession } from './api';
import { consumeGoogleRedirect } from './googleRedirect';

const asUser = (user) => ({
  ...user,
  name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username,
});

export const getCurrentUser = async () => {
  consumeGoogleRedirect(window, TOKEN_KEY);
  if (!localStorage.getItem(TOKEN_KEY)) return null;
  const { data } = await api.get('users/me/');
  return asUser(data);
};

export const login = async ({ username, password }) => {
  clearSession();
  const { data } = await api.post('token/', { username, password });
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
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
    return await getCurrentUser();
  } catch (error) {
    clearSession();
    throw error;
  }
};

export const logout = async () => clearSession();

export const signup = async ({ name, email, password }) => {
  clearSession();
  const { data } = await api.post('auth/signup/', { username: name, email, password });
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ access: data.access, refresh: data.refresh }));
  const user = asUser(data.user);
  sessionStorage.setItem('rently_verification_email', user.email);
  return user;
};

export const verifyEmail = async () => {
  throw new Error('Email verification is not available yet. You can sign in with your username and password.');
};

export const resendVerification = async () => {
  throw new Error('Verification emails are not available yet.');
};
