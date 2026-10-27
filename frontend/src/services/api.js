import axios from 'axios';

export const TOKEN_KEY = 'rently_admin_tokens';
export const SESSION_KEY = 'rently_admin_session';

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('rently:logout'));
};

const readTokens = () => {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
  } catch {
    return null;
  }
};

const normalize = (url = '') => url.replace(/^\/+/, '');

// Login / signup / refresh endpoints: never send a (possibly stale) token to these.
const isAuthEndpoint = (url) => {
  const path = normalize(url);
  return path.startsWith('token/') || path.startsWith('auth/');
};

// Public GET endpoints: send the token if we have one (so admins can see more),
// but if the server rejects it with 401, retry once anonymously.
const OPTIONAL_AUTH_PATHS = ['locations/'];
const isOptionalAuth = (config) =>
  (config?.method || 'get').toLowerCase() === 'get' &&
  OPTIONAL_AUTH_PATHS.some((p) => normalize(config?.url).startsWith(p));

const api = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')}/`,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const access = readTokens()?.access;
  if (access && !config._skipAuth && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let refreshRequest;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status;
    const refresh = readTokens()?.refresh;

    if (status === 401 && config && isOptionalAuth(config)) {
      // Public endpoint rejected our token: retry once without it, and don't log the user out.
      if (!config._anon) {
        config._anon = true;
        config._skipAuth = true;
        delete config.headers.Authorization;
        return api(config);
      }
    } else if (status === 401 && config && !isAuthEndpoint(config.url) && !config._retry && refresh) {
      config._retry = true;
      try {
        if (!refreshRequest) {
          refreshRequest = api.post('token/refresh/', { refresh }).then(({ data }) => {
            // A pending refresh must not restore a session after logout.
            if (readTokens()?.refresh !== refresh) throw new Error('Session ended. Please sign in again.');
            localStorage.setItem(TOKEN_KEY, JSON.stringify({ ...readTokens(), refresh, ...data }));
            return data.access;
          }).finally(() => { refreshRequest = null; });
        }
        config.headers.Authorization = `Bearer ${await refreshRequest}`;
        return api(config);
      } catch (refreshError) {
        clearSession();
        throw refreshError;
      }
    } else if (status === 401 && config && !isAuthEndpoint(config.url)) {
      clearSession();
    }

    const body = error.response?.data;
    if (typeof body?.detail === 'string') error.message = body.detail;
    else if (body && typeof body === 'object') {
      error.message = Object.entries(body).map(([field, messages]) =>
        `${field === 'non_field_errors' ? '' : `${field}: `}${Array.isArray(messages) ? messages.join(' ') : JSON.stringify(messages)}`
      ).join('\n');
    }
    else if (!error.response) error.message = 'Cannot reach the backend. Check that the Django server is running.';
    throw error;
  },
);

// Existing screens expect arrays; Django list endpoints return paginated objects.
export const getList = async (path) => {
  const items = [];
  let next = path;
  while (next) {
    const { data } = await api.get(next);
    if (Array.isArray(data)) return [...items, ...data];
    items.push(...data.results);
    // Keep subsequent pages on the configured API origin, including through proxies.
    next = data.next ? `${path.split('?')[0]}${new URL(data.next, window.location.origin).search}` : null;
  }
  return items;
};

export default api;