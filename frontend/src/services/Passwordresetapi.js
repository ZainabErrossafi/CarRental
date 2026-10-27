import axios from "axios";

const client = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "")}/`,
  timeout: 15000,
});

export const requestPasswordReset = (email) =>
  client.post("auth/password-reset/request/", { email });

export const confirmPasswordReset = ({ email, code, newPassword }) =>
  client.post("auth/password-reset/confirm/", { email, code, new_password: newPassword });

export const verifyPasswordResetCode = ({ email, code }) =>
  client.post("auth/password-reset/verify/", { email, code });