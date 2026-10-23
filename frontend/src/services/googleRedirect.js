// Complete the redirect used by the Django Google OAuth callback.
export function consumeGoogleRedirect(browser, tokenKey) {
  const url = new URL(browser.location.href);
  const access = url.searchParams.get('access');
  const refresh = url.searchParams.get('refresh');
  if (!url.searchParams.has('access') && !url.searchParams.has('refresh')) return;

  // Never trust the role supplied in the URL; users/me provides the user profile.
  url.searchParams.delete('access');
  url.searchParams.delete('refresh');
  url.searchParams.delete('role');
  browser.history.replaceState(browser.history.state, '', `${url.pathname}${url.search}${url.hash}`);

  if (access && refresh) {
    browser.localStorage.setItem(tokenKey, JSON.stringify({ access, refresh }));
  }
}