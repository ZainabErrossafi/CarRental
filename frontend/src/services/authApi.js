import api, { TOKEN_KEY, clearSession } from './api';

const asUser = (user) => ({
  ...user,
  name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username,
});

export const getCurrentUser = async () => {
  if (!localStorage.getItem(TOKEN_KEY)) return null;
  const { data } = await api.get('users/me/');
  return asUser(data);
};

export const login = async ({ email, password }) => {
  clearSession();
  const { data } = await api.post('token/', { email, password });
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
  try {
    return await getCurrentUser();
  } catch (error) {
    clearSession();
    throw error;
  }
};

export const logout = async () => clearSession();

// The backend intentionally restricts account creation to administrators.
export const signup = async () => {
  throw new Error('Ask an administrator to create your account. Public administrator registration is unavailable.');
};

export const verifyEmail = async () => {
  throw new Error('Email verification is not available on this backend. Please sign in with your administrator account.');
};
