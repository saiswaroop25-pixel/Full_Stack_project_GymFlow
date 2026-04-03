export const TOKEN_KEY = 'gymflow_token';
export const USER_KEY = 'gymflow_user';
export const SESSION_NOTICE_KEY = 'gymflow_session_notice';

const AUTH_PATHS = new Set(['/login', '/register']);
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

const getStorage = (storageName) => {
  if (typeof window === 'undefined') return null;
  return window[storageName] || null;
};

export const readStoredToken = () => getStorage('localStorage')?.getItem(TOKEN_KEY) || null;

export const readStoredUser = () => {
  const storage = getStorage('localStorage');
  if (!storage) return null;

  try {
    const raw = storage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    storage.removeItem(USER_KEY);
    return null;
  }
};

export const persistSession = (token, user) => {
  const storage = getStorage('localStorage');
  if (!storage) return;

  if (token) {
    storage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearSession = () => {
  const storage = getStorage('localStorage');
  if (!storage) return;

  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
};

export const setSessionNotice = (message) => {
  const storage = getStorage('sessionStorage');
  storage?.setItem(SESSION_NOTICE_KEY, message);
};

export const consumeSessionNotice = () => {
  const storage = getStorage('sessionStorage');
  if (!storage) return '';

  const message = storage.getItem(SESSION_NOTICE_KEY) || '';
  if (message) storage.removeItem(SESSION_NOTICE_KEY);
  return message;
};

export const isPublicAuthPath = (pathname = '') => AUTH_PATHS.has(pathname);

export const shouldHandleUnauthorized = ({ status, requestUrl = '', pathname = '' }) => {
  if (status !== 401) return false;
  if (AUTH_ENDPOINTS.some((endpoint) => requestUrl.includes(endpoint))) return false;
  if (isPublicAuthPath(pathname)) return false;
  return true;
};

export const handleUnauthorizedSession = (message = 'Your session expired. Please sign in again.') => {
  clearSession();
  setSessionNotice(message);

  if (typeof window !== 'undefined' && !isPublicAuthPath(window.location.pathname)) {
    window.location.assign('/login');
  }
};
