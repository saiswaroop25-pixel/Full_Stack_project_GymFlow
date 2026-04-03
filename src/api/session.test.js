import {
  SESSION_NOTICE_KEY,
  TOKEN_KEY,
  USER_KEY,
  clearSession,
  consumeSessionNotice,
  persistSession,
  readStoredToken,
  readStoredUser,
  setSessionNotice,
  shouldHandleUnauthorized,
} from './session';

describe('session helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('persists and clears the current session', () => {
    const user = { id: 'u1', role: 'USER' };

    persistSession('token-123', user);

    expect(readStoredToken()).toBe('token-123');
    expect(readStoredUser()).toEqual(user);

    clearSession();

    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(window.localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('stores a one-time session notice', () => {
    setSessionNotice('Session expired');

    expect(window.sessionStorage.getItem(SESSION_NOTICE_KEY)).toBe('Session expired');
    expect(consumeSessionNotice()).toBe('Session expired');
    expect(consumeSessionNotice()).toBe('');
  });

  it('ignores 401s from auth forms and public auth pages', () => {
    expect(
      shouldHandleUnauthorized({
        status: 401,
        requestUrl: '/auth/login',
        pathname: '/login',
      })
    ).toBe(false);

    expect(
      shouldHandleUnauthorized({
        status: 401,
        requestUrl: '/workouts',
        pathname: '/login',
      })
    ).toBe(false);

    expect(
      shouldHandleUnauthorized({
        status: 401,
        requestUrl: '/workouts',
        pathname: '/app/dashboard',
      })
    ).toBe(true);
  });
});
