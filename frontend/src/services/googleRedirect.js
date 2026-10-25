// Complete the redirect used by the Django Google OAuth callback.
export function consumeGoogleRedirect(browser, tokenKey) {
  const url = new URL(browser.location.href);
  const fragment = new URLSearchParams(url.hash.slice(1));
  const hasTokens = (params) => params.has('access') || params.has('refresh');
  const fragmentCallback = hasTokens(fragment);
  const queryCallback = hasTokens(url.searchParams);
  if (!fragmentCallback && !queryCallback) return;

  const params = fragmentCallback ? fragment : url.searchParams;
  const access = params.get('access');
  const refresh = params.get('refresh');
  // The authenticated profile determines the role, never the redirect URL.
  for (const key of ['access', 'refresh', 'role']) {
    if (queryCallback) url.searchParams.delete(key);
    if (fragmentCallback) fragment.delete(key);
  }
  if (fragmentCallback) url.hash = fragment.toString();
  browser.history.replaceState(browser.history.state, '', `${url.pathname}${url.search}${url.hash}`);

  if (access && refresh) {
    browser.localStorage.setItem(tokenKey, JSON.stringify({ access, refresh, loginMethod: "google" }));
    return true;
  }
}
