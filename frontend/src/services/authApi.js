const delay = (data, ms = 400) => new Promise((res) => setTimeout(() => res(data), ms));

const SESSION_KEY = "rently_admin_session";

// Mock user store (email -> user record with password).
// This stands in for a real backend until one exists.
let mockAccounts = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@rently.com",
    password: "admin123",
    role: "admin",
  },
];

const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSession = (user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = () => readSession();

export const login = async ({ email, password }) => {
  await delay(null); // simulate network latency

  const account = mockAccounts.find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );

  if (!account || account.password !== password) {
    throw new Error("Invalid email or password.");
  }

  const { password: _pw, ...safeUser } = account;
  writeSession(safeUser);
  return safeUser;
};

export const signup = async ({ name, email, password }) => {
  await delay(null); // simulate network latency

  const exists = mockAccounts.some(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );

  if (exists) {
    throw new Error("An account with this email already exists.");
  }

  const newAccount = {
    id: mockAccounts.length + 1,
    name,
    email,
    password,
    role: "admin",
    verified: false,
  };
  mockAccounts = [...mockAccounts, newAccount];

  // No session yet: the user must verify their email first.
  const { password: _pw, ...safeUser } = newAccount;
  return safeUser;
};

// Mock verification: any complete code is accepted until a real backend exists.
export const verifyEmail = async ({ email, code }) => {
  await delay(null);

  const account = mockAccounts.find(
    (a) => a.email.toLowerCase() === (email || "").toLowerCase()
  );
  if (!account) {
    throw new Error("Account not found. Please sign up again.");
  }
  if (!code || code.length < 4) {
    throw new Error("Invalid verification code.");
  }

  account.verified = true;
  const { password: _pw, ...safeUser } = account;
  writeSession(safeUser);
  return safeUser;
};

export const logout = () => {
  clearSession();
  return delay(null);
};