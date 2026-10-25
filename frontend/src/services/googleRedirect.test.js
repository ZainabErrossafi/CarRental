import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeGoogleRedirect } from './googleRedirect.js';

function browserAt(href) {
  const values = new Map();
  const browser = {
    location: { href },
    localStorage: { setItem: (key, value) => values.set(key, value) },
    history: {
      state: { existing: true },
      replaceState(state, title, path) {
        this.replaced = { state, path };
        browser.location.href = new URL(path, href).href;
      },
    },
  };
  return { browser, values };
}

test('Google callback saves both tokens and removes credentials before profile loading', () => {
  const { browser, values } = browserAt('https://localhost:8443/?access=access-token&refresh=refresh-token&role=admin&lang=fr#cars');
  consumeGoogleRedirect(browser, 'session');
  assert.deepEqual(JSON.parse(values.get('session')), { access: 'access-token', refresh: 'refresh-token', loginMethod: 'google' });
  assert.equal(browser.history.replaced.path, '/?lang=fr#cars');
  assert.deepEqual(browser.history.replaced.state, { existing: true });
  // StrictMode and subsequent profile reads must preserve the established session.
  consumeGoogleRedirect(browser, 'session');
  assert.deepEqual(JSON.parse(values.get('session')), { access: 'access-token', refresh: 'refresh-token', loginMethod: 'google' });
});

test('incomplete callbacks are cleaned without replacing the existing session', () => {
  const { browser, values } = browserAt('https://localhost:8443/?access=partial&role=admin');
  values.set('session', 'existing');
  consumeGoogleRedirect(browser, 'session');
  assert.equal(values.get('session'), 'existing');
  assert.equal(browser.history.replaced.path, '/');
});

test('ordinary visits leave the URL and stored session unchanged', () => {
  const { browser, values } = browserAt('https://localhost:8443/vehicles?category=1');
  values.set('session', 'existing');
  consumeGoogleRedirect(browser, 'session');
  assert.equal(values.get('session'), 'existing');
  assert.equal(browser.history.replaced, undefined);
});

test('current backend fragment callback establishes the session', () => {
  const { browser, values } = browserAt('https://localhost:8443/?lang=fr#access=access-token&refresh=refresh-token');
  consumeGoogleRedirect(browser, 'session');
  assert.deepEqual(JSON.parse(values.get('session')), { access: 'access-token', refresh: 'refresh-token', loginMethod: 'google' });
  assert.equal(browser.history.replaced.path, '/?lang=fr');
  consumeGoogleRedirect(browser, 'session');
  assert.equal(values.size, 1);
});

test('incomplete fragment is removed without overwriting an existing session', () => {
  const { browser, values } = browserAt('https://localhost:8443/#access=partial&role=admin');
  values.set('session', 'existing');
  consumeGoogleRedirect(browser, 'session');
  assert.equal(values.get('session'), 'existing');
  assert.equal(browser.history.replaced.path, '/');
});
