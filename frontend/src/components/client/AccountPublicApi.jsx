import { useRef, useState, useEffect } from "react";
import { KeyRound, Copy, BookOpen } from "lucide-react";
import api from "../../services/api.js";

export default function AccountPublicApi({ onBusy }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inFlight = useRef(false);
  const runUpdate = async (action, successMessage, errorMessage) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    onBusy(true);
    setError("");
    setSuccess("");
    try {
      await action();
      setSuccess(successMessage);
    } catch (err) {
      setError(err.message || errorMessage);
    } finally {
      inFlight.current = false;
      setBusy(false);
      onBusy(false);
    }
  };

  const [apiKey, setApiKey] = useState("");
  const [apiKeyInfo, setApiKeyInfo] = useState(null);
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);
  const loadApiKey = async (signal) => {
    setBusy(true);
    onBusy(true);
    setError("");
    setSuccess("");
    setApiKeyLoaded(false);
    try {
      const { data } = await api.get("users/api-key/", { signal });
      if (!signal?.aborted) {
        setApiKeyInfo(data);
        setApiKeyLoaded(true);
      }
    } catch (err) {
      if (signal?.aborted) return;
      if (err.response?.status === 404) {
        setApiKeyInfo(null);
        setApiKeyLoaded(true);
      } else setError(err.message || "Could not load API key status.");
    } finally {
      if (!signal?.aborted) {
        setBusy(false);
        onBusy(false);
      }
    }
  };
  const generateApiKey = () =>
    runUpdate(
      async () => {
        const { data } = await api.post("users/api-key/");
        const { key, ...metadata } = data;
        setApiKey(key);
        setApiKeyInfo(metadata);
      },
      "API key generated. Copy it now; it will only be shown once.",
      "Could not generate API key.",
    );
  const revokeApiKey = () =>
    runUpdate(
      async () => {
        await api.delete("users/api-key/");
        setApiKey("");
        setApiKeyInfo((current) => ({ ...current, is_active: false }));
      },
      "API key revoked.",
      "Could not revoke API key.",
    );
  const copyApiKey = async () => {
    setError("");
    setSuccess("");
    try {
      await navigator.clipboard.writeText(apiKey);
      setSuccess("API key copied.");
    } catch {
      setError("Could not copy the key. Select and copy it manually.");
    }
  };
  useEffect(() => {
    const controller = new AbortController();
    loadApiKey(controller.signal);
    return () => {
      controller.abort();
      onBusy(false);
    };
  }, []);
  return (
    <>
      <section className="account-settings-api" aria-label="Public API key generator">
        <div className="account-settings-api-heading">
          <h3>Public API</h3>
          <a
            className="account-settings-api-link"
            href={`${api.defaults.baseURL}public/v1/docs/`}
            aria-label="API documentation (opens in a new tab)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BookOpen size={16} aria-hidden="true" />
            Documentation ↗
          </a>
        </div>
        {busy && !apiKeyLoaded && <p role="status">Loading API key status…</p>}
        {!busy && !apiKeyLoaded && (
          <button className="account-settings-save" type="button" onClick={() => loadApiKey()}>
            Retry loading status
          </button>
        )}
        {apiKeyLoaded && (
          <p role="status">
            {apiKeyInfo
              ? `Key ${apiKeyInfo.prefix}… · ${!apiKeyInfo.is_active ? "Revoked" : apiKeyInfo.is_expired ? "Expired" : "Active"} · Expires ${new Date(apiKeyInfo.expires_at).toLocaleDateString()}`
              : "You do not have an API key yet."}
          </p>
        )}
        <div className="account-settings-api-actions">
          <button
            className="account-settings-save"
            type="button"
            disabled={busy || !apiKeyLoaded}
            onClick={generateApiKey}
          >
            <KeyRound size={16} aria-hidden="true" />
            {busy && apiKeyLoaded ? "Updating…" : apiKeyInfo?.is_active ? "Replace key" : "Generate key"}
          </button>
          {apiKeyLoaded && apiKeyInfo?.is_active && (
            <button
              className="account-settings-save account-settings-docs"
              type="button"
              disabled={busy}
              onClick={revokeApiKey}
            >
              Revoke key
            </button>
          )}
        </div>
        {apiKey && (
          <>
            <label htmlFor="account-api-key">Your API key</label>
            <div className="account-settings-api-copy">
              <input
                id="account-api-key"
                aria-label="Your API key"
                readOnly
                value={apiKey}
                spellCheck={false}
                autoComplete="off"
                onFocus={(event) => event.target.select()}
              />
              <button className="account-settings-save" type="button" disabled={busy} onClick={copyApiKey}>
                <Copy size={16} aria-hidden="true" />
                Copy
              </button>
            </div>
            <small>Copy this key before closing settings. It is not saved in your browser.</small>
          </>
        )}
      </section>
      {error && (
        <p className="account-settings-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="account-settings-success" role="status">
          {success}
        </p>
      )}
    </>
  );
}
