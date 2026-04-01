const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const defaultSocketUrl = 'http://localhost:5000';
const configuredSocketUrl = process.env.REACT_APP_SOCKET_URL || defaultSocketUrl;

export const SOCKET_URL = trimTrailingSlash(configuredSocketUrl);
export const API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_API_BASE_URL || `${SOCKET_URL}/api`
);
